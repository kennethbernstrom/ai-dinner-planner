import React, { useCallback, useEffect, useState } from 'react'
import { View, FlatList, TouchableOpacity, Text, Alert } from 'react-native'
import { PlanCard } from './PlanCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { usePlans } from '@/hooks/usePlans'
import { usePlansStore } from '@/lib/stores'
import { WeeklyPlan, PlanWithMeals } from '@/types/plan'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'

export interface PlansListProps {
  onPlanPress: (plan: WeeklyPlan) => void
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
}

export function PlansList({ onPlanPress, ListHeaderComponent }: PlansListProps) {
  const { plans, loading, error, fetchPlans, getPlan, deletePlan } = usePlans()
  const plansById = usePlansStore((state) => state.plansById)
  const router = useRouter()
  const [loadingDetails, setLoadingDetails] = useState(false)

  /** Stable while the same set of plan ids is listed; avoids re-running when details hydrate updates `plans` / `plansById` refs in the store. */
  const planIdsKey = [...plans]
    .map((p) => p.id)
    .sort((a, b) => a - b)
    .join(',')

  // Refetch plans when component comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPlans()
    }, [fetchPlans])
  )

  // Fetch detailed plan data (with meals) for each plan
  useEffect(() => {
    const fetchPlanDetails = async () => {
      const { plans: currentPlans, plansById: byId } = usePlansStore.getState()
      if (currentPlans.length === 0) {
        setLoadingDetails(false)
        return
      }

      const missing = currentPlans.filter((plan) => !byId.has(plan.id))
      if (missing.length === 0) {
        setLoadingDetails(false)
        return
      }

      setLoadingDetails(true)
      await Promise.all(missing.map((plan) => getPlan(plan.id)))
      setLoadingDetails(false)
    }

    void fetchPlanDetails()
  }, [planIdsKey, getPlan])

  // Get plans with meals from store
  const plansWithMeals: PlanWithMeals[] = plans.map(plan => {
    const detailedPlan = plansById.get(plan.id)
    return detailedPlan || { ...plan, planMeals: [] }
  })

  const handleDeletePlan = useCallback((plan: PlanWithMeals) => {
    Alert.alert(
      'Delete Plan',
      `Are you sure you want to delete "${plan.name}"? This will also remove all meals, sharing settings, and shopping lists associated with this plan. This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await deletePlan(plan.id)
            if (response.error) {
              Alert.alert('Error', response.error)
            }
          },
        },
      ]
    )
  }, [deletePlan])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <View className="p-4">
        <ErrorMessage message={error} />
      </View>
    )
  }

  const createPlanButton = (
    <View className="absolute bottom-6 right-6 z-10">
      <TouchableOpacity
        onPress={() => router.push('/(home)/plans/0')}
        activeOpacity={0.7}
        className="bg-orange-500 w-14 h-14 rounded-full items-center justify-center"
        style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  )

  return (
    <View className="flex-1 bg-white">
      {plans.length === 0 ? (
        <>
          {ListHeaderComponent}
          <EmptyState
            title="No plans yet"
            description="Create your first weekly dinner plan to get started"
            actionLabel="Create Plan"
            onAction={() => router.push('/(home)/plans/0')}
            icon={
              <Ionicons
                name="calendar-outline"
                size={64}
                color="#a3a3a3"
              />
            }
          />
        </>
      ) : (
        <>
          <FlatList
            data={plansWithMeals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PlanCard
                plan={item}
                onPress={() => onPlanPress(item)}
                onInfoPress={() => onPlanPress(item)}
                onEditPress={() => router.push(`/(home)/plans/${item.id}?edit=true`)}
                onSharePress={() => {
                  // TODO: Implement share functionality
                  console.log('Share plan:', item.id)
                }}
                onFavoritePress={() => {
                  // TODO: Implement favorite functionality
                  console.log('Favorite plan:', item.id)
                }}
                onDeletePress={() => handleDeletePlan(item)}
                className="mx-4 mb-4"
              />
            )}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 90 }}
            refreshing={loading || loadingDetails}
            onRefresh={fetchPlans}
          />
          {createPlanButton}
        </>
      )}
    </View>
  )
}
