import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import { PlanFormHeader } from '@/components/plans/PlanFormHeader'
import { WeeklyCalendar } from '@/components/plans/WeeklyCalendar'
import { usePlanForm } from '@/hooks/usePlanForm'
import { usePlans } from '@/hooks/usePlans'
import { usePlanMeals } from '@/hooks/usePlanMeals'
import { WeeklyPlan, PlanMeal } from '@/types/plan'
import { getWeekStartDate } from '@/lib/utils/date'

export interface PlanFormProps {
  plan?: WeeklyPlan
  planId?: number
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export function PlanForm({ plan, planId, onSubmit, onCancel, loading = false }: PlanFormProps) {
  const router = useRouter()
  const { getPlanByWeekStartDate, getPlan } = usePlans()
  const [planMeals, setPlanMeals] = useState<PlanMeal[]>([])
  const [loadingMeals, setLoadingMeals] = useState(false)
  
  // Use planId if provided, otherwise use plan.id if plan exists
  const activePlanId = planId || plan?.id
  const { removePlanMeal } = usePlanMeals(activePlanId || 0)
  
  const form = usePlanForm(
    plan
      ? {
          name: plan.name,
          weekStartDate: new Date(plan.weekStartDate),
          visibility: plan.visibility as 'private' | 'shared',
        }
      : undefined
  )

  // Load plan meals if editing an existing plan
  const loadPlanMeals = useCallback(async () => {
    if (activePlanId) {
      setLoadingMeals(true)
      const response = await getPlan(activePlanId)
      if (response.data) {
        setPlanMeals(response.data.planMeals || [])
      }
      setLoadingMeals(false)
    }
  }, [activePlanId, getPlan])

  useEffect(() => {
    loadPlanMeals()
  }, [loadPlanMeals])

  // Reload meals when screen comes into focus (after adding/editing meals)
  useFocusEffect(
    useCallback(() => {
      loadPlanMeals()
    }, [loadPlanMeals])
  )

  const checkExistingPlan = async (date: Date) => {
    const response = await getPlanByWeekStartDate(date)
    
    if (response.data && response.data !== null) {
      const existingPlan = response.data
      
      // If editing, check if the existing plan is the current plan being edited
      if (plan && existingPlan.id === plan.id) {
        // This is the current plan, no conflict
        return
      }
      
      // If editing a different plan or creating a new one, show alert
      const weekStartFormatted = new Date(existingPlan.weekStartDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      
      Alert.alert(
        'Plan Already Exists',
        `A plan named "${existingPlan.name}" already exists for the week starting ${weekStartFormatted}.\n\nWould you like to view it or select a different date?`,
        [
          {
            text: 'Select Different Date',
            style: 'cancel',
          },
          {
            text: 'View Existing Plan',
            onPress: () => {
              if (onCancel) onCancel()
              router.push(`/(home)/plans/${existingPlan.id}`)
            },
          },
        ]
      )
    }
  }

  const handleSubmit = async () => {
    if (!form.validate()) return

    // Check for duplicate plans before submitting
    const response = await getPlanByWeekStartDate(form.formData.weekStartDate)
    if (response.data && response.data !== null) {
      const existingPlan = response.data
      
      // If editing, check if the existing plan is the current plan being edited
      if (plan && existingPlan.id === plan.id) {
        // This is the current plan, no conflict - proceed with submission
      } else {
        // Duplicate plan exists
        Alert.alert(
          'Plan Already Exists',
          `A plan already exists for this week. Please select a different week start date.`,
          [{ text: 'OK' }]
        )
        return
      }
    }

    const input = plan ? form.toUpdateInput() : form.toCreateInput()
    await onSubmit(input)
  }

  const handleAddMeal = (dayOfWeek: number) => {
    if (!activePlanId && !plan) {
      Alert.alert(
        'Save Plan First',
        'Please save the plan before adding meals.',
        [{ text: 'OK' }]
      )
      return
    }

    const planIdToUse = activePlanId || plan?.id
    router.push(`/(home)/meals?addToPlan=${planIdToUse}&day=${dayOfWeek}&returnTo=edit`)
  }

  const handleMealPress = (planMeal: PlanMeal) => {
    if (!activePlanId && !plan) return

    const actions = [
      {
        text: 'Cancel',
        style: 'cancel' as const,
      },
      {
        text: 'Replace Meal',
        onPress: () => {
          const planIdToUse = activePlanId || plan?.id
          const dayParam = planMeal.dayOfWeek !== null ? `&day=${planMeal.dayOfWeek}` : ''
          router.push(`/(home)/meals?addToPlan=${planIdToUse}${dayParam}&replacePlanMealId=${planMeal.id}&returnTo=edit`)
        },
      },
    ]

    // Add "Assign to Day" option if meal is unscheduled
    if (planMeal.dayOfWeek === null) {
      actions.push({
        text: 'Assign to Day',
        onPress: () => {
          Alert.alert(
            'Assign to Day',
            'This feature will be available soon. For now, you can replace this meal with the same meal on a specific day.',
            [{ text: 'OK' }]
          )
        },
      })
    }

    actions.push(
      {
        text: 'Remove Meal',
        style: 'destructive' as const,
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
                    // Refresh plan meals
                    setPlanMeals(prev => prev.filter(pm => pm.id !== planMeal.id))
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
      }
    )

    Alert.alert(
      planMeal.meal?.title || 'Meal',
      planMeal.dayOfWeek === null 
        ? 'This meal is not yet assigned to a specific day.'
        : 'What would you like to do with this meal?',
      actions,
      { cancelable: true }
    )
  }

  return (
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <PlanFormHeader isEdit={!!plan} />
      
      <View className="px-4 pt-2">
        <Input
        label="Plan Name *"
        value={form.formData.name}
        onChangeText={(text) => form.updateField('name', text)}
        placeholder="e.g., Week of Jan 15"
        error={form.errors.name}
        className="mb-4"
      />

      <DatePicker
        label="Week Start Date *"
        value={form.formData.weekStartDate}
        onChange={async (date) => {
          // Normalize to Monday (week start)
          const normalizedDate = getWeekStartDate(date)
          form.updateField('weekStartDate', normalizedDate)
          
          // Check if a plan already exists for this week
          await checkExistingPlan(normalizedDate)
        }}
        error={form.errors.weekStartDate}
        className="mb-4"
      />

      <Select
        label="Visibility"
        value={form.formData.visibility}
        onValueChange={(value) =>
          form.updateField('visibility', value as 'private' | 'shared')
        }
        options={[
          { label: 'Private', value: 'private' },
          { label: 'Shared', value: 'shared' },
        ]}
        className="mb-6"
      />

        {/* Show WeeklyCalendar for editing existing plans or if we have a planId */}
        {(plan || activePlanId) && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-neutral-900 mb-3">
              Meals for this week
            </Text>
            {loadingMeals ? (
              <View className="items-center py-8">
                <Text className="text-neutral-500">Loading meals...</Text>
              </View>
            ) : (
              <WeeklyCalendar
                weekStartDate={form.formData.weekStartDate}
                planMeals={planMeals}
                onAddMeal={handleAddMeal}
                onMealPress={handleMealPress}
              />
            )}
            <Text className="text-sm text-neutral-500 mt-2 px-1">
              {plan ? 'Add or manage meals for this plan' : 'Save the plan first to add meals'}
            </Text>
          </View>
        )}

        <View className="gap-3 mt-4">
          <Button
            title={plan ? 'Update Plan' : 'Create Plan'}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
            size="lg"
          />
          {onCancel && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="ghost"
              size="md"
            />
          )}
        </View>
      </View>
    </ScrollView>
  )
}
