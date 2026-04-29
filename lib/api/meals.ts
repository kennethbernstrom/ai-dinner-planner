import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { supabase } from '@/lib/supabase'
import { Meal, MealIngredient, MealPlanOccurrence } from '@/types/meal'
import { TopMealRank, TopMealsOptions } from '@/types/metrics'
import { parseLocalDateString, scheduledDateFromWeekAndDay } from '@/lib/utils/date'
import { CreateMealInput, UpdateMealInput } from '@/lib/validation/schemas'
import { ApiResponse } from '@/types/api'

// Helper function to transform database row to Meal type
function transformMeal(row: any, ingredients: MealIngredient[] = [], isFavorite: boolean = false): Meal {
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
    isFavorite,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// Helper function to transform database row to MealIngredient type
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

export function useMealsApi(familyId?: number) {
  const { userId } = useAuth()

  return useMemo(() => ({
    list: async (): Promise<ApiResponse<Meal[]>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Fetch meals for the family
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('family_id', familyId)
          .order('created_at', { ascending: false })

        if (mealsError) {
          console.log('Error fetching meals:', mealsError)
          throw mealsError
        }

        if (!mealsData || mealsData.length === 0) {
          return { data: [] }
        }

        const mealIds = mealsData.map((m) => m.id)

        // Fetch ingredients for all meals
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('meal_ingredients')
          .select('*')
          .in('meal_id', mealIds)

        if (ingredientsError) {
          console.log('Error fetching ingredients:', ingredientsError)
          // Continue without ingredients rather than failing
        }

        // Fetch favorites for all meals
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('meal_favorites')
          .select('meal_id')
          .eq('clerk_user_id', userId)
          .in('meal_id', mealIds)

        if (favoritesError) {
          console.log('Error fetching favorites:', favoritesError)
          // Continue without favorites rather than failing
        }

        // Create a set of favorite meal IDs for quick lookup
        const favoriteMealIds = new Set(favoritesData?.map((fav) => fav.meal_id) || [])

        // Group ingredients by meal_id
        const ingredientsByMealId = new Map<string, MealIngredient[]>()
        if (ingredientsData) {
          ingredientsData.forEach((ing) => {
            const mealId = ing.meal_id
            if (!ingredientsByMealId.has(mealId)) {
              ingredientsByMealId.set(mealId, [])
            }
            ingredientsByMealId.get(mealId)!.push(transformIngredient(ing))
          })
        }

        // Transform meals with their ingredients and favorite status
        const meals = mealsData.map((meal) =>
          transformMeal(
            meal, 
            ingredientsByMealId.get(meal.id) || [],
            favoriteMealIds.has(meal.id)
          )
        )

        return { data: meals }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch meals',
        }
      }
    },

    get: async (id: number): Promise<ApiResponse<Meal>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Fetch meal (must belong to user's family)
        const { data: mealData, error: mealError } = await supabase
          .from('meals')
          .select('*')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (mealError) {
          if (mealError.code === 'PGRST116') {
            return { error: 'Meal not found' }
          }
          console.log('Error fetching meal:', mealError)
          throw mealError
        }

        if (!mealData) {
          return { error: 'Meal not found' }
        }

        // Fetch ingredients
        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('meal_ingredients')
          .select('*')
          .eq('meal_id', id)

        if (ingredientsError) {
          console.log('Error fetching ingredients:', ingredientsError)
          // Continue without ingredients rather than failing
        }

        // Check if meal is favorited
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('meal_favorites')
          .select('id')
          .eq('clerk_user_id', userId)
          .eq('meal_id', id)
          .maybeSingle()

        if (favoriteError) {
          console.log('Error fetching favorite:', favoriteError)
          // Continue without favorite status rather than failing
        }

        const ingredients = ingredientsData
          ? ingredientsData.map(transformIngredient)
          : []

        const meal = transformMeal(mealData, ingredients, !!favoriteData)
        return { data: meal }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch meal',
        }
      }
    },

    listPlanOccurrencesForMeal: async (
      mealId: number
    ): Promise<ApiResponse<MealPlanOccurrence[]>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        const { data: mealRow, error: mealCheckError } = await supabase
          .from('meals')
          .select('id')
          .eq('id', mealId)
          .eq('family_id', familyId)
          .single()

        if (mealCheckError || !mealRow) {
          return { error: 'Meal not found' }
        }

        const { data: planMealsData, error: pmError } = await supabase
          .from('plan_meals')
          .select('*')
          .eq('meal_id', mealId)

        if (pmError) {
          console.log('Error fetching plan meals for meal:', pmError)
          throw pmError
        }

        if (!planMealsData || planMealsData.length === 0) {
          return { data: [] }
        }

        const planIds = [...new Set(planMealsData.map((pm) => pm.plan_id))]

        const { data: plansData, error: plansError } = await supabase
          .from('weekly_plans')
          .select('id, name, week_start_date')
          .in('id', planIds)
          .eq('family_id', familyId)

        if (plansError) {
          console.log('Error fetching plans for meal occurrences:', plansError)
          throw plansError
        }

        const planMap = new Map(
          (plansData || []).map((p) => {
            const raw = p.week_start_date
            const weekStart =
              typeof raw === 'string'
                ? parseLocalDateString(raw)
                : (() => {
                    const d = new Date(raw as string)
                    d.setHours(0, 0, 0, 0)
                    return d
                  })()
            return [
              p.id,
              { id: p.id, name: p.name as string, weekStartDate: weekStart },
            ] as const
          })
        )

        const occurrences: MealPlanOccurrence[] = planMealsData
          .filter((pm) => planMap.has(pm.plan_id))
          .map((pm) => {
            const plan = planMap.get(pm.plan_id)!
            const dayOfWeek = pm.day_of_week !== null ? pm.day_of_week : null
            const scheduledDate = scheduledDateFromWeekAndDay(plan.weekStartDate, dayOfWeek)
            return {
              planMealId: pm.id,
              planId: plan.id,
              planName: plan.name,
              weekStartDate: plan.weekStartDate,
              scheduledDate,
              dayOfWeek,
              mealSlot: pm.meal_slot as 'breakfast' | 'lunch' | 'dinner',
            }
          })

        occurrences.sort((a, b) => {
          const ta =
            a.scheduledDate?.getTime() ?? a.weekStartDate.getTime()
          const tb =
            b.scheduledDate?.getTime() ?? b.weekStartDate.getTime()
          return tb - ta
        })

        return { data: occurrences }
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to fetch meal plan dates',
        }
      }
    },

    getTopPlannedMeals: async (
      options: TopMealsOptions
    ): Promise<ApiResponse<TopMealRank[]>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        const limit = options.limit ?? 10
        const currentYear = new Date().getFullYear()
        const year = options.scope === 'year' ? options.year ?? currentYear : undefined

        let plansQuery = supabase
          .from('weekly_plans')
          .select('id')
          .eq('family_id', familyId)

        if (year !== undefined) {
          plansQuery = plansQuery
            .gte('week_start_date', `${year}-01-01`)
            .lte('week_start_date', `${year}-12-31`)
        }

        const { data: plansData, error: plansError } = await plansQuery

        if (plansError) {
          console.log('Error fetching plans for top meals:', plansError)
          throw plansError
        }

        if (!plansData || plansData.length === 0) {
          return { data: [] }
        }

        const planIds = plansData.map((plan) => plan.id)
        const { data: planMealsData, error: planMealsError } = await supabase
          .from('plan_meals')
          .select('meal_id')
          .in('plan_id', planIds)

        if (planMealsError) {
          console.log('Error fetching plan meals for top meals:', planMealsError)
          throw planMealsError
        }

        if (!planMealsData || planMealsData.length === 0) {
          return { data: [] }
        }

        const countsByMealId = new Map<number, number>()
        for (const row of planMealsData) {
          const mealId = Number(row.meal_id)
          countsByMealId.set(mealId, (countsByMealId.get(mealId) ?? 0) + 1)
        }

        const sortedCounts = [...countsByMealId.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)

        if (sortedCounts.length === 0) {
          return { data: [] }
        }

        const topMealIds = sortedCounts.map(([mealId]) => mealId)
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('id, title, image_url')
          .eq('family_id', familyId)
          .in('id', topMealIds)

        if (mealsError) {
          console.log('Error fetching meal details for top meals:', mealsError)
          throw mealsError
        }

        const mealsById = new Map((mealsData || []).map((meal) => [meal.id, meal]))
        const rankedMeals: TopMealRank[] = sortedCounts
          .map(([mealId, timesScheduled], index) => {
            const meal = mealsById.get(mealId)
            if (!meal) return null
            return {
              rank: index + 1,
              mealId,
              title: meal.title,
              imageUrl: meal.image_url,
              timesScheduled,
            }
          })
          .filter((meal): meal is TopMealRank => meal !== null)

        return { data: rankedMeals }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to fetch top planned meals',
        }
      }
    },

    create: async (input: CreateMealInput): Promise<ApiResponse<Meal>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        const { ingredients, tags, ...mealData } = input

        // Insert meal
        const { data: mealRow, error: mealError } = await supabase
          .from('meals')
          .insert({
            family_id: familyId,
            clerk_user_id: userId,
            title: mealData.title,
            description: mealData.description || null,
            instructions: mealData.instructions || null,
            image_url: mealData.imageUrl || null,
            tags: tags ? JSON.stringify(tags) : null,
            source_url: mealData.sourceUrl || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (mealError) {
          console.log('Error creating meal:', mealError)
          throw mealError
        }

        if (!mealRow) {
          return { error: 'Failed to create meal' }
        }

        // Insert ingredients if provided
        let ingredientsList: MealIngredient[] = []
        if (ingredients && ingredients.length > 0) {
          const ingredientsToInsert = ingredients.map((ing) => ({
            meal_id: mealRow.id,
            name: ing.name,
            quantity: ing.quantity || null,
            unit: ing.unit || null,
            category: ing.category || null,
          }))

          const { data: insertedIngredients, error: ingredientsError } = await supabase
            .from('meal_ingredients')
            .insert(ingredientsToInsert)
            .select()

          if (ingredientsError) {
            console.log('Error creating ingredients:', ingredientsError)
            // Continue without ingredients rather than failing
          } else if (insertedIngredients) {
            ingredientsList = insertedIngredients.map(transformIngredient)
          }
        }

        const meal = transformMeal(mealRow, ingredientsList)
        return { data: meal }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to create meal',
        }
      }
    },

    update: async (
      id: number,
      input: UpdateMealInput
    ): Promise<ApiResponse<Meal>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        if (!familyId) {
          return { error: 'No family selected' }
        }

        // Verify meal belongs to user's family
        const { data: existingMeal, error: checkError } = await supabase
          .from('meals')
          .select('id')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (checkError || !existingMeal) {
          return { error: 'Meal not found' }
        }

        const { ingredients, tags, ...mealData } = input

        // Prepare update data
        const updateData: any = {
          updated_at: new Date().toISOString(),
        }

        if (mealData.title !== undefined) updateData.title = mealData.title
        if (mealData.description !== undefined) updateData.description = mealData.description || null
        if (mealData.instructions !== undefined) updateData.instructions = mealData.instructions || null
        if (mealData.imageUrl !== undefined) updateData.image_url = mealData.imageUrl || null
        if (mealData.sourceUrl !== undefined) updateData.source_url = mealData.sourceUrl || null
        if (tags !== undefined) updateData.tags = tags ? JSON.stringify(tags) : null

        // Update meal
        const { data: updatedMeal, error: updateError } = await supabase
          .from('meals')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()

        if (updateError) {
          console.log('Error updating meal:', updateError)
          throw updateError
        }

        if (!updatedMeal) {
          return { error: 'Failed to update meal' }
        }

        // Handle ingredients update
        let ingredientsList: MealIngredient[] = []
        if (ingredients !== undefined) {
          // Delete all existing ingredients
          const { error: deleteError } = await supabase
            .from('meal_ingredients')
            .delete()
            .eq('meal_id', id)

          if (deleteError) {
            console.log('Error deleting ingredients:', deleteError)
            // Continue anyway
          }

          // Insert new ingredients if provided
          if (ingredients && ingredients.length > 0) {
            const ingredientsToInsert = ingredients.map((ing) => ({
              meal_id: id,
              name: ing.name,
              quantity: ing.quantity || null,
              unit: ing.unit || null,
              category: ing.category || null,
            }))

            const { data: insertedIngredients, error: ingredientsError } = await supabase
              .from('meal_ingredients')
              .insert(ingredientsToInsert)
              .select()

            if (ingredientsError) {
              console.log('Error creating ingredients:', ingredientsError)
              // Continue without ingredients rather than failing
            } else if (insertedIngredients) {
              ingredientsList = insertedIngredients.map(transformIngredient)
            }
          }
        } else {
          // Fetch existing ingredients if not updating them
          const { data: existingIngredients } = await supabase
            .from('meal_ingredients')
            .select('*')
            .eq('meal_id', id)

          if (existingIngredients) {
            ingredientsList = existingIngredients.map(transformIngredient)
          }
        }

        const meal = transformMeal(updatedMeal, ingredientsList)
        return { data: meal }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to update meal',
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

        // Verify meal belongs to user's family
        const { data: existingMeal, error: checkError } = await supabase
          .from('meals')
          .select('id')
          .eq('id', id)
          .eq('family_id', familyId)
          .single()

        if (checkError || !existingMeal) {
          return { error: 'Meal not found' }
        }

        // Delete meal (ingredients will be deleted via cascade)
        const { error: deleteError } = await supabase
          .from('meals')
          .delete()
          .eq('id', id)

        if (deleteError) {
          console.log('Error deleting meal:', deleteError)
          throw deleteError
        }

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to delete meal',
        }
      }
    },

    addFavorite: async (mealId: number): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        // Check if already favorited
        const { data: existing } = await supabase
          .from('meal_favorites')
          .select('id')
          .eq('clerk_user_id', userId)
          .eq('meal_id', mealId)
          .maybeSingle()

        if (existing) {
          // Already favorited, no need to add again
          return { data: undefined }
        }

        const { error: insertError } = await supabase
          .from('meal_favorites')
          .insert({
            clerk_user_id: userId,
            meal_id: mealId,
            created_at: new Date().toISOString(),
          })

        if (insertError) {
          console.log('Error adding favorite:', insertError)
          throw insertError
        }

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to add favorite',
        }
      }
    },

    removeFavorite: async (mealId: number): Promise<ApiResponse<void>> => {
      try {
        if (!userId) {
          return { error: 'Not authenticated' }
        }

        const { error: deleteError } = await supabase
          .from('meal_favorites')
          .delete()
          .eq('clerk_user_id', userId)
          .eq('meal_id', mealId)

        if (deleteError) {
          console.log('Error removing favorite:', deleteError)
          throw deleteError
        }

        return { data: undefined }
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : 'Failed to remove favorite',
        }
      }
    },

    uploadImage: async (
      id: number
    ): Promise<ApiResponse<{ uploadUrl: string; imageUrl: string }>> => {
      // Image upload functionality would still need to go through a server
      // as it typically involves generating presigned URLs
      return {
        error: 'Image upload not implemented with direct Supabase access',
      }
    },
  }), [userId, familyId])
}

