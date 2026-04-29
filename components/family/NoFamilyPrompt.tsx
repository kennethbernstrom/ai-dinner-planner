import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'

interface NoFamilyPromptProps {
  message?: string
}

export function NoFamilyPrompt({ message }: NoFamilyPromptProps) {
  const router = useRouter()

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white">
      <View className="w-20 h-20 rounded-full bg-primary-100 justify-center items-center mb-6">
        <Ionicons name="people-outline" size={40} color="#ea580c" />
      </View>
      
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-3">
        No Family Found
      </Text>
      
      <Text className="text-base text-neutral-600 text-center mb-8 px-4">
        {message || 'You need to create or join a family to access meals and plans.'}
      </Text>

      <View className="w-full max-w-sm gap-3">
        <Button
          title="Create a Family"
          onPress={() => router.push('/(onboarding)/preferences')}
          variant="primary"
          size="lg"
        />
        
        <Text className="text-sm text-neutral-500 text-center">
          Or ask someone to share their family invite code with you
        </Text>
      </View>
    </View>
  )
}

