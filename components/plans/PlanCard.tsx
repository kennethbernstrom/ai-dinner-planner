import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { PlanWithMeals } from '@/types/plan'
import { formatWeekDate } from '@/lib/utils/date'
import { Ionicons } from '@expo/vector-icons'

export interface PlanCardProps {
  plan: PlanWithMeals
  onPress: () => void
  onInfoPress?: () => void
  onEditPress?: () => void
  onSharePress?: () => void
  onFavoritePress?: () => void
  onDeletePress?: () => void
  className?: string
}

export function PlanCard({ 
  plan, 
  onPress, 
  onInfoPress,
  onEditPress,
  onSharePress,
  onFavoritePress,
  onDeletePress,
  className = '' 
}: PlanCardProps) {
  // Get unique meal images from planMeals
  const mealImages = plan.planMeals
    ?.map(pm => pm.meal?.imageUrl)
    .filter((url): url is string => !!url)
    .slice(0, 3) || []
  
  const mealCount = plan.planMeals?.length || 0
  const daysWithMeals = new Set(plan.planMeals?.filter(pm => pm.dayOfWeek !== null).map(pm => pm.dayOfWeek)).size

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7} 
      className={className}
    >
      <View className="bg-orange-200 rounded-3xl p-4">
        {/* Top Badge */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center bg-orange-500 px-2.5 py-1 rounded-full">
            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
            <Text className="text-xs font-semibold text-white ml-1">
              Week of {formatWeekDate(plan.weekStartDate)}
            </Text>
          </View>
          {plan.visibility === 'shared' && (
            <View className="bg-orange-500 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-semibold text-white">Shared</Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View className="flex-row items-start">
          {/* Left: Meal Images or Food Icon */}
          <View className="mr-3">
            {mealImages.length > 0 ? (
              <View className="relative">
                {/* Primary image */}
                <View className="w-16 h-16 rounded-full overflow-hidden bg-neutral-100 border-2 border-white">
                  <Image 
                    source={{ uri: mealImages[0] }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                {/* Secondary images overlay */}
                {mealImages.length > 1 && (
                  <View className="absolute -bottom-1.5 -right-1.5 flex-row">
                    {mealImages.slice(1, 3).map((imageUrl, index) => (
                      <View 
                        key={index}
                        className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100 border-2 border-white -ml-1.5"
                        style={{ zIndex: 2 - index }}
                      >
                        <Image 
                          source={{ uri: imageUrl }} 
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center border-2 border-white">
                <Ionicons name="restaurant" size={28} color="#fb923c" />
              </View>
            )}
          </View>

          {/* Right: Plan Info */}
          <View className="flex-1">
            <View className="bg-white rounded-xl p-2.5 mb-2">
              <Text 
                className="text-lg font-bold text-orange-500 mb-0.5" 
                numberOfLines={1}
              >
                {plan.name}
              </Text>
              <Text className="text-xs text-gray-500">
                {mealCount === 0 
                  ? 'No meals planned yet' 
                  : `${mealCount} meal${mealCount > 1 ? 's' : ''} • ${daysWithMeals} day${daysWithMeals > 1 ? 's' : ''}`
                }
              </Text>
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row items-center justify-between">
              {/* Info Button */}
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onInfoPress?.()
                  onPress()
                }}
                className="bg-orange-500 px-5 py-1.5 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-xs">Info</Text>
              </TouchableOpacity>

              {/* Icon Buttons */}
              <View className="flex-row items-center">
                {onEditPress && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation()
                      onEditPress()
                    }}
                    className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-1.5"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={16} color="#f97316" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation()
                    onSharePress?.()
                  }}
                  className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-1.5"
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={16} color="#f97316" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation()
                    // TODO: Implement help/info
                  }}
                  className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-1.5"
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle-outline" size={16} color="#f97316" />
                </TouchableOpacity>
 
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation()
                    onFavoritePress?.()
                  }}
                  className="w-8 h-8 bg-white rounded-xl items-center justify-center mr-1.5"
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle-outline" size={16} color="#f97316" />
                </TouchableOpacity>
 
                {onDeletePress && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation()
                      onDeletePress()
                    }}
                    className="w-8 h-8 bg-white rounded-xl items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}

              </View>
            </View>
          </View>
        </View>

        {/* Rating/Meal Count Badge */}
        {mealCount > 0 && (
          <View className="absolute top-2.5 right-2.5 bg-white rounded-full px-2 py-0.5 flex-row items-center">
            <Ionicons name="star" size={12} color="#f97316" />
            <Text className="text-xs font-semibold text-neutral-900 ml-1">
              {mealCount > 0 ? '4.8' : '0.0'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
