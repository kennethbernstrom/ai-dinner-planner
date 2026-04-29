import { create } from 'zustand'
import { Meal } from '@/types/meal'

interface MealsState {
  // State
  meals: Meal[]
  mealsById: Map<number, Meal>
  loading: boolean
  error: string | null

  // Actions
  setMeals: (meals: Meal[]) => void
  addMeal: (meal: Meal) => void
  updateMeal: (id: number, meal: Meal) => void
  removeMeal: (id: number) => void
  setMealById: (id: number, meal: Meal) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  meals: [],
  mealsById: new Map(),
  loading: false,
  error: null,
}

export const useMealsStore = create<MealsState>((set) => ({
  ...initialState,

  setMeals: (meals) => set(() => {
    const mealsById = new Map<number, Meal>()
    meals.forEach((meal) => mealsById.set(meal.id, meal))
    return { meals, mealsById }
  }),

  addMeal: (meal) => set((state) => {
    const newMealsById = new Map(state.mealsById)
    newMealsById.set(meal.id, meal)
    return {
      meals: [meal, ...state.meals],
      mealsById: newMealsById,
    }
  }),

  updateMeal: (id, meal) => set((state) => {
    const newMealsById = new Map(state.mealsById)
    newMealsById.set(id, meal)
    return {
      meals: state.meals.map((m) => (m.id === id ? meal : m)),
      mealsById: newMealsById,
    }
  }),

  removeMeal: (id) => set((state) => {
    const newMealsById = new Map(state.mealsById)
    newMealsById.delete(id)
    return {
      meals: state.meals.filter((m) => m.id !== id),
      mealsById: newMealsById,
    }
  }),

  setMealById: (id, meal) => set((state) => {
    const newMealsById = new Map(state.mealsById)
    newMealsById.set(id, meal)
    
    // Also update the meal in the meals list if it exists
    const mealIndex = state.meals.findIndex((m) => m.id === id)
    const newMeals = [...state.meals]
    if (mealIndex >= 0) {
      newMeals[mealIndex] = meal
    } else {
      newMeals.unshift(meal)
    }

    return {
      mealsById: newMealsById,
      meals: newMeals,
    }
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

