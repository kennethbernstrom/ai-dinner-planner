import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { TopMealsSection } from '@/components/metrics/sections'

export function MetricsScreen() {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
      <View className="mt-4">
        <Text className="text-2xl font-bold text-neutral-900">Metrics</Text>
        <Text className="text-base text-neutral-600 mt-1">
          Insights for your family meal planning patterns.
        </Text>
      </View>

      <View className="mt-5">
        <TopMealsSection />
      </View>

      <View className="mt-5 bg-white rounded-3xl p-5 border border-dashed border-neutral-300">
        <Text className="text-base font-semibold text-neutral-800">More metrics coming soon</Text>
        <Text className="text-sm text-neutral-600 mt-1">
          This section is ready for additional metric cards as new insights are added.
        </Text>
      </View>
    </ScrollView>
  )
}
