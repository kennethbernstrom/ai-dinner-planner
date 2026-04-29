import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { FamilySwitcher } from '@/components/family/FamilySwitcher'

export function HomeHeader() {
  const { user } = useUser()
  const router = useRouter()

  const firstName = user?.firstName || 'User'
  const imageUrl = user?.imageUrl

  return (
    <View className="px-4 pt-4">
      {/* Profile and Icons Row */}
      <View className="flex-row items-center justify-between mb-3">
        {/* Profile Section */}
        <View className="flex-row items-center flex-1">
          {/* Profile Picture */}
          <View className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden mr-4">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <View className="w-full h-full bg-neutral-300 items-center justify-center">
                <Text className="text-2xl text-neutral-600">{firstName[0]}</Text>
              </View>
            )}
          </View>

          {/* Welcome Text */}
          <View className="flex-1">
            <Text className="text-base text-orange-500 mb-1">
              Welcome
            </Text>
            <Text className="text-lg font-bold text-neutral-900">
              {firstName}
            </Text>
          </View>
        </View>

        {/* Icon Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
            <Ionicons name="notifications-outline" size={24} color="#f97316" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(home)/metrics')}
            className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center"
          >
            <Ionicons name="bar-chart-outline" size={24} color="#f97316" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Family Switcher */}
      <FamilySwitcher className="mb-3" />

    </View>
  )
}

