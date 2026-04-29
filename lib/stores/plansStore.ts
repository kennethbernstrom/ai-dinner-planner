import { create } from 'zustand'
import { WeeklyPlan, PlanWithMeals } from '@/types/plan'

interface PlansState {
  // State
  plans: WeeklyPlan[]
  plansById: Map<number, PlanWithMeals>
  loading: boolean
  error: string | null

  // Actions
  setPlans: (plans: WeeklyPlan[]) => void
  addPlan: (plan: WeeklyPlan) => void
  updatePlan: (id: number, plan: WeeklyPlan) => void
  removePlan: (id: number) => void
  setPlanWithMeals: (id: number, plan: PlanWithMeals) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  plans: [],
  plansById: new Map(),
  loading: false,
  error: null,
}

export const usePlansStore = create<PlansState>((set, get) => ({
  ...initialState,

  setPlans: (plans) => set({ plans }),

  addPlan: (plan) => set((state) => ({ 
    plans: [plan, ...state.plans] 
  })),

  updatePlan: (id, plan) => set((state) => ({
    plans: state.plans.map((p) => (p.id === id ? plan : p)),
    plansById: (() => {
      const newMap = new Map(state.plansById)
      const existing = newMap.get(id)
      if (existing) {
        newMap.set(id, { ...existing, ...plan })
      }
      return newMap
    })(),
  })),

  removePlan: (id) => set((state) => {
    const newPlansById = new Map(state.plansById)
    newPlansById.delete(id)
    return {
      plans: state.plans.filter((p) => p.id !== id),
      plansById: newPlansById,
    }
  }),

  setPlanWithMeals: (id, plan) => set((state) => {
    const newPlansById = new Map(state.plansById)
    newPlansById.set(id, plan)
    
    // Also update the plan in the plans list if it exists
    const planIndex = state.plans.findIndex((p) => p.id === id)
    const newPlans = [...state.plans]
    if (planIndex >= 0) {
      const { planMeals, ...planData } = plan
      newPlans[planIndex] = planData
    } else {
      const { planMeals, ...planData } = plan
      newPlans.unshift(planData)
    }

    return {
      plansById: newPlansById,
      plans: newPlans,
    }
  }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

