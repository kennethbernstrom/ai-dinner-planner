// Re-export Zod types for convenience
export type { CreateMealInput, UpdateMealInput, MealIngredientInput } from '@/lib/validation/schemas'

export interface MealIngredient {
  id: number
  mealId: number
  name: string
  quantity?: string | null
  unit?: string | null
  category?: string | null
}

export interface Meal {
  id: number
  familyId: number
  clerkUserId: string
  title: string
  description?: string | null
  instructions?: string | null
  imageUrl?: string | null
  tags?: string[] | null
  sourceUrl?: string | null
  ingredients?: MealIngredient[] | null
  isFavorite?: boolean
  createdAt: Date
  updatedAt: Date
}

/** One row linking this meal to a weekly plan, with resolved calendar date when scheduled. */
export interface MealPlanOccurrence {
  planMealId: number
  planId: number
  planName: string
  weekStartDate: Date
  scheduledDate: Date | null
  dayOfWeek: number | null
  mealSlot: 'breakfast' | 'lunch' | 'dinner'
}

