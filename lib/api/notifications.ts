import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { prisma } from './db'
import { ApiResponse } from '@/types/api'
import { registerPushTokenSchema, type PushTokenRegistration } from '@/lib/validation/schemas'

export function useNotificationsApi() {
  const { userId } = useAuth()

  return useMemo(() => ({
    register: async (
      input: PushTokenRegistration
    ): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        // Validate input with Zod
        const validatedInput = registerPushTokenSchema.parse(input)

        // Upsert push token (update if exists, create if not)
        await prisma.userPushToken.upsert({
          where: {
            clerkUserId_deviceId: {
              clerkUserId: userId,
              deviceId: validatedInput.deviceId || '',
            },
          },
          create: {
            clerkUserId: userId,
            expoPushToken: validatedInput.expoPushToken,
            deviceId: validatedInput.deviceId,
          },
          update: {
            expoPushToken: validatedInput.expoPushToken,
          },
        })

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to register push token',
        }
      }
    },
  }), [userId])
}

