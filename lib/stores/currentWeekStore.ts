import { create } from 'zustand'
import { PlanWithMeals, PlanMeal } from '@/types/plan'

interface CurrentWeekState {
  // State
  currentWeekPlan: PlanWithMeals | null
  loading: boolean
  error: string | null

  // Actions
  setCurrentWeekPlan: (plan: PlanWithMeals | null) => void
  addMealToPlan: (planMeal: PlanMeal) => void
  updatePlanMeal: (planMealId: number, planMeal: PlanMeal) => void
  removePlanMeal: (planMealId: number) => void
  replacePlanMeal: (planMealId: number, planMeal: PlanMeal) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  currentWeekPlan: null,
  loading: false,
  error: null,
}

export const useCurrentWeekStore = create<CurrentWeekState>((set) => ({
  ...initialState,

  setCurrentWeekPlan: (plan) => set({ currentWeekPlan: plan }),

  addMealToPlan: (planMeal) => set((state) => {
    if (!state.currentWeekPlan) return state
    
    return {
      currentWeekPlan: {
        ...state.currentWeekPlan,
        planMeals: [...state.currentWeekPlan.planMeals, planMeal],
      },
    }
  }),

  updatePlanMeal: (planMealId, planMeal) => set((state) => {
    if (!state.currentWeekPlan) return state
    
    return {
      currentWeekPlan: {
        ...state.currentWeekPlan,
        planMeals: state.currentWeekPlan.planMeals.map((pm) =>
          pm.id === planMealId ? planMeal : pm
        ),
      },
    }
  }),

  removePlanMeal: (planMealId) => set((state) => {
    if (!state.currentWeekPlan) return state
    
    return {
      currentWeekPlan: {
        ...state.currentWeekPlan,
        planMeals: state.currentWeekPlan.planMeals.filter((pm) => pm.id !== planMealId),
      },
    }
  }),

  replacePlanMeal: (planMealId, planMeal) => set((state) => {
    if (!state.currentWeekPlan) return state
    
    return {
      currentWeekPlan: {
        ...state.currentWeekPlan,
        planMeals: state.currentWeekPlan.planMeals.map((pm) =>
          pm.id === planMealId ? planMeal : pm
        ),
      },
    }
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

