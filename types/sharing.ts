// Re-export Zod types for convenience
export type { SharePlanInput } from '@/lib/validation/schemas'

export interface PlanShare {
  id: number
  planId: number
  clerkUserId: string
  role: 'owner' | 'editor' | 'viewer'
  createdAt: Date
}

export interface InviteLink {
  planId: number
  shareToken: string
  expiresAt?: Date
}

