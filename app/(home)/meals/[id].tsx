import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { MealDetail } from '@/components/meals/MealDetail'
import { MealForm } from '@/components/meals/MealForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useMeals } from '@/hooks/useMeals'
import { Meal, CreateMealInput, UpdateMealInput, MealPlanOccurrence } from '@/types/meal'

export default function MealDetailPage() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>()
  const router = useRouter()
  const {
    getMeal,
    getMealPlanOccurrences,
    updateMeal,
    createMeal,
    addFavorite,
    removeFavorite,
    loading,
  } = useMeals()
  const [meal, setMeal] = useState<Meal | null>(null)
  const [planOccurrences, setPlanOccurrences] = useState<MealPlanOccurrence[]>([])
  const [planOccurrencesLoading, setPlanOccurrencesLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(edit === 'true')
  const [formLoading, setFormLoading] = useState(false)
  

  // Parse id from string to number
  const mealId = id && id !== 'new' ? parseInt(id, 10) : null

  const loadMeal = useCallback(async () => {
    if (!mealId) return
    const response = await getMeal(mealId)
    if (response.data) {
      setMeal(response.data)
    }
  }, [mealId, getMeal])

  const loadPlanOccurrences = useCallback(async () => {
    if (!mealId) return
    setPlanOccurrencesLoading(true)
    try {
      const response = await getMealPlanOccurrences(mealId)
      if (response.data) {
        setPlanOccurrences(response.data)
      } else {
        setPlanOccurrences([])
      }
    } finally {
      setPlanOccurrencesLoading(false)
    }
  }, [mealId, getMealPlanOccurrences])

  useEffect(() => {
    if (mealId) {
      loadMeal()
      loadPlanOccurrences()
    } else {
      setIsEditing(true)
    }
  }, [mealId, loadMeal, loadPlanOccurrences])

  // Refetch meal when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (mealId) {
        loadMeal()
        loadPlanOccurrences()
      }
    }, [mealId, loadMeal, loadPlanOccurrences])
  )

  const handleSubmit = async (input: CreateMealInput | UpdateMealInput) => {
    setFormLoading(true)
    try {
      if (meal) {
        const response = await updateMeal(meal.id, input as UpdateMealInput)
        if (response.data) {
          setMeal(response.data)
          setIsEditing(false)
        }
      } else {
        const response = await createMeal(input as CreateMealInput)
        console.log('createMeal response', response)
        if (response.data) {
          router.replace(`/(home)/meals/${response.data.id}`)
        }
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleFavorite = async (mealId: number, shouldFavorite: boolean) => {
    if (shouldFavorite) {
      await addFavorite(mealId)
    } else {
      await removeFavorite(mealId)
    }
    // Reload the meal to get updated favorite status
    await loadMeal()
  }

  if (loading && !meal) {
    return <LoadingSpinner />
  }

  if (isEditing) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <MealForm
          meal={meal || undefined}
          onSubmit={handleSubmit}
          onCancel={meal ? () => setIsEditing(false) : () => router.back()}
          loading={formLoading}
        />
      </SafeAreaView>
    )
  }

  if (!meal) {
    return null
  }

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <MealDetail
          meal={meal}
          onEdit={() => setIsEditing(true)}
          onAddToPlan={() => {
            // Navigate to plan selection
          }}
          onToggleFavorite={handleToggleFavorite}
          planOccurrences={planOccurrences}
          planOccurrencesLoading={planOccurrencesLoading}
        />
      </SafeAreaView>
    </View>
  )
}
