import React, { useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { useTopPlannedMeals } from '@/hooks/useTopPlannedMeals'
import { TopMealsScope } from '@/types/metrics'

export function TopMealsSection() {
  const router = useRouter()
  const [scope, setScope] = useState<TopMealsScope>('all')
  const { topMeals, loading, error, currentYear } = useTopPlannedMeals(scope)

  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
      <Text className="text-xl font-bold text-neutral-900">Top Meals</Text>
      <Text className="text-sm text-neutral-600 mt-1">
        Ranked by how often meals are scheduled in weekly plans.
      </Text>

      <View className="flex-row bg-neutral-100 rounded-xl p-1 mt-4">
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg ${scope === 'all' ? 'bg-orange-500' : 'bg-transparent'}`}
          onPress={() => setScope('all')}
          activeOpacity={0.8}
        >
          <Text className={`text-center font-semibold ${scope === 'all' ? 'text-white' : 'text-neutral-700'}`}>
            All time
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-2 rounded-lg ${scope === 'year' ? 'bg-orange-500' : 'bg-transparent'}`}
          onPress={() => setScope('year')}
          activeOpacity={0.8}
        >
          <Text className={`text-center font-semibold ${scope === 'year' ? 'text-white' : 'text-neutral-700'}`}>
            {currentYear}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator size="small" color="#f97316" />
        </View>
      ) : error ? (
        <View className="mt-5 rounded-2xl bg-red-50 border border-red-200 p-4">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      ) : topMeals.length === 0 ? (
        <View className="mt-5 rounded-2xl bg-neutral-50 border border-neutral-200 p-5 items-center">
          <Ionicons name="analytics-outline" size={22} color="#737373" />
          <Text className="text-base text-neutral-800 font-semibold mt-2">
            No meal activity yet
          </Text>
          <Text className="text-sm text-neutral-600 text-center mt-1">
            Meals will appear here once they are added to your weekly plans.
          </Text>
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {topMeals.map((meal) => (
            <TouchableOpacity
              key={meal.mealId}
              className="flex-row items-center bg-neutral-50 rounded-2xl px-3 py-3 border border-neutral-100"
              onPress={() => router.push(`/(home)/meals/${meal.mealId}`)}
              activeOpacity={0.8}
            >
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Text className="text-orange-600 font-bold">{meal.rank}</Text>
              </View>

              <View className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-200 mr-3">
                {meal.imageUrl ? (
                  <Image
                    source={{ uri: meal.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-neutral-200">
                    <Ionicons name="restaurant-outline" size={20} color="#737373" />
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-base text-neutral-900 font-semibold" numberOfLines={1}>
                  {meal.title}
                </Text>
                <Text className="text-sm text-neutral-600">
                  {meal.timesScheduled} scheduled {meal.timesScheduled === 1 ? 'time' : 'times'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}
