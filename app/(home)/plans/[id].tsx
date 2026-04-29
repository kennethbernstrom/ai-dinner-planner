import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, Alert, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PlanDetail } from '@/components/plans/PlanDetail'
import { PlanForm } from '@/components/plans/PlanForm'
import { usePlans } from '@/hooks/usePlans'
import { usePlanMeals } from '@/hooks/usePlanMeals'
import { CreatePlanInput, UpdatePlanInput, PlanMeal, WeeklyPlan } from '@/types/plan'

export default function PlanDetailPage() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>()
  const router = useRouter()
  const { updatePlan, createPlan, getPlan } = usePlans()
  const [isEditing, setIsEditing] = useState(edit === 'true')
  const [plan, setPlan] = useState<WeeklyPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Parse id from string to number
  const planId = id ? parseInt(id, 10) : 0
  const { removePlanMeal, updateMeal } = usePlanMeals(planId || 0)

  // Function to trigger plan reload
  const reloadPlan = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Load plan data when editing
  useEffect(() => {
    const loadPlan = async () => {
      if (planId && planId !== 0) {
        setLoadingPlan(true)
        const response = await getPlan(planId)
        if (response.data) {
          setPlan(response.data)
        }
        setLoadingPlan(false)
      }
    }
    loadPlan()
  }, [planId, getPlan])

  const handleSubmit = async (input: CreatePlanInput | UpdatePlanInput) => {
    if (planId && planId !== 0) {
      await updatePlan(planId, input as UpdatePlanInput)
    } else {
      const response = await createPlan(input as CreatePlanInput)
      if (response.data) {
        router.replace(`/(home)/plans/${response.data.id}`)
      }
    }
    setIsEditing(false)
  }

  const handleScheduleToDay = (planMeal: PlanMeal) => {
    const days = [
      { name: 'Monday', value: 0 },
      { name: 'Tuesday', value: 1 },
      { name: 'Wednesday', value: 2 },
      { name: 'Thursday', value: 3 },
      { name: 'Friday', value: 4 },
      { name: 'Saturday', value: 5 },
      { name: 'Sunday', value: 6 },
    ]

    Alert.alert(
      'Schedule Meal',
      'Select which day you want to schedule this meal:',
      [
        ...days.map((day) => ({
          text: day.name,
          onPress: async () => {
            const response = await updateMeal(planMeal.mealId, {
              dayOfWeek: day.value,
            })
            if (response.error) {
              Alert.alert('Error', response.error)
            } else {
              Alert.alert('Success', `Meal scheduled for ${day.name}`)
              // Reload the plan to show updated state
              reloadPlan()
            }
          },
        })),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    )
  }

  const handleMealPress = (planMeal: PlanMeal) => {
    const dayParam = planMeal.dayOfWeek !== null ? `&day=${planMeal.dayOfWeek}` : ''
    
    // If meal is unscheduled, show schedule options first
    if (planMeal.dayOfWeek === null) {
      Alert.alert(
        planMeal.meal?.title || 'Meal',
        'This meal is not yet assigned to a specific day.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Schedule to Day',
            onPress: () => handleScheduleToDay(planMeal),
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
                      } else {
                        // Reload the plan to show updated state
                        reloadPlan()
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
    } else {
      // Meal is already scheduled, show regular options
      Alert.alert(
        planMeal.meal?.title || 'Meal',
        'What would you like to do with this meal?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Move to Different Day',
            onPress: () => handleScheduleToDay(planMeal),
          },
          {
            text: 'Replace Meal',
            onPress: () => {
              router.push(`/(home)/meals?addToPlan=${planId}${dayParam}&replacePlanMealId=${planMeal.id}&returnTo=detail`)
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
                      } else {
                        // Reload the plan to show updated state
                        reloadPlan()
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
  }

  if (isEditing || planId === 0) {
    // Show loading state while plan data is being fetched for editing
    if (loadingPlan && planId !== 0) {
      return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top', 'bottom']}>
          <Text className="text-neutral-500">Loading plan...</Text>
        </SafeAreaView>
      )
    }

    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <PlanForm
          plan={plan || undefined}
          planId={planId !== 0 ? planId : undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            if (planId === 0) {
              router.back()
            } else {
              setIsEditing(false)
            }
          }}
        />
      </SafeAreaView>
    )
  }

  if (!planId || planId === 0) {
    return null
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <PlanDetail
        key={refreshKey}
        planId={planId}
        onEdit={() => setIsEditing(true)}
        onShare={() => {
          // Share functionality handled by ShareButton
        }}
        onDelete={() => {
          router.back()
        }}
        onAddMeal={(dayOfWeek) => {
          // Check if there are unscheduled meals
          getPlan(planId).then((response) => {
            if (response.data) {
              const unscheduledMeals = response.data.planMeals.filter((pm) => pm.dayOfWeek === null)
              
              if (unscheduledMeals.length > 0) {
                // Show option to schedule existing unscheduled meal or add new one
                Alert.alert(
                  'Add Meal',
                  `You have ${unscheduledMeals.length} unscheduled meal${unscheduledMeals.length === 1 ? '' : 's'}. Would you like to schedule one of them or add a new meal?`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Schedule Existing Meal',
                      onPress: () => {
                        // Show list of unscheduled meals to choose from
                        const mealOptions = unscheduledMeals.map((meal) => ({
                          text: meal.meal?.title || 'Meal',
                          onPress: async () => {
                            const response = await updateMeal(meal.mealId, {
                              dayOfWeek: dayOfWeek,
                            })
                            if (response.error) {
                              Alert.alert('Error', response.error)
                            } else {
                              // Reload the plan to show updated state
                              reloadPlan()
                            }
                          },
                        }))
                        
                        Alert.alert(
                          'Select Meal to Schedule',
                          'Choose which unscheduled meal to add to this day:',
                          [
                            ...mealOptions,
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                          ],
                          { cancelable: true }
                        )
                      },
                    },
                    {
                      text: 'Add New Meal',
                      onPress: () => {
                        router.push(`/(home)/meals?addToPlan=${planId}&day=${dayOfWeek}&returnTo=detail`)
                      },
                    },
                  ],
                  { cancelable: true }
                )
              } else {
                // No unscheduled meals, go directly to add new meal
                router.push(`/(home)/meals?addToPlan=${planId}&day=${dayOfWeek}&returnTo=detail`)
              }
            }
          })
        }}
        onAddMealUnscheduled={() => {
          router.push(`/(home)/meals?addToPlan=${planId}&returnTo=detail`)
        }}
        onMealPress={handleMealPress}
        onCopy={(newPlanId) => {
          router.replace(`/(home)/plans/${newPlanId}`)
        }}
      />
    </SafeAreaView>
  )
}
