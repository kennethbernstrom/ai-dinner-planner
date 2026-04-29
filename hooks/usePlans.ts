import { useEffect, useCallback } from 'react'
import { usePlansApi } from '@/lib/api/plans'
import { usePlansStore } from '@/lib/stores'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import {
  WeeklyPlan,
  PlanWithMeals,
  PlanMeal,
  CreatePlanInput,
  UpdatePlanInput,
  AddMealToPlanInput,
  UpdatePlanMealInput,
} from '@/types/plan'
import { ApiResponse } from '@/types/api'

export function usePlans() {
  const { familyId, hasWritePermission } = useCurrentFamily()
  const api = usePlansApi(familyId)
  
  // Get state and actions from Zustand store
  const plans = usePlansStore((state) => state.plans)
  const loading = usePlansStore((state) => state.loading)
  const error = usePlansStore((state) => state.error)
  const setPlans = usePlansStore((state) => state.setPlans)
  const addPlanToStore = usePlansStore((state) => state.addPlan)
  const updatePlanInStore = usePlansStore((state) => state.updatePlan)
  const removePlanFromStore = usePlansStore((state) => state.removePlan)
  const setPlanWithMeals = usePlansStore((state) => state.setPlanWithMeals)
  const setLoading = usePlansStore((state) => state.setLoading)
  const setError = usePlansStore((state) => state.setError)

  const fetchPlans = useCallback(async () => {
    // Don't fetch if no family is set
    if (!familyId) {
      setPlans([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const response = await api.list()
    if (response.error) {
      setError(response.error)
      setPlans([])
    } else if (response.data) {
      setPlans(response.data)
    }
    setLoading(false)
  }, [api, familyId, setLoading, setError, setPlans])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const createPlan = useCallback(
    async (input: CreatePlanInput): Promise<ApiResponse<WeeklyPlan>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to create plans'
        setError(error)
        return { error }
      }
      
      const response = await api.create(input)
      if (response.error) {
        setError(response.error)
        return response
      }
      if (response.data) {
        addPlanToStore(response.data)
      }
      return response
    },
    [api, setError, addPlanToStore, hasWritePermission]
  )

  const updatePlan = useCallback(
    async (id: number, input: UpdatePlanInput): Promise<ApiResponse<WeeklyPlan>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to update plans'
        setError(error)
        return { error }
      }
      
      const response = await api.update(id, input)
      if (response.error) {
        setError(response.error)
        return response
      }
      if (response.data) {
        updatePlanInStore(id, response.data)
      }
      return response
    },
    [api, setError, updatePlanInStore, hasWritePermission]
  )

  const deletePlan = useCallback(
    async (id: number): Promise<ApiResponse<void>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to delete plans'
        setError(error)
        return { error }
      }
      
      const response = await api.delete(id)
      if (response.error) {
        setError(response.error)
        return response
      }
      removePlanFromStore(id)
      return response
    },
    [api, setError, removePlanFromStore, hasWritePermission]
  )

  const getPlan = useCallback(
    async (id: number): Promise<ApiResponse<PlanWithMeals>> => {
      setError(null)
      const response = await api.get(id)
      if (response.data) {
        setPlanWithMeals(id, response.data)
      }
      return response
    },
    [api, setError, setPlanWithMeals]
  )

  const duplicatePlan = useCallback(
    async (id: number): Promise<ApiResponse<WeeklyPlan>> => {
      setError(null)
      const response = await api.duplicate(id)
      if (response.error) {
        setError(response.error)
        return response
      }
      if (response.data) {
        addPlanToStore(response.data)
      }
      return response
    },
    [api, setError, addPlanToStore]
  )

  const addMealToPlan = useCallback(
    async (
      planId: number,
      input: AddMealToPlanInput
    ): Promise<ApiResponse<PlanMeal>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to add meals to plans'
        setError(error)
        return { error }
      }
      
      const response = await api.addMeal(planId, input)
      if (response.error) {
        setError(response.error)
        return response
      }
      return response
    },
    [api, setError, hasWritePermission]
  )

  const getPlanByWeekStartDate = useCallback(
    async (weekStartDate: Date): Promise<ApiResponse<PlanWithMeals | null>> => {
      setError(null)
      const response = await api.getByWeekStartDate(weekStartDate)
      if (response.error) {
        setError(response.error)
        return response
      }
      return response
    },
    [api, setError]
  )

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    getPlan,
    duplicatePlan,
    addMealToPlan,
    getPlanByWeekStartDate,
  }
}

