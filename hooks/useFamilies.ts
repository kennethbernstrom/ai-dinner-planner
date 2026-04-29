import { useState, useCallback } from 'react'
import { useFamiliesApi } from '@/lib/api/families'
import type { CreateFamilyInput, JoinFamilyInput, UpdateFamilyMemberInput } from '@/lib/validation/schemas'
import type { Family, FamilyMember, FamilyWithMembers, CurrentUserFamily } from '@/types/family'

export function useFamilies() {
  const api = useFamiliesApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFamily = useCallback(
    async (data: CreateFamilyInput): Promise<Family | null> => {
      setLoading(true)
      setError(null)
      try {
        const family = await api.createFamily(data)
        return family
      } catch (err: any) {
        setError(err.message || 'Failed to create family')
        return null
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const joinFamily = useCallback(
    async (data: JoinFamilyInput): Promise<FamilyMember | null> => {
      setLoading(true)
      setError(null)
      try {
        const member = await api.joinFamily(data)
        return member
      } catch (err: any) {
        setError(err.message || 'Failed to join family')
        return null
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const getAllFamilies = useCallback(async (): Promise<CurrentUserFamily[] | null> => {
    setLoading(true)
    setError(null)
    try {
      const families = await api.getAllUserFamilies()
      return families
    } catch (err: any) {
      setError(err.message || 'Failed to get families')
      return null
    } finally {
      setLoading(false)
    }
  }, [api])

  const getCurrentFamily = useCallback(async (familyId: number): Promise<CurrentUserFamily | null> => {
    setLoading(true)
    setError(null)
    try {
      const family = await api.getCurrentUserFamily(familyId)
      return family
    } catch (err: any) {
      setError(err.message || 'Failed to get current family')
      return null
    } finally {
      setLoading(false)
    }
  }, [api])

  const getFamily = useCallback(
    async (familyId: number): Promise<FamilyWithMembers | null> => {
      setLoading(true)
      setError(null)
      try {
        const family = await api.getFamilyById(familyId)
        return family
      } catch (err: any) {
        setError(err.message || 'Failed to get family')
        return null
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const getMembers = useCallback(
    async (familyId: number): Promise<FamilyMember[] | null> => {
      setLoading(true)
      setError(null)
      try {
        const members = await api.getFamilyMembers(familyId)
        return members
      } catch (err: any) {
        setError(err.message || 'Failed to get family members')
        return null
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const updateMember = useCallback(
    async (
      familyId: number,
      memberId: number,
      data: UpdateFamilyMemberInput
    ): Promise<FamilyMember | null> => {
      setLoading(true)
      setError(null)
      try {
        const member = await api.updateFamilyMember(familyId, memberId, data)
        return member
      } catch (err: any) {
        setError(err.message || 'Failed to update family member')
        return null
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const removeMember = useCallback(
    async (familyId: number, memberId: number): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        await api.removeFamilyMember(familyId, memberId)
        return true
      } catch (err: any) {
        setError(err.message || 'Failed to remove family member')
        return false
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const leaveFamily = useCallback(
    async (familyId: number): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        await api.leaveFamily(familyId)
        return true
      } catch (err: any) {
        setError(err.message || 'Failed to leave family')
        return false
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  const regenerateInviteCode = useCallback(
    async (familyId: number): Promise<Family | null> => {
      setLoading(true)
      setError(null)
      try {
        const family = await api.regenerateInviteCode(familyId)
        return family
      } catch (err: any) {
        setError(err.message || 'Failed to regenerate invite code')
        return null
      } finally {
        setLoading(false)
      }
    },
    [api]
  )

  return {
    loading,
    error,
    createFamily,
    joinFamily,
    getAllFamilies,
    getCurrentFamily,
    getFamily,
    getMembers,
    updateMember,
    removeMember,
    leaveFamily,
    regenerateInviteCode,
  }
}

