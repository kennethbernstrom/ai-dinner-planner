import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { PlanWithMeals } from '@/types/plan'
import { WeekView } from './WeekView'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { usePlans } from '@/hooks/usePlans'
import { formatWeekDate } from '@/lib/utils/date'
import { Ionicons } from '@expo/vector-icons'

export interface PlanDetailProps {
  planId: number
  onEdit?: () => void
  onShare?: () => void
  onDelete?: () => void
  onAddMeal?: (dayOfWeek: number) => void
  onAddMealUnscheduled?: () => void
  onMealPress?: (planMeal: any) => void
  onCopy?: (newPlanId: number) => void
}

export function PlanDetail({
  planId,
  onEdit,
  onShare,
  onDelete,
  onAddMeal,
  onAddMealUnscheduled,
  onMealPress,
  onCopy,
}: PlanDetailProps) {
  const { getPlan, duplicatePlan, deletePlan, loading, error } = usePlans()
  const [plan, setPlan] = useState<PlanWithMeals | null>(null)
  const [copying, setCopying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadPlan = useCallback(async () => {
    const response = await getPlan(planId)
    if (response.data) {
      setPlan(response.data)
    }
  }, [planId, getPlan])

  useEffect(() => {
    loadPlan()
  }, [planId])

  // Refresh plan when screen comes into focus (e.g., after adding a meal)
  useFocusEffect(
    useCallback(() => {
      loadPlan()
    }, [loadPlan])
  )

  const handleCopy = async () => {
    if (!plan) return

    Alert.alert(
      'Copy Plan',
      'This will create a copy of this plan with the same meals. You can then edit the week start date.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Copy',
          onPress: async () => {
            setCopying(true)
            const response = await duplicatePlan(planId)
            setCopying(false)
            
            if (response.error) {
              Alert.alert('Error', response.error)
            } else if (response.data) {
              Alert.alert('Success', 'Plan copied successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (onCopy) {
                      onCopy(response.data!.id)
                    }
                  },
                },
              ])
            }
          },
        },
      ]
    )
  }

  const handleDelete = async () => {
    if (!plan) return

    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan? This will also remove all meals, sharing settings, and shopping lists associated with this plan. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            const response = await deletePlan(planId)
            setDeleting(false)
            
            if (response.error) {
              Alert.alert('Error', response.error)
            } else {
              if (onDelete) {
                onDelete()
              }
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !plan) {
    return (
      <View className="p-4">
        <ErrorMessage message={error || 'Plan not found'} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingTop: 16, 
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        backgroundColor: '#ffffff',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#171717', marginBottom: 4 }}>
              {plan.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#737373' }}>
              Week of {formatWeekDate(plan.weekStartDate)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={handleCopy} disabled={copying}>
              <Ionicons 
                name="copy-outline" 
                size={24} 
                color={copying ? "#a3a3a3" : "#f97316"} 
              />
            </TouchableOpacity>
            {onShare && (
              <TouchableOpacity onPress={onShare}>
                <Ionicons name="share-outline" size={24} color="#f97316" />
              </TouchableOpacity>
            )}
            {onEdit && (
              <TouchableOpacity onPress={onEdit}>
                <Ionicons name="create-outline" size={24} color="#f97316" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={handleDelete} disabled={deleting}>
                <Ionicons 
                  name="trash-outline" 
                  size={24} 
                  color={deleting ? "#a3a3a3" : "#ef4444"} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Add Meal Button */}
        {onAddMealUnscheduled && (
          <TouchableOpacity
            onPress={onAddMealUnscheduled}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f97316',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              gap: 8,
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#ffffff' }}>
              Add Meal to Plan
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Week List View */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <WeekView
          weekStartDate={new Date(plan.weekStartDate)}
          planMeals={plan.planMeals}
          onMealPress={onMealPress}
          onAddMeal={onAddMeal}
        />
      </ScrollView>
    </View>
  )
}
