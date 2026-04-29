import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMealsApi } from '@/lib/api/meals'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { TopMealRank, TopMealsScope } from '@/types/metrics'

export function useTopPlannedMeals(scope: TopMealsScope) {
  const { familyId } = useCurrentFamily()
  const api = useMealsApi(familyId)
  const [topMeals, setTopMeals] = useState<TopMealRank[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentYear = useMemo(() => new Date().getFullYear(), [])

  const fetchTopMeals = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await api.getTopPlannedMeals({
      scope,
      year: scope === 'year' ? currentYear : undefined,
      limit: 10,
    })

    if (response.error) {
      setError(response.error)
      setTopMeals([])
    } else {
      setTopMeals(response.data || [])
    }

    setLoading(false)
  }, [api, currentYear, scope])

  useEffect(() => {
    fetchTopMeals()
  }, [fetchTopMeals])

  return {
    topMeals,
    loading,
    error,
    currentYear,
    fetchTopMeals,
  }
}
