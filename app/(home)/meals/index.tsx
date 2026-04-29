import { useRouter, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MealsList } from '@/components/meals/MealsList'
import { MealsHeader } from '@/components/meals/MealsHeader'
import { Meal } from '@/types/meal'
import { usePlanMeals } from '@/hooks/usePlanMeals'

export default function MealsPage() {
  const router = useRouter()
  const { addToPlan, day, replacePlanMealId, returnTo } = useLocalSearchParams<{ 
    addToPlan?: string
    day?: string
    replacePlanMealId?: string
    returnTo?: string
  }>()
  const [addingMeal, setAddingMeal] = useState(false)
  
  const planId = addToPlan ? parseInt(addToPlan, 10) : null
  const dayOfWeek = day ? parseInt(day, 10) : null
  const existingPlanMealId = replacePlanMealId ? parseInt(replacePlanMealId, 10) : null
  const isAddingToPlan = planId !== null && !isNaN(planId)
  const isReplacing = isAddingToPlan && existingPlanMealId !== null && !isNaN(existingPlanMealId)
  
  const { addMeal, removePlanMeal } = usePlanMeals(planId || 0)

  const handleMealPress = async (meal: Meal) => {
    if (isAddingToPlan && planId) {
      setAddingMeal(true)
      
      try {
        // If replacing, remove the old plan meal first
        if (isReplacing && existingPlanMealId) {
          const removeResponse = await removePlanMeal(existingPlanMealId)
          if (removeResponse.error) {
            Alert.alert('Error', `Failed to remove existing meal: ${removeResponse.error}`)
            setAddingMeal(false)
            return
          }
        }
        
        // Add the new meal (dayOfWeek can be null if not specified)
        const response = await addMeal({
          mealId: meal.id,
          dayOfWeek: dayOfWeek !== null && !isNaN(dayOfWeek) ? dayOfWeek : null,
          mealSlot: 'dinner',
        })

        if (response.error) {
          Alert.alert('Error', response.error)
        } else {
          Alert.alert('Success', isReplacing ? 'Meal replaced successfully!' : 'Meal added to plan!', [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to where user came from
                if (returnTo === 'edit' && planId) {
                  router.push(`/(home)/plans/${planId}?edit=true`)
                } else if (returnTo === 'detail' && planId) {
                  router.push(`/(home)/plans/${planId}`)
                } else {
                  router.back()
                }
              },
            },
          ])
        }
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update meal')
      } finally {
        setAddingMeal(false)
      }
    } else {
      // Normal navigation to meal detail
      router.push(`/(home)/meals/${meal.id}`)
    }
  }

  const handleMealEdit = (meal: Meal) => {
    router.push(`/(home)/meals/${meal.id}?edit=true`)
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']} style={{ paddingBottom: 100 }}>
      <MealsList
        onMealPress={handleMealPress}
        onMealEdit={handleMealEdit}
        isSelectionMode={isAddingToPlan}
        loading={addingMeal}
        replaceMode={isReplacing}
        ListHeaderComponent={!isAddingToPlan ? <MealsHeader /> : null}
      />
    </SafeAreaView>
  )
}

