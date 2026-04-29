import { useState, useCallback } from 'react'
import { useUser } from '@clerk/clerk-expo'
import { onboardingSchema, type OnboardingData } from '@/lib/validation/schemas'
import { useFamiliesApi } from '@/lib/api/families'
import { useActiveFamilyStore } from '@/lib/stores'
import { ZodError } from 'zod'

export function useOnboarding() {
  const { user } = useUser()
  const api = useFamiliesApi()
  const setActiveFamilyId = useActiveFamilyStore((state) => state.setActiveFamilyId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveOnboardingData = useCallback(
    async (data: OnboardingData): Promise<boolean> => {
      if (!user) {
        setError('User not authenticated')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        // Validate data with Zod
        const validatedData = onboardingSchema.parse(data)

        // Create the family
        const family = await api.createFamily({
          name: validatedData.familyName,
        })

        // Set this as the active family
        if (family) {
          setActiveFamilyId(family.id)
        }

        // Store in Clerk user metadata
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            onboardingCompleted: true,
            dietaryPreferences: validatedData.dietaryPreferences,
            householdSize: validatedData.householdSize,
          },
        })
        
        // Reload user to ensure metadata is updated
        await user.reload()
        
        setLoading(false)
        return true
      } catch (err) {
        if (err instanceof ZodError) {
          setError(err.errors.map(e => e.message).join(', '))
        } else {
          setError(err instanceof Error ? err.message : 'Failed to save onboarding data')
        }
        setLoading(false)
        return false
      }
    },
    [user, api, setActiveFamilyId]
  )

  const isOnboardingComplete = useCallback((): boolean => {
    return user?.unsafeMetadata?.onboardingCompleted === true
  }, [user])

  return {
    loading,
    error,
    saveOnboardingData,
    isOnboardingComplete,
  }
}

