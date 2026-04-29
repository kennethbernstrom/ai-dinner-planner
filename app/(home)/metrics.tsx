import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { MetricsScreen } from '@/components/metrics/MetricsScreen'

export default function MetricsPage() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-4 pt-3 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color="#f97316" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-neutral-900 ml-3">Metrics</Text>
      </View>

      <MetricsScreen />
    </SafeAreaView>
  )
}
