import { useEffect, useCallback } from 'react'
import { usePlansApi } from '@/lib/api/plans'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { useCurrentWeekStore } from '@/lib/stores'
import { getWeekStartDate } from '@/lib/utils/date'

export function useCurrentWeekPlan() {
  const { familyId } = useCurrentFamily()
  const api = usePlansApi(familyId)
  
  // Get state and actions from Zustand store
  const plan = useCurrentWeekStore((state) => state.currentWeekPlan)
  const loading = useCurrentWeekStore((state) => state.loading)
  const error = useCurrentWeekStore((state) => state.error)
  const setCurrentWeekPlan = useCurrentWeekStore((state) => state.setCurrentWeekPlan)
  const setLoading = useCurrentWeekStore((state) => state.setLoading)
  const setError = useCurrentWeekStore((state) => state.setError)

  const fetchCurrentWeekPlan = useCallback(async () => {
    // Don't fetch if no family is set
    if (!familyId) {
      setCurrentWeekPlan(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const weekStart = getWeekStartDate(new Date())
    console.log('Fetching current week plan for week start:', weekStart.toISOString().split('T')[0])
    const response = await api.getByWeekStartDate(weekStart)
    console.log('Plan fetch response:', { 
      hasData: !!response.data, 
      error: response.error,
      planId: response.data?.id 
    })
    if (response.error) {
      setError(response.error)
      setCurrentWeekPlan(null)
    } else {
      setCurrentWeekPlan(response.data || null)
    }
    setLoading(false)
  }, [api, familyId, setLoading, setError, setCurrentWeekPlan])

  useEffect(() => {
    fetchCurrentWeekPlan()
  }, [fetchCurrentWeekPlan])

  return {
    plan,
    loading,
    error,
    refetch: fetchCurrentWeekPlan,
  }
}

