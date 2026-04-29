import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Meal, MealPlanOccurrence } from '@/types/meal'
import { formatWeekDate, getDayName } from '@/lib/utils/date'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

export interface MealDetailProps {
  meal: Meal
  onEdit?: () => void
  onAddToPlan?: () => void
  onToggleFavorite?: (mealId: number, isFavorite: boolean) => Promise<void>
  planOccurrences?: MealPlanOccurrence[]
  planOccurrencesLoading?: boolean
}

export function MealDetail({
  meal,
  onEdit,
  onAddToPlan,
  onToggleFavorite,
  planOccurrences = [],
  planOccurrencesLoading = false,
}: MealDetailProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(meal.isFavorite || false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'ingredients' | 'instructions' | 'planned'
  >('ingredients')
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<number, number>>({})

  // Sync favorite state when meal prop changes
  useEffect(() => {
    setIsFavorite(meal.isFavorite || false)
  }, [meal.isFavorite])

  const handleSourcePress = () => {
    if (meal.sourceUrl) {
      Linking.openURL(meal.sourceUrl)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const toggleFavorite = async () => {
    if (isTogglingFavorite || !onToggleFavorite) return
    
    setIsTogglingFavorite(true)
    const newFavoriteState = !isFavorite
    
    try {
      await onToggleFavorite(meal.id, newFavoriteState)
      setIsFavorite(newFavoriteState)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleAddAllToCart = () => {
    // TODO: Implement add all to cart functionality
    console.log('Add all ingredients to cart')
  }

  // Calculate estimated time based on content length (placeholder logic)
  const estimatedMinutes = meal.instructions 
    ? Math.max(15, Math.min(60, Math.ceil(meal.instructions.length / 20)))
    : 30

  // Get ingredient emoji/icon based on name (simplified logic)
  const getIngredientEmoji = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('tortilla') || lowerName.includes('chip')) return '🌮'
    if (lowerName.includes('avocado')) return '🥑'
    if (lowerName.includes('cabbage') || lowerName.includes('lettuce')) return '🥬'
    if (lowerName.includes('peanut') || lowerName.includes('nut')) return '🥜'
    if (lowerName.includes('onion')) return '🧅'
    if (lowerName.includes('tomato')) return '🍅'
    if (lowerName.includes('cheese')) return '🧀'
    if (lowerName.includes('pepper')) return '🌶️'
    if (lowerName.includes('carrot')) return '🥕'
    if (lowerName.includes('garlic')) return '🧄'
    if (lowerName.includes('lemon') || lowerName.includes('lime')) return '🍋'
    if (lowerName.includes('chicken')) return '🍗'
    if (lowerName.includes('beef') || lowerName.includes('meat')) return '🥩'
    if (lowerName.includes('fish') || lowerName.includes('salmon')) return '🐟'
    if (lowerName.includes('egg')) return '🥚'
    if (lowerName.includes('milk') || lowerName.includes('cream')) return '🥛'
    if (lowerName.includes('rice')) return '🍚'
    if (lowerName.includes('pasta')) return '🍝'
    if (lowerName.includes('bread')) return '🍞'
    return '🍽️' // Default icon
  }

  return (
    <View className="flex-1">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Hero Image Section */}
        <View className="relative">
          {meal.imageUrl ? (
            <Image
              source={{ uri: meal.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ) : (
            <LinearGradient
              colors={['#f97316', '#ea580c', '#c2410c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroImage}
            >
              <View className="flex-1 items-center justify-center">
                <Ionicons name="restaurant" size={80} color="white" style={{ opacity: 0.9 }} />
              </View>
            </LinearGradient>
          )}
          
          {/* Overlay Buttons */}
          <View className="absolute top-12 left-0 right-0 flex-row justify-between px-4">
            <TouchableOpacity 
              onPress={handleBack}
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg"
              style={styles.overlayButton}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={toggleFavorite}
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg"
              style={styles.overlayButton}
              disabled={isTogglingFavorite}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#f97316" : "#1f2937"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Card - Full Width */}
        <View className="-mt-16">
          <Card variant="elevated" className="bg-white rounded-t-[40px] shadow-none">
            {/* Title and Time */}
            <View className="flex-row justify-between items-start mb-3 px-2 pt-6">
              <Text className="flex-1 text-3xl font-bold text-neutral-900 mr-4">
                {meal.title}
              </Text>
              <View className="flex-row items-center bg-neutral-100 px-3 py-2 rounded-full">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text className="text-sm text-neutral-600 font-medium ml-1">
                  {estimatedMinutes} Min
                </Text>
              </View>
            </View>

            {/* Description */}
            {meal.description && (
              <Text className="text-base text-neutral-600 leading-relaxed mb-4 px-2">
                {meal.description}
                {meal.description.length > 100 && (
                  <Text className="text-primary-600 font-semibold"> View More</Text>
                )}
              </Text>
            )}

            {/* Tags */}
            {meal.tags && meal.tags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4 px-2">
                {meal.tags.map((tag) => (
                  <Badge key={tag} label={tag} variant="primary" size="md" />
                ))}
              </View>
            )}

            {/* Edit Button */}
            {onEdit && (
              <TouchableOpacity 
                onPress={onEdit}
                className="flex-row items-center justify-center bg-neutral-100 py-3 rounded-xl mb-6 mx-6"
              >
                <Ionicons name="create-outline" size={20} color="#f97316" />
                <Text className="text-base text-primary-600 font-semibold ml-2">
                  Edit Meal
                </Text>
              </TouchableOpacity>
            )}

            {/* Ingredients & Instructions Tabs */}
            <View>
              {/* Tab Switcher */}
              <View className="bg-neutral-200 rounded-3xl p-1 mx-2 mb-4">
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setActiveTab('ingredients')}
                    className={`flex-1 py-3 rounded-xl ${
                      activeTab === 'ingredients' ? 'bg-neutral-900' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-bold ${
                        activeTab === 'ingredients' ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      Ingredients
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('instructions')}
                    className={`flex-1 py-3 rounded-xl ${
                      activeTab === 'instructions' ? 'bg-neutral-900' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-bold ${
                        activeTab === 'instructions' ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      Instructions
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('planned')}
                    className={`flex-1 py-3 rounded-xl ${
                      activeTab === 'planned' ? 'bg-neutral-900' : 'bg-transparent'
                    }`}
                  >
                    <Text
                      className={`text-center text-sm font-bold ${
                        activeTab === 'planned' ? 'text-white' : 'text-neutral-900'
                      }`}
                    >
                      Planned
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

            {/* Ingredients Tab Content */}
            {activeTab === 'ingredients' && (
              <View className="px-2 mb-4">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <View>
                    <Text className="text-2xl font-bold text-neutral-900 mb-1">
                      Ingredients
                    </Text>
                    <Text className="text-sm text-neutral-500">
                      {meal.ingredients?.length || 0} Item{meal.ingredients?.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleAddAllToCart}>
                    <Text className="text-base text-primary-600 font-semibold">
                      Add All to Cart
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Ingredients List */}
                {meal.ingredients && meal.ingredients.length > 0 ? (
                  <View className="gap-3">
                    {meal.ingredients.map((ingredient) => {
                      const quantity = ingredientQuantities[ingredient.id] || 1
                      const displayQuantity = ingredient.quantity 
                        ? `${parseFloat(ingredient.quantity) * quantity}${ingredient.unit ? ` ${ingredient.unit}` : ''}`
                        : ''
                      
                      return (
                        <View
                          key={ingredient.id}
                          className="flex-row items-center bg-neutral-50 p-4 rounded-2xl"
                        >
                          {/* Ingredient Icon */}
                          <View className="w-14 h-14 bg-neutral-200 rounded-2xl items-center justify-center mr-4">
                            <Text className="text-2xl">
                              {getIngredientEmoji(ingredient.name)}
                            </Text>
                          </View>

                          {/* Ingredient Info */}
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-neutral-900 mb-1">
                              {ingredient.name}
                            </Text>
                            {displayQuantity && (
                              <Text className="text-sm text-neutral-500">
                                {displayQuantity}
                              </Text>
                            )}
                          </View>

                        </View>
                      )
                    })}
                  </View>
                ) : (
                  <View className="py-8 items-center">
                    <Ionicons name="restaurant-outline" size={48} color="#d1d5db" />
                    <Text className="text-neutral-500 text-center mt-3">
                      No ingredients added yet
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Instructions Tab Content */}
            {activeTab === 'instructions' && (
              <View className="px-2 mb-4">
                <Text className="text-2xl font-bold text-neutral-900 mb-4">
                  Instructions
                </Text>
                {meal.instructions ? (
                  <Text className="text-base text-neutral-700 leading-relaxed">
                    {meal.instructions}
                  </Text>
                ) : (
                  <View className="py-8 items-center">
                    <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
                    <Text className="text-neutral-500 text-center mt-3">
                      No instructions added yet
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Planned tab — list only mounts when this tab is selected */}
            {activeTab === 'planned' && (
              <View className="px-2 mb-4">
                <Text className="text-2xl font-bold text-neutral-900 mb-4">
                  Planned on
                </Text>
                {planOccurrencesLoading ? (
                  <Text className="text-sm text-neutral-500">Loading…</Text>
                ) : planOccurrences.length === 0 ? (
                  <Text className="text-sm text-neutral-500">
                    This meal is not on any weekly plan yet.
                  </Text>
                ) : (
                  <View className="gap-2">
                    {planOccurrences.map((occ) => {
                      const primary =
                        occ.scheduledDate !== null
                          ? formatWeekDate(occ.scheduledDate)
                          : `Week of ${formatWeekDate(occ.weekStartDate)}`
                      const detail =
                        occ.scheduledDate !== null
                          ? occ.dayOfWeek !== null
                            ? `${getDayName(occ.dayOfWeek)} · ${occ.planName}`
                            : occ.planName
                          : 'Not assigned to a day yet'
                      return (
                        <TouchableOpacity
                          key={occ.planMealId}
                          onPress={() =>
                            router.push(`/(home)/plans/${occ.planId}`)
                          }
                          className="bg-neutral-50 p-4 rounded-2xl flex-row items-center"
                          activeOpacity={0.7}
                        >
                          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="calendar-outline" size={20} color="#f97316" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-neutral-900">
                              {primary}
                            </Text>
                            <Text className="text-sm text-neutral-500 mt-0.5" numberOfLines={2}>
                              {detail}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                )}
              </View>
            )}
            </View>

            {/* Source URL */}
            {meal.sourceUrl && (
              <TouchableOpacity
                onPress={handleSourcePress}
                className="mx-6 mb-4 bg-neutral-50 p-4 rounded-2xl"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="link" size={20} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base text-neutral-900 font-semibold mb-1">
                      View Original Recipe
                    </Text>
                    <Text className="text-sm text-neutral-500" numberOfLines={1}>
                      {meal.sourceUrl}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            )}

            {/* Add to Plan Button */}
            {onAddToPlan && (
              <View className="px-6 pb-6">
                <Button
                  title="Add to Meal Plan"
                  onPress={onAddToPlan}
                  variant="primary"
                  size="lg"
                />
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 400,
  },
  overlayButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
})
