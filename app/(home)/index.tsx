import { ScrollView, Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { WeekView } from '@/components/plans/WeekView'
import { HomeHeader } from '@/components/home/HomeHeader'
import { useCurrentWeekPlan } from '@/hooks/useCurrentWeekPlan'
import { usePlanMeals } from '@/hooks/usePlanMeals'
import { PlanMeal } from '@/types/plan'

export default function HomePage() {
  const { plan, loading, refetch } = useCurrentWeekPlan()
  const { removePlanMeal } = usePlanMeals(plan?.id || 0)
  const router = useRouter()

  // Refetch current week plan when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch])
  )

  const handleAddMeal = (dayOfWeek: number) => {
    if (plan?.id) {
      router.push(`/(home)/meals?addToPlan=${plan.id}&day=${dayOfWeek}`)
    }
  }

  const handleMealPress = (planMeal: PlanMeal) => {
    Alert.alert(
      planMeal.meal?.title || 'Meal',
      'What would you like to do with this meal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Replace Meal',
          onPress: () => {
            if (plan?.id) {
              router.push(`/(home)/meals?addToPlan=${plan.id}&day=${planMeal.dayOfWeek}&replacePlanMealId=${planMeal.id}`)
            }
          },
        },
        {
          text: 'Remove Meal',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Remove Meal',
              'Are you sure you want to remove this meal from the plan?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: async () => {
                    const response = await removePlanMeal(planMeal.id)
                    if (response.error) {
                      Alert.alert('Error', response.error)
                    }
                  },
                },
              ]
            )
          },
        },
        {
          text: 'View Details',
          onPress: () => {
            router.push(`/(home)/meals/${planMeal.mealId}`)
          },
        },
      ],
      { cancelable: true }
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <HomeHeader />
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <WeekView 
            plan={plan} 
            loading={loading} 
            onAddMeal={handleAddMeal}
            onMealPress={handleMealPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
