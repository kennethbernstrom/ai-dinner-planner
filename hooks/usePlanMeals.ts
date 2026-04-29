import { useState, useCallback } from 'react'
import { usePlansApi } from '@/lib/api/plans'
import { useCurrentWeekStore, usePlansStore } from '@/lib/stores'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { PlanMeal, AddMealToPlanInput, UpdatePlanMealInput } from '@/types/plan'
import { ApiResponse } from '@/types/api'

export function usePlanMeals(planId: number) {
  const { familyId } = useCurrentFamily()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const api = usePlansApi(familyId)
  
  // Get store actions for real-time updates
  const currentWeekPlan = useCurrentWeekStore((state) => state.currentWeekPlan)
  const addMealToCurrentWeek = useCurrentWeekStore((state) => state.addMealToPlan)
  const updateMealInCurrentWeek = useCurrentWeekStore((state) => state.updatePlanMeal)
  const removeMealFromCurrentWeek = useCurrentWeekStore((state) => state.removePlanMeal)
  const setPlanWithMeals = usePlansStore((state) => state.setPlanWithMeals)

  const addMeal = useCallback(
    async (input: AddMealToPlanInput): Promise<ApiResponse<PlanMeal>> => {
      setLoading(true)
      setError(null)
      const response = await api.addMeal(planId, input)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        // Update current week store if this is the current week plan
        if (currentWeekPlan && currentWeekPlan.id === planId) {
          addMealToCurrentWeek(response.data)
        }
        // Refresh plan in plans store
        const planResponse = await api.get(planId)
        if (planResponse.data) {
          setPlanWithMeals(planId, planResponse.data)
        }
      }
      setLoading(false)
      return response
    },
    [api, planId, currentWeekPlan, addMealToCurrentWeek, setPlanWithMeals]
  )

  const updateMeal = useCallback(
    async (
      mealId: number,
      input: UpdatePlanMealInput
    ): Promise<ApiResponse<PlanMeal>> => {
      setLoading(true)
      setError(null)
      const response = await api.updateMeal(planId, mealId, input)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        // Update current week store if this is the current week plan
        if (currentWeekPlan && currentWeekPlan.id === planId) {
          updateMealInCurrentWeek(mealId, response.data)
        }
        // Refresh plan in plans store
        const planResponse = await api.get(planId)
        if (planResponse.data) {
          setPlanWithMeals(planId, planResponse.data)
        }
      }
      setLoading(false)
      return response
    },
    [api, planId, currentWeekPlan, updateMealInCurrentWeek, setPlanWithMeals]
  )

  const removeMeal = useCallback(
    async (mealId: number): Promise<ApiResponse<void>> => {
      setLoading(true)
      setError(null)
      const response = await api.removeMeal(planId, mealId)
      if (response.error) {
        setError(response.error)
      } else {
        // Refresh plan to get updated data
        const planResponse = await api.get(planId)
        if (planResponse.data) {
          setPlanWithMeals(planId, planResponse.data)
          // Update current week store if this is the current week plan
          if (currentWeekPlan && currentWeekPlan.id === planId) {
            useCurrentWeekStore.getState().setCurrentWeekPlan(planResponse.data)
          }
        }
      }
      setLoading(false)
      return response
    },
    [api, planId, currentWeekPlan, setPlanWithMeals]
  )

  const removePlanMeal = useCallback(
    async (planMealId: number): Promise<ApiResponse<void>> => {
      setLoading(true)
      setError(null)
      const response = await api.removePlanMeal(planId, planMealId)
      if (response.error) {
        setError(response.error)
      } else {
        // Update current week store if this is the current week plan
        if (currentWeekPlan && currentWeekPlan.id === planId) {
          removeMealFromCurrentWeek(planMealId)
        }
        // Refresh plan in plans store
        const planResponse = await api.get(planId)
        if (planResponse.data) {
          setPlanWithMeals(planId, planResponse.data)
        }
      }
      setLoading(false)
      return response
    },
    [api, planId, currentWeekPlan, removeMealFromCurrentWeek, setPlanWithMeals]
  )

  return {
    loading,
    error,
    addMeal,
    updateMeal,
    removeMeal,
    removePlanMeal,
  }
}

