// Re-export Zod types for convenience
export type {
  CreateFamilyInput,
  JoinFamilyInput,
  UpdateFamilyMemberInput,
} from '@/lib/validation/schemas'

export interface Family {
  id: number
  name: string
  inviteCode: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface FamilyMember {
  id: number
  familyId: number
  clerkUserId: string
  role: 'admin' | 'member'
  permissions: 'read' | 'write'
  joinedAt: Date
}

export interface FamilyWithMembers extends Family {
  members: FamilyMember[]
}

export interface CurrentUserFamily {
  family: Family
  membership: FamilyMember
}

