import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { supabase } from '@/lib/supabase'
import {
  WeeklyPlan,
  PlanWithMeals,
  PlanMeal,
} from '@/types/plan'
import {
  CreatePlanInput,
  UpdatePlanInput,
  AddMealToPlanInput,
  UpdatePlanMealInput,
} from '@/lib/validation/schemas'
import { ApiResponse } from '@/types/api'
import { Meal, MealIngredient } from '@/types/meal'

// Helper function to transform database row to WeeklyPlan type
function transformPlan(row: any): WeeklyPlan {
  return {
    id: row.id,
    familyId: row.family_id,
    clerkUserId: row.clerk_user_id,
    name: row.name,
    weekStartDate: new Date(row.week_start_date),
    visibility: row.visibility as 'private' | 'shared',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// Helper function to transform database row to PlanMeal type
function transformPlanMeal(row: any, meal?: Meal): PlanMeal {
  return {
    id: row.id,
    planId: row.plan_id,
    mealId: row.meal_id,
    dayOfWeek: row.day_of_week !== null ? row.day_of_week : null,
    mealSlot: row.meal_slot as 'breakfast' | 'lunch' | 'dinner',
    createdAt: new Date(row.created_at),
    meal: meal,
  }
}

// Helper function to transform meal with ingredients
function transformMeal(row: any, ingredients: MealIngredient[] = []): Meal {
  return {
    id: row.id,
    familyId: row.family_id,
    clerkUserId: row.clerk_user_id,
    title: row.title,
    description: row.description,
    instructions: row.instructions,
    imageUrl: row.image_url,
    tags: row.tags ? (Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags)) : null,
    sourceUrl: row.source_url,
    ingredients: ingredients.length > 0 ? ingredients : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// Helper function to transform ingredient
function transformIngredient(row: any): MealIngredient {
  return {
    id: row.id,
    mealId: row.meal_id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    category: row.category,
  }
}

// Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
// This prevents timezone-related off-by-one date errors
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function usePlansApi(familyId?: number) {
  const { userId } = useAuth()

  return useMemo(() => ({
    list: async (): Promise<ApiResponse<WeeklyPlan[]>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        const { data: plansData, error } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('family_id', familyId)
          .order('week_start_date', { ascending: false })

        if (error) {
          console.log('Error fetching plans:', error)
          throw error
        }

        const plans = (plansData || []).map(transformPlan)
        return { data: plans }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch plans',
        }
      }
    },

    get: async (id: number): Promise<ApiResponse<PlanWithMeals>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Fetch plan
        const { data: planData, error: planError } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (planError) {
          if (planError.code === 'PGRST116') {
            return { error: 'Plan not found' }
          }
          console.log('Error fetching plan:', planError)
          throw planError
        }

        if (!planData) {
          return { error: 'Plan not found' }
        }

        // Fetch plan meals
        const { data: planMealsData, error: planMealsError } = await supabase
          .from('plan_meals')
          .select('*')
          .eq('plan_id', id)

        if (planMealsError) {
          console.log('Error fetching plan meals:', planMealsError)
          throw planMealsError
        }

        // Fetch meals and their ingredients
        const planMeals: PlanMeal[] = []
        if (planMealsData && planMealsData.length > 0) {
          const mealIds = planMealsData.map((pm) => pm.meal_id)

          // Fetch meals
          const { data: mealsData, error: mealsError } = await supabase
            .from('meals')
            .select('*')
            .in('id', mealIds)

          if (mealsError) {
            console.log('Error fetching meals:', mealsError)
            // Continue without meal details
          }

          // Fetch ingredients for all meals
          const { data: ingredientsData } = await supabase
            .from('meal_ingredients')
            .select('*')
            .in('meal_id', mealIds)

          // Group ingredients by meal_id (convert to string for consistent Map keys)
          const ingredientsByMealId = new Map<string, MealIngredient[]>()
          if (ingredientsData) {
            ingredientsData.forEach((ing) => {
              const mealId = String(ing.meal_id)
              if (!ingredientsByMealId.has(mealId)) {
                ingredientsByMealId.set(mealId, [])
              }
              ingredientsByMealId.get(mealId)!.push(transformIngredient(ing))
            })
          }

          // Create a map of meals by id (convert to string for consistent Map keys)
          const mealsMap = new Map<string, Meal>()
          if (mealsData) {
            mealsData.forEach((mealRow) => {
              const mealId = String(mealRow.id)
              const ingredients = ingredientsByMealId.get(mealId) || []
              mealsMap.set(mealId, transformMeal(mealRow, ingredients))
            })
          }

          // Transform plan meals with their meals (convert meal_id to string for lookup)
          planMealsData.forEach((pmRow) => {
            const mealId = String(pmRow.meal_id)
            const meal = mealsMap.get(mealId)
            planMeals.push(transformPlanMeal(pmRow, meal))
          })
        }

        const plan = transformPlan(planData)
        return { data: { ...plan, planMeals } as PlanWithMeals }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch plan',
        }
      }
    },

    getByWeekStartDate: async (weekStartDate: Date): Promise<ApiResponse<PlanWithMeals | null>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Normalize week start date to Monday (start of week)
        const normalizedDate = new Date(weekStartDate)
        const day = normalizedDate.getDay()
        const diff = normalizedDate.getDate() - day + (day === 0 ? -6 : 1)
        normalizedDate.setDate(diff)
        normalizedDate.setHours(0, 0, 0, 0)

        // Format date for query - use ISO date string format (YYYY-MM-DD) in local timezone
        const dateString = formatDateLocal(normalizedDate)
        
        console.log('Querying for plan with week_start_date:', dateString)
        
        // Fetch plan for this week - try ISO format first
        let { data: planData, error: planError } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('family_id', familyId)
          .eq('week_start_date', dateString)
          .single()

        // If not found with ISO format, try locale format as fallback (for existing plans)
        if (planError && planError.code === 'PGRST116') {
          const localeDateString = normalizedDate.toLocaleDateString('en-US')
          console.log('Trying fallback query with locale format:', localeDateString)
          const fallbackResult = await supabase
            .from('weekly_plans')
            .select('*')
            .eq('family_id', familyId)
            .eq('week_start_date', localeDateString)
            .single()
          
          if (!fallbackResult.error && fallbackResult.data) {
            planData = fallbackResult.data
            planError = null
          }
        }

        if (planError) {
          if (planError.code === 'PGRST116') {
            // No plan found for this week
            console.log('No plan found for week starting:', dateString)
            return { data: null }
          }
          console.log('Error fetching plan by week:', planError)
          throw planError
        }

        if (!planData) {
          return { data: null }
        }

        // Fetch plan meals
        const { data: planMealsData, error: planMealsError } = await supabase
          .from('plan_meals')
          .select('*')
          .eq('plan_id', planData.id)

        if (planMealsError) {
          console.log('Error fetching plan meals:', planMealsError)
          throw planMealsError
        }

        // Fetch meals and their ingredients
        const planMeals: PlanMeal[] = []
        if (planMealsData && planMealsData.length > 0) {
          const mealIds = planMealsData.map((pm) => pm.meal_id)

          // Fetch meals
          const { data: mealsData, error: mealsError } = await supabase
            .from('meals')
            .select('*')
            .in('id', mealIds)

          if (mealsError) {
            console.log('Error fetching meals:', mealsError)
            // Continue without meal details
          }

          // Fetch ingredients for all meals
          const { data: ingredientsData } = await supabase
            .from('meal_ingredients')
            .select('*')
            .in('meal_id', mealIds)

          // Group ingredients by meal_id (convert to string for consistent Map keys)
          const ingredientsByMealId = new Map<string, MealIngredient[]>()
          if (ingredientsData) {
            ingredientsData.forEach((ing) => {
              const mealId = String(ing.meal_id)
              if (!ingredientsByMealId.has(mealId)) {
                ingredientsByMealId.set(mealId, [])
              }
              ingredientsByMealId.get(mealId)!.push(transformIngredient(ing))
            })
          }

          // Create a map of meals by id (convert to string for consistent Map keys)
          const mealsMap = new Map<string, Meal>()
          if (mealsData) {
            mealsData.forEach((mealRow) => {
              const mealId = String(mealRow.id)
              const ingredients = ingredientsByMealId.get(mealId) || []
              mealsMap.set(mealId, transformMeal(mealRow, ingredients))
            })
          }

          // Transform plan meals with their meals (convert meal_id to string for lookup)
          planMealsData.forEach((pmRow) => {
            const mealId = String(pmRow.meal_id)
            const meal = mealsMap.get(mealId)
            planMeals.push(transformPlanMeal(pmRow, meal))
          })
        }

        const plan = transformPlan(planData)
        return { data: { ...plan, planMeals } as PlanWithMeals }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch plan by week',
        }
      }
    },

    create: async (input: CreatePlanInput): Promise<ApiResponse<WeeklyPlan>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Normalize week start date to Monday (start of week)
        const weekStartDate = new Date(input.weekStartDate)
        const day = weekStartDate.getDay()
        const diff = weekStartDate.getDate() - day + (day === 0 ? -6 : 1)
        const normalizedDate = new Date(weekStartDate)
        normalizedDate.setDate(diff)
        normalizedDate.setHours(0, 0, 0, 0)

        // Check for duplicate plans in the same week
        const weekStartDateStr = formatDateLocal(normalizedDate)
        const { data: existingPlans, error: checkError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('family_id', familyId)
          .eq('week_start_date', weekStartDateStr) // Use ISO format (YYYY-MM-DD) for consistency

        if (checkError) {
          console.log('Error checking for duplicate plans:', checkError)
          throw checkError
        }

        if (existingPlans && existingPlans.length > 0) {
          return { error: 'A plan already exists for this week. Please select a different week.' }
        }

        const { data: planData, error } = await supabase
          .from('weekly_plans')
          .insert({
            family_id: familyId,
            clerk_user_id: userId,
            name: input.name,
            week_start_date: weekStartDateStr, // Use ISO format (YYYY-MM-DD) in local timezone
            visibility: input.visibility || 'private',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.log('Error creating plan:', error)
          throw error
        }

        if (!planData) {
          return { error: 'Failed to create plan' }
        }

        return { data: transformPlan(planData) }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to create plan',
        }
      }
    },

    update: async (
      id: number,
      input: UpdatePlanInput
    ): Promise<ApiResponse<WeeklyPlan>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify plan belongs to user's family
        const { data: existingPlan, error: checkError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (checkError || !existingPlan) {
          return { error: 'Plan not found' }
        }

        // Prepare update data
        const updateData: any = {
          updated_at: new Date().toISOString(),
        }

        if (input.name !== undefined) updateData.name = input.name
        if (input.weekStartDate !== undefined) {
          // Normalize week start date to Monday (start of week)
          const weekStartDate = new Date(input.weekStartDate)
          const day = weekStartDate.getDay()
          const diff = weekStartDate.getDate() - day + (day === 0 ? -6 : 1)
          const normalizedDate = new Date(weekStartDate)
          normalizedDate.setDate(diff)
          normalizedDate.setHours(0, 0, 0, 0)
          updateData.week_start_date = formatDateLocal(normalizedDate)
        }
        if (input.visibility !== undefined) updateData.visibility = input.visibility

        const { data: planData, error } = await supabase
          .from('weekly_plans')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          console.log('Error updating plan:', error)
          throw error
        }

        if (!planData) {
          return { error: 'Failed to update plan' }
        }

        return { data: transformPlan(planData) }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to update plan',
        }
      }
    },

    delete: async (id: number): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify plan belongs to user's family
        const { data: existingPlan, error: checkError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (checkError || !existingPlan) {
          return { error: 'Plan not found' }
        }

        const { error: deleteError } = await supabase
          .from('weekly_plans')
          .delete()
          .eq('id', id)

        if (deleteError) {
          console.log('Error deleting plan:', deleteError)
          throw deleteError
        }

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to delete plan',
        }
      }
    },

    duplicate: async (id: number): Promise<ApiResponse<WeeklyPlan>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Get original plan
        const { data: originalPlanData, error: planError } = await supabase
          .from('weekly_plans')
          .select('*')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (planError || !originalPlanData) {
          return { error: 'Plan not found' }
        }

        // Get original plan meals
        const { data: originalPlanMeals, error: planMealsError } = await supabase
          .from('plan_meals')
          .select('*')
          .eq('plan_id', id)

        if (planMealsError) {
          console.log('Error fetching plan meals:', planMealsError)
          // Continue without meals
        }

        // Calculate next week's start date (7 days from original)
        const originalWeekStart = new Date(originalPlanData.week_start_date)
        const nextWeekStart = new Date(originalWeekStart)
        nextWeekStart.setDate(nextWeekStart.getDate() + 7)
        nextWeekStart.setHours(0, 0, 0, 0)

        // Create duplicate plan for next week
        const { data: newPlanData, error: createError } = await supabase
          .from('weekly_plans')
          .insert({
            family_id: familyId,
            clerk_user_id: userId,
            name: `${originalPlanData.name} (Copy)`,
            week_start_date: formatDateLocal(nextWeekStart),
            visibility: originalPlanData.visibility,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.log('Error creating duplicate plan:', createError)
          throw createError
        }

        if (!newPlanData) {
          return { error: 'Failed to create duplicate plan' }
        }

        // Duplicate plan meals if they exist (only dinner meals)
        if (originalPlanMeals && originalPlanMeals.length > 0) {
          const dinnerMeals = originalPlanMeals.filter((pm) => pm.meal_slot === 'dinner')
          const planMealsToInsert = dinnerMeals.map((pm) => ({
            plan_id: newPlanData.id,
            meal_id: pm.meal_id,
            day_of_week: pm.day_of_week,
            meal_slot: 'dinner',
            created_at: new Date().toISOString(),
          }))

          const { error: planMealsInsertError } = await supabase
            .from('plan_meals')
            .insert(planMealsToInsert)

          if (planMealsInsertError) {
            console.log('Error duplicating plan meals:', planMealsInsertError)
            // Continue anyway
          }
        }

        return { data: transformPlan(newPlanData) }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to duplicate plan',
        }
      }
    },

    addMeal: async (
      planId: number,
      input: AddMealToPlanInput
    ): Promise<ApiResponse<PlanMeal>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify plan belongs to user's family
        const { data: plan, error: planError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('id', planId)
          .eq('family_id', familyId)
          .single()

        if (planError || !plan) {
          return { error: 'Plan not found' }
        }

        // Verify meal belongs to user's family
        const { data: meal, error: mealError } = await supabase
          .from('meals')
          .select('id')
          .eq('id', input.mealId)
          .eq('family_id', familyId)
          .single()

        if (mealError || !meal) {
          return { error: 'Meal not found' }
        }

        // Insert plan meal (always dinner for weekly dinner plans)
        const { data: planMealData, error: insertError } = await supabase
          .from('plan_meals')
          .insert({
            plan_id: planId,
            meal_id: input.mealId,
            day_of_week: input.dayOfWeek !== undefined ? input.dayOfWeek : null,
            meal_slot: 'dinner', // Always dinner for weekly dinner plans
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          console.log('Error adding meal to plan:', insertError)
          throw insertError
        }

        if (!planMealData) {
          return { error: 'Failed to add meal to plan' }
        }

        // Fetch meal with ingredients
        const { data: mealData } = await supabase
          .from('meals')
          .select('*')
          .eq('id', input.mealId)
          .single()

        const { data: ingredientsData } = await supabase
          .from('meal_ingredients')
          .select('*')
          .eq('meal_id', input.mealId)

        const ingredients = ingredientsData ? ingredientsData.map(transformIngredient) : []
        const mealWithIngredients = mealData ? transformMeal(mealData, ingredients) : undefined

        return { data: transformPlanMeal(planMealData, mealWithIngredients) }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to add meal to plan',
        }
      }
    },

    updateMeal: async (
      planId: number,
      mealId: number,
      input: UpdatePlanMealInput
    ): Promise<ApiResponse<PlanMeal>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify plan belongs to user's family
        const { data: plan, error: planError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('id', planId)
          .eq('family_id', familyId)
          .single()

        if (planError || !plan) {
          return { error: 'Plan not found' }
        }

        // Find plan meal
        const { data: planMealData, error: findError } = await supabase
          .from('plan_meals')
          .select('*')
          .eq('plan_id', planId)
          .eq('meal_id', mealId)
          .single()

        if (findError || !planMealData) {
          return { error: 'Plan meal not found' }
        }

        // Prepare update data
        const updateData: any = {}
        if (input.dayOfWeek !== undefined) updateData.day_of_week = input.dayOfWeek
        if (input.mealSlot !== undefined) updateData.meal_slot = input.mealSlot

        // Update plan meal
        const { data: updatedPlanMeal, error: updateError } = await supabase
          .from('plan_meals')
          .update(updateData)
          .eq('id', planMealData.id)
          .select()
          .single()

        if (updateError) {
          console.log('Error updating plan meal:', updateError)
          throw updateError
        }

        if (!updatedPlanMeal) {
          return { error: 'Failed to update plan meal' }
        }

        // Fetch meal with ingredients
        const { data: mealData } = await supabase
          .from('meals')
          .select('*')
          .eq('id', mealId)
          .single()

        const { data: ingredientsData } = await supabase
          .from('meal_ingredients')
          .select('*')
          .eq('meal_id', mealId)

        const ingredients = ingredientsData ? ingredientsData.map(transformIngredient) : []
        const mealWithIngredients = mealData ? transformMeal(mealData, ingredients) : undefined

        return { data: transformPlanMeal(updatedPlanMeal, mealWithIngredients) }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to update plan meal',
        }
      }
    },

    removeMeal: async (
      planId: number,
      mealId: number
    ): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify plan belongs to user's family
        const { data: plan, error: planError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('id', planId)
          .eq('family_id', familyId)
          .single()

        if (planError || !plan) {
          return { error: 'Plan not found' }
        }

        // Find plan meal
        const { data: planMealData, error: findError } = await supabase
          .from('plan_meals')
          .select('id')
          .eq('plan_id', planId)
          .eq('meal_id', mealId)
          .single()

        if (findError || !planMealData) {
          return { error: 'Plan meal not found' }
        }

        // Delete plan meal
        const { error: deleteError } = await supabase
          .from('plan_meals')
          .delete()
          .eq('id', planMealData.id)

        if (deleteError) {
          console.log('Error removing meal from plan:', deleteError)
          throw deleteError
        }

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to remove meal from plan',
        }
      }
    },

    removePlanMeal: async (
      planId: number,
      planMealId: number
    ): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify plan belongs to user's family
        const { data: plan, error: planError } = await supabase
          .from('weekly_plans')
          .select('id')
          .eq('id', planId)
          .eq('family_id', familyId)
          .single()

        if (planError || !plan) {
          return { error: 'Plan not found' }
        }

        // Verify plan meal belongs to this plan
        const { data: planMealData, error: findError } = await supabase
          .from('plan_meals')
          .select('id')
          .eq('id', planMealId)
          .eq('plan_id', planId)
          .single()

        if (findError || !planMealData) {
          return { error: 'Plan meal not found' }
        }

        // Delete plan meal
        const { error: deleteError } = await supabase
          .from('plan_meals')
          .delete()
          .eq('id', planMealId)

        if (deleteError) {
          console.log('Error removing plan meal:', deleteError)
          throw deleteError
        }

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to remove plan meal',
        }
      }
    },
  }), [userId, familyId])
}

