import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { supabase } from '@/lib/supabase'
import type { CreateFamilyInput, JoinFamilyInput, UpdateFamilyMemberInput } from '@/lib/validation/schemas'
import type { Family, FamilyMember, FamilyWithMembers, CurrentUserFamily } from '@/types/family'

// Generate a random 8-character invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Helper function to transform database row to Family type
function transformFamily(row: any): Family {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// Helper function to transform database row to FamilyMember type
function transformFamilyMember(row: any): FamilyMember {
  return {
    id: row.id,
    familyId: row.family_id,
    clerkUserId: row.clerk_user_id,
    role: row.role as 'admin' | 'member',
    permissions: row.permissions as 'read' | 'write',
    joinedAt: new Date(row.joined_at),
  }
}

export function useFamiliesApi() {
  const { userId } = useAuth()

  return useMemo(() => ({
    createFamily: async (data: CreateFamilyInput): Promise<Family> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        const inviteCode = generateInviteCode()

        // Create family
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .insert({
            name: data.name,
            invite_code: inviteCode,
            created_by: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (familyError) {
          console.log('Error creating family:', familyError)
          throw familyError
        }

        if (!familyData) {
          throw new Error('Failed to create family')
        }

        // Add creator as admin member
        const { error: memberError } = await supabase
          .from('family_members')
          .insert({
            family_id: familyData.id,
            clerk_user_id: userId,
            role: 'admin',
            permissions: 'write',
            joined_at: new Date().toISOString(),
          })

        if (memberError) {
          console.log('Error creating family member:', memberError)
          // Try to delete the family if member creation failed
          await supabase.from('families').delete().eq('id', familyData.id)
          throw memberError
        }

        return transformFamily(familyData)
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to create family')
      }
    },

    joinFamily: async (data: JoinFamilyInput): Promise<FamilyMember> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Find family by invite code
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .select('id')
          .eq('invite_code', data.inviteCode)
          .single()

        if (familyError || !familyData) {
          throw new Error('Family not found with that invite code')
        }

        // Check if user is already a member
        const { data: existingMember } = await supabase
          .from('family_members')
          .select('id')
          .eq('family_id', familyData.id)
          .eq('clerk_user_id', userId)
          .maybeSingle()

        if (existingMember) {
          throw new Error('You are already a member of this family')
        }

        // Add user as member with read permissions
        const { data: memberData, error: memberError } = await supabase
          .from('family_members')
          .insert({
            family_id: familyData.id,
            clerk_user_id: userId,
            role: 'member',
            permissions: 'read',
            joined_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (memberError) {
          console.log('Error joining family:', memberError)
          throw memberError
        }

        if (!memberData) {
          throw new Error('Failed to join family')
        }

        return transformFamilyMember(memberData)
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to join family')
      }
    },

    // Get all families the user belongs to
    getAllUserFamilies: async (): Promise<CurrentUserFamily[]> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Find all user's family memberships
        const { data: membershipsData, error: membershipsError } = await supabase
          .from('family_members')
          .select('*, families(*)')
          .eq('clerk_user_id', userId)
          .order('joined_at', { ascending: true })

        if (membershipsError) {
          console.log('Error getting user families:', membershipsError)
          throw membershipsError
        }

        if (!membershipsData || membershipsData.length === 0) {
          return []
        }

        return membershipsData.map((membership) => ({
          family: transformFamily(membership.families),
          membership: transformFamilyMember(membership),
        }))
      } catch (error) {
        if (error instanceof Error && error.message === 'Not authenticated') {
          throw error
        }
        throw error instanceof Error ? error : new Error('Failed to get user families')
      }
    },

    // Get a specific family by ID for the current user
    getCurrentUserFamily: async (familyId: number): Promise<CurrentUserFamily | null> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Find user's family membership for specific family
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members')
          .select('*, families(*)')
          .eq('clerk_user_id', userId)
          .eq('family_id', familyId)
          .single()

        if (membershipError) {
          if (membershipError.code === 'PGRST116') {
            // No membership found
            return null
          }
          console.log('Error getting current family:', membershipError)
          throw membershipError
        }

        if (!membershipData || !membershipData.families) {
          return null
        }

        return {
          family: transformFamily(membershipData.families),
          membership: transformFamilyMember(membershipData),
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Not authenticated') {
          throw error
        }
        throw error instanceof Error ? error : new Error('Failed to get current family')
      }
    },

    getFamilyById: async (familyId: number): Promise<FamilyWithMembers> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Verify user is a member of this family
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members')
          .select('id')
          .eq('family_id', familyId)
          .eq('clerk_user_id', userId)
          .single()

        if (membershipError || !membershipData) {
          throw new Error('You are not a member of this family')
        }

        // Get family with members
        const { data: familyData, error: familyError } = await supabase
          .from('families')
          .select('*')
          .eq('id', familyId)
          .single()

        if (familyError) {
          console.log('Error getting family:', familyError)
          throw familyError
        }

        if (!familyData) {
          throw new Error('Family not found')
        }

        // Get all members
        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', familyId)
          .order('joined_at', { ascending: true })

        if (membersError) {
          console.log('Error getting family members:', membersError)
          throw membersError
        }

        const family = transformFamily(familyData)
        const members = (membersData || []).map(transformFamilyMember)

        return {
          ...family,
          members,
        }
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to get family')
      }
    },

    getFamilyMembers: async (familyId: number): Promise<FamilyMember[]> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Verify user is a member of this family
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members')
          .select('id')
          .eq('family_id', familyId)
          .eq('clerk_user_id', userId)
          .single()

        if (membershipError || !membershipData) {
          throw new Error('You are not a member of this family')
        }

        // Get all members
        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', familyId)
          .order('joined_at', { ascending: true })

        if (membersError) {
          console.log('Error getting family members:', membersError)
          throw membersError
        }

        return (membersData || []).map(transformFamilyMember)
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to get family members')
      }
    },

    updateFamilyMember: async (
      familyId: number,
      memberId: number,
      data: UpdateFamilyMemberInput
    ): Promise<FamilyMember> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Verify user is an admin of this family
        const { data: userMembershipData, error: userMembershipError } = await supabase
          .from('family_members')
          .select('role')
          .eq('family_id', familyId)
          .eq('clerk_user_id', userId)
          .single()

        if (userMembershipError || !userMembershipData || userMembershipData.role !== 'admin') {
          throw new Error('You do not have permission to update members')
        }

        // Prepare update data
        const updateData: any = {}
        if (data.permissions) updateData.permissions = data.permissions
        if (data.role) updateData.role = data.role

        if (Object.keys(updateData).length === 0) {
          throw new Error('No valid updates provided')
        }

        // Update member
        const { data: memberData, error: memberError } = await supabase
          .from('family_members')
          .update(updateData)
          .eq('id', memberId)
          .eq('family_id', familyId)
          .select()
          .single()

        if (memberError) {
          console.log('Error updating family member:', memberError)
          throw memberError
        }

        if (!memberData) {
          throw new Error('Failed to update member')
        }

        return transformFamilyMember(memberData)
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to update family member')
      }
    },

    removeFamilyMember: async (familyId: number, memberId: number): Promise<void> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Verify user is an admin of this family
        const { data: userMembershipData, error: userMembershipError } = await supabase
          .from('family_members')
          .select('role')
          .eq('family_id', familyId)
          .eq('clerk_user_id', userId)
          .single()

        if (userMembershipError || !userMembershipData || userMembershipData.role !== 'admin') {
          throw new Error('You do not have permission to remove members')
        }

        // Get member to check if it's the last admin
        const { data: memberToRemove, error: getMemberError } = await supabase
          .from('family_members')
          .select('clerk_user_id, role')
          .eq('id', memberId)
          .eq('family_id', familyId)
          .single()

        if (getMemberError || !memberToRemove) {
          throw new Error('Member not found')
        }

        // If trying to remove themselves and they're an admin, check if they're the last admin
        if (memberToRemove.clerk_user_id === userId && memberToRemove.role === 'admin') {
          const { count } = await supabase
            .from('family_members')
            .select('*', { count: 'exact', head: true })
            .eq('family_id', familyId)
            .eq('role', 'admin')

          if (count && count <= 1) {
            throw new Error('Cannot remove the last admin from the family')
          }
        }

        // Delete member
        const { error: deleteError } = await supabase
          .from('family_members')
          .delete()
          .eq('id', memberId)
          .eq('family_id', familyId)

        if (deleteError) {
          console.log('Error removing family member:', deleteError)
          throw deleteError
        }
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to remove family member')
      }
    },

    leaveFamily: async (familyId: number): Promise<void> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Find user's membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members')
          .select('id, role')
          .eq('family_id', familyId)
          .eq('clerk_user_id', userId)
          .single()

        if (membershipError || !membershipData) {
          throw new Error('You are not a member of this family')
        }

        // If admin, check if they're the last admin
        if (membershipData.role === 'admin') {
          const { count } = await supabase
            .from('family_members')
            .select('*', { count: 'exact', head: true })
            .eq('family_id', familyId)
            .eq('role', 'admin')

          if (count && count <= 1) {
            throw new Error('Cannot leave as the last admin. Please promote another member first.')
          }
        }

        // Remove membership
        const { error: deleteError } = await supabase
          .from('family_members')
          .delete()
          .eq('id', membershipData.id)

        if (deleteError) {
          console.log('Error leaving family:', deleteError)
          throw deleteError
        }
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to leave family')
      }
    },

    regenerateInviteCode: async (familyId: number): Promise<Family> => {
      try {
        if (!userId) {
          throw new Error('Not authenticated')
        }

        // Verify user is an admin of this family
        const { data: membershipData, error: membershipError } = await supabase
          .from('family_members')
          .select('role')
          .eq('family_id', familyId)
          .eq('clerk_user_id', userId)
          .single()

        if (membershipError || !membershipData || membershipData.role !== 'admin') {
          throw new Error('You do not have permission to regenerate the invite code')
        }

        const newInviteCode = generateInviteCode()

        // Update family with new invite code
        const { data: familyData, error: updateError } = await supabase
          .from('families')
          .update({
            invite_code: newInviteCode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', familyId)
          .select()
          .single()

        if (updateError) {
          console.log('Error regenerating invite code:', updateError)
          throw updateError
        }

        if (!familyData) {
          throw new Error('Failed to regenerate invite code')
        }

        return transformFamily(familyData)
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to regenerate invite code')
      }
    },
  }), [userId])
}

