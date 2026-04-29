import { Meal } from './meal'

// Re-export Zod types for convenience
export type {
  CreatePlanInput,
  UpdatePlanInput,
  AddMealToPlanInput,
  UpdatePlanMealInput,
} from '@/lib/validation/schemas'

export interface WeeklyPlan {
  id: number
  familyId: number
  clerkUserId: string
  name: string
  weekStartDate: Date
  visibility: 'private' | 'shared'
  createdAt: Date
  updatedAt: Date
}

export interface PlanMeal {
  id: number
  planId: number
  mealId: number
  dayOfWeek: number | null // 0-6 (Monday-Sunday), null if not yet scheduled
  mealSlot: 'breakfast' | 'lunch' | 'dinner'
  createdAt: Date
  meal?: Meal
}

export interface PlanWithMeals extends WeeklyPlan {
  planMeals: PlanMeal[]
}

