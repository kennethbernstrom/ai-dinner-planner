import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { prisma } from './db'
import { PlanShare } from '@/types/sharing'
import { SharePlanInput } from '@/lib/validation/schemas'
import { WeeklyPlan } from '@/types/plan'
import { ApiResponse } from '@/types/api'

export function useSharingApi() {
  const { userId } = useAuth()

  return useMemo(() => ({
    share: async (
      planId: string,
      input: SharePlanInput
    ): Promise<ApiResponse<PlanShare>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        // Verify plan belongs to user
        const plan = await prisma.weeklyPlan.findFirst({
          where: {
            id: planId,
            clerkUserId: userId,
          },
        })

        if (!plan) {
          return { error: 'Plan not found' }
        }

        // Determine the clerkUserId to share with
        let shareUserId = input.clerkUserId
        if (!shareUserId && input.email) {
          // In a real app, you'd look up the user by email using Clerk
          // For now, we'll require clerkUserId
          return { error: 'clerkUserId is required' }
        }

        if (!shareUserId) {
          return { error: 'Either clerkUserId or email must be provided' }
        }

        // Create or update share
        const share = await prisma.planShare.upsert({
          where: {
            planId_clerkUserId: {
              planId,
              clerkUserId: shareUserId,
            },
          },
          create: {
            planId,
            clerkUserId: shareUserId,
            role: input.role || 'viewer',
          },
          update: {
            role: input.role || 'viewer',
          },
        })

        return { data: share as PlanShare }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to share plan',
        }
      }
    },

    listShared: async (): Promise<ApiResponse<WeeklyPlan[]>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        // Get plans shared with this user
        const shares = await prisma.planShare.findMany({
          where: { clerkUserId: userId },
          include: {
            plan: true,
          },
        })

        const plans = shares.map((share) => share.plan)

        return { data: plans as WeeklyPlan[] }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch shared plans',
        }
      }
    },

    accept: async (planId: string): Promise<ApiResponse<PlanShare>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        // Find share for this user
        const share = await prisma.planShare.findFirst({
          where: {
            planId,
            clerkUserId: userId,
          },
        })

        if (!share) {
          return { error: 'Share not found' }
        }

        // Accepting a share doesn't change the database, just returns it
        return { data: share as PlanShare }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to accept share',
        }
      }
    },

    removeShare: async (
      planId: string,
      shareUserId: string
    ): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        // Verify plan belongs to user (only owner can remove shares)
        const plan = await prisma.weeklyPlan.findFirst({
          where: {
            id: planId,
            clerkUserId: userId,
          },
        })

        if (!plan) {
          return { error: 'Plan not found or you do not have permission' }
        }

        await prisma.planShare.delete({
          where: {
            planId_clerkUserId: {
              planId,
              clerkUserId: shareUserId,
            },
          },
        })

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to remove share',
        }
      }
    },
  }), [userId])
}

