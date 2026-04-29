import { useState, useCallback } from 'react'
import { useSharingApi } from '@/lib/api/sharing'
import { SharePlanInput } from '@/types/sharing'
import { WeeklyPlan } from '@/types/plan'
import { ApiResponse } from '@/types/api'

export function useSharing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sharedPlans, setSharedPlans] = useState<WeeklyPlan[]>([])
  const api = useSharingApi()

  const sharePlan = useCallback(
    async (planId: number, input: SharePlanInput): Promise<ApiResponse<void>> => {
      setLoading(true)
      setError(null)
      const response = await api.share(planId, input)
      if (response.error) {
        setError(response.error)
      }
      setLoading(false)
      return response
    },
    [api]
  )

  const fetchSharedPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    const response = await api.listShared()
    if (response.error) {
      setError(response.error)
      setSharedPlans([])
    } else if (response.data) {
      setSharedPlans(response.data)
    }
    setLoading(false)
  }, [api])

  const acceptInvite = useCallback(
    async (planId: number): Promise<ApiResponse<void>> => {
      setLoading(true)
      setError(null)
      const response = await api.accept(planId)
      if (response.error) {
        setError(response.error)
      }
      setLoading(false)
      return response
    },
    [api]
  )

  const removeShare = useCallback(
    async (planId: number, userId: string): Promise<ApiResponse<void>> => {
      setLoading(true)
      setError(null)
      const response = await api.removeShare(planId, userId)
      if (response.error) {
        setError(response.error)
      }
      setLoading(false)
      return response
    },
    [api]
  )

  return {
    loading,
    error,
    sharedPlans,
    sharePlan,
    fetchSharedPlans,
    acceptInvite,
    removeShare,
  }
}

