import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Meal } from '@/types/meal'
import { Ionicons } from '@expo/vector-icons'

export interface MealCardProps {
  meal: Meal
  onPress: () => void
  onEdit?: () => void
  className?: string
  disabled?: boolean
}

export function MealCard({ meal, onPress, onEdit, className = '', disabled = false }: MealCardProps) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={disabled ? 1 : 0.7} 
      disabled={disabled} 
      className={className}
    >
      <View className="bg-white rounded-3xl px-2 py-3 flex-row items-start shadow-sm">
        {/* Meal Image */}
        <View className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 mr-4">
          {meal.imageUrl ? (
            <Image
              source={{ uri: meal.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={['#14b8a6', '#0d9488', '#0f766e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="restaurant" size={48} color="white" style={{ opacity: 0.9 }} />
            </LinearGradient>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-lg font-bold text-neutral-900 mb-1 mt-1" numberOfLines={2}>
            {meal.title}
          </Text>
          
          {/* Tags */}
          {meal.tags && meal.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-1">
              {meal.tags.slice(0, 2).map((tag) => (
                <View key={tag} className="bg-neutral-100 px-2 py-1 rounded-full">
                  <Text className="text-xs text-neutral-600">
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Arrow Button */}
        <View className="ml-2 mr-4 mt-4">
          <View className="w-8 h-8 bg-neutral-900 rounded-lg items-center justify-center">
            <Ionicons name="arrow-forward" size={24} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
