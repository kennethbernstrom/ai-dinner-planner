import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export function MealsHeader() {
  return (
    <View className="px-4 pt-3 pb-3">
      {/* Header Container */}
      <View className="bg-teal-500 rounded-2xl p-4 relative overflow-hidden">
        {/* Decorative circles */}
        <View className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full" />
        <View className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
        
        {/* Content */}
        <View className="relative z-10">
          {/* Icon and Title Row */}
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-2.5">
              <Ionicons name="restaurant" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                My Meals
              </Text>
              <Text className="text-xs font-medium text-white/80">
                Your collection of recipes
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

