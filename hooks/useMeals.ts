import { useEffect, useCallback } from 'react'
import { useMealsApi } from '@/lib/api/meals'
import { useMealsStore } from '@/lib/stores'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { Meal, CreateMealInput, UpdateMealInput, MealPlanOccurrence } from '@/types/meal'
import { ApiResponse } from '@/types/api'

export function useMeals() {
  const { familyId, hasWritePermission } = useCurrentFamily()
  const api = useMealsApi(familyId)
  
  // Get state and actions from Zustand store
  const meals = useMealsStore((state) => state.meals)
  const loading = useMealsStore((state) => state.loading)
  const error = useMealsStore((state) => state.error)
  const setMeals = useMealsStore((state) => state.setMeals)
  const addMealToStore = useMealsStore((state) => state.addMeal)
  const updateMealInStore = useMealsStore((state) => state.updateMeal)
  const removeMealFromStore = useMealsStore((state) => state.removeMeal)
  const setMealById = useMealsStore((state) => state.setMealById)
  const setLoading = useMealsStore((state) => state.setLoading)
  const setError = useMealsStore((state) => state.setError)

  const fetchMeals = useCallback(async () => {
    // Don't fetch if no family is set
    if (!familyId) {
      setMeals([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.list()
      if (response.error) {
        setError(response.error)
        setMeals([])
      } else if (response.data) {
        setMeals(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meals')
      setMeals([])
    } finally {
      setLoading(false)
    }
  }, [api, familyId, setLoading, setError, setMeals])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  const createMeal = useCallback(
    async (input: CreateMealInput): Promise<ApiResponse<Meal>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to create meals'
        setError(error)
        return { error }
      }
      
      const response = await api.create(input)
      if (response.error) {
        setError(response.error)
        return response
      }
      if (response.data) {
        addMealToStore(response.data)
      }
      return response
    },
    [api, setError, addMealToStore, hasWritePermission]
  )

  const updateMeal = useCallback(
    async (id: number, input: UpdateMealInput): Promise<ApiResponse<Meal>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to update meals'
        setError(error)
        return { error }
      }
      
      const response = await api.update(id, input)
      if (response.error) {
        setError(response.error)
        return response
      }
      if (response.data) {
        updateMealInStore(id, response.data)
      }
      return response
    },
    [api, setError, updateMealInStore, hasWritePermission]
  )

  const deleteMeal = useCallback(
    async (id: number): Promise<ApiResponse<void>> => {
      setError(null)
      
      if (!hasWritePermission()) {
        const error = 'You do not have permission to delete meals'
        setError(error)
        return { error }
      }
      
      const response = await api.delete(id)
      if (response.error) {
        setError(response.error)
        return response
      }
      removeMealFromStore(id)
      return response
    },
    [api, setError, removeMealFromStore, hasWritePermission]
  )

  const getMeal = useCallback(
    async (id: number): Promise<ApiResponse<Meal>> => {
      setError(null)
      const response = await api.get(id)
      if (response.data) {
        setMealById(id, response.data)
      }
      return response
    },
    [api, setError, setMealById]
  )

  const getMealPlanOccurrences = useCallback(
    async (
      mealId: number
    ): Promise<ApiResponse<MealPlanOccurrence[]>> => {
      setError(null)
      return api.listPlanOccurrencesForMeal(mealId)
    },
    [api, setError]
  )

  const addFavorite = useCallback(
    async (mealId: number): Promise<ApiResponse<void>> => {
      setError(null)
      const response = await api.addFavorite(mealId)
      if (!response.error) {
        // Update the meal in store to reflect favorite status
        const meal = useMealsStore.getState().mealsById.get(mealId)
        if (meal) {
          updateMealInStore(mealId, { ...meal, isFavorite: true })
        }
      }
      return response
    },
    [api, setError, updateMealInStore]
  )

  const removeFavorite = useCallback(
    async (mealId: number): Promise<ApiResponse<void>> => {
      setError(null)
      const response = await api.removeFavorite(mealId)
      if (!response.error) {
        // Update the meal in store to reflect favorite status
        const meal = useMealsStore.getState().mealsById.get(mealId)
        if (meal) {
          updateMealInStore(mealId, { ...meal, isFavorite: false })
        }
      }
      return response
    },
    [api, setError, updateMealInStore]
  )

  return {
    meals,
    loading,
    error,
    fetchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    getMeal,
    getMealPlanOccurrences,
    addFavorite,
    removeFavorite,
  }
}

