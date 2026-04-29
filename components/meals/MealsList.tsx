import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { MealCard } from './MealCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Card } from '@/components/ui/Card'
import { NoFamilyPrompt } from '@/components/family/NoFamilyPrompt'
import { useMeals } from '@/hooks/useMeals'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { Meal } from '@/types/meal'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'

export interface MealsListProps {
  onMealPress: (meal: Meal) => void
  onMealEdit?: (meal: Meal) => void
  isSelectionMode?: boolean
  loading?: boolean
  replaceMode?: boolean
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null
}

export function MealsList({ onMealPress, onMealEdit, isSelectionMode = false, loading: addingMeal = false, replaceMode = false, ListHeaderComponent }: MealsListProps) {
  const { familyId, loading: familyLoading } = useCurrentFamily()
  const { meals, loading, error, fetchMeals } = useMeals()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const router = useRouter()

  // Refetch meals when component comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMeals()
    }, [fetchMeals])
  )

  // Extract unique tags from all meals
  const uniqueTags = React.useMemo(() => {
    const tagsSet = new Set<string>()
    meals.forEach(meal => {
      meal.tags?.forEach(tag => {
        if (tag && tag.trim()) {
          tagsSet.add(tag)
        }
      })
    })
    return Array.from(tagsSet).sort()
  }, [meals])

  // Get favorite meals
  const favoriteMeals = React.useMemo(() => {
    return meals.filter(meal => meal.isFavorite).slice(0, 10) // Limit to 10 favorites
  }, [meals])

  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || 
      meal.tags?.some(tag => tag === selectedFilter)
    return matchesSearch && matchesFilter
  })

  const renderFilterButton = (label: string, filter: string) => {
    const isSelected = selectedFilter === filter
    // Capitalize first letter
    const displayLabel = label.charAt(0).toUpperCase() + label.slice(1)
    
    return (
      <TouchableOpacity
        key={filter}
        onPress={() => setSelectedFilter(isSelected ? 'all' : filter)}
        activeOpacity={0.7}
        className={`px-6 py-2.5 rounded-full mr-2.5 ${
          isSelected ? 'bg-teal-500' : 'bg-neutral-100'
        }`}
      >
        <Text className={`font-medium ${
          isSelected ? 'text-white' : 'text-neutral-600'
        }`}>
          {displayLabel}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderFavoriteMealCard = (meal: Meal) => {
    // Truncate title if too long
    const truncatedTitle = meal.title.length > 15 
      ? meal.title.substring(0, 15) + '...' 
      : meal.title

    return (
      <TouchableOpacity
        key={meal.id}
        onPress={() => !addingMeal && onMealPress(meal)}
        activeOpacity={0.7}
        className="mr-4"
        disabled={addingMeal}
      >
        <View className="items-center">
          {/* Circular Image */}
          <View className="w-24 h-24 rounded-3xl overflow-hidden bg-neutral-100 mb-2">
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
                <Ionicons name="restaurant" size={40} color="white" style={{ opacity: 0.9 }} />
              </LinearGradient>
            )}
          </View>
          
          {/* Title */}
          <Text className="text-sm font-semibold text-neutral-900 text-center" numberOfLines={1}>
            {truncatedTitle}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderListHeader = () => {
    // Only favorites section in the scrollable header
    if (!isSelectionMode && favoriteMeals.length > 0) {
      return (
        <View className="bg-white pb-4">
          {/* Section Header */}
          <View className="flex-row justify-between items-center px-4 mb-3">
            <Text className="text-xl font-bold text-neutral-900">
              My favorite meals
            </Text>
            <TouchableOpacity 
              onPress={() => {
                // Filter to show only favorites
                setSearchQuery('')
                setSelectedFilter('all')
              }}
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-teal-500">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Scrollable List */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            nestedScrollEnabled={true}
          >
            {favoriteMeals.map(meal => renderFavoriteMealCard(meal))}
          </ScrollView>
        </View>
      )
    }
    return null
  }

  if (familyLoading || loading) {
    return <LoadingSpinner />
  }

  // Show prompt if user doesn't have a family
  if (!familyId) {
    return <NoFamilyPrompt message="You need to join or create a family to access meals." />
  }

  if (error) {
    return (
      <View className="p-4">
        <ErrorMessage message={error} />
      </View>
    )
  }

  const renderHeader = () => {
    const HeaderComponent = ListHeaderComponent
    return (
      <>
        {HeaderComponent && (
          typeof HeaderComponent === 'function' 
            ? <HeaderComponent /> 
            : HeaderComponent
        )}
      </>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {renderHeader()}
      
      {isSelectionMode && (
        <View className="p-4 bg-primary-50 border-b border-primary-200">
          <Text className="text-base font-semibold text-primary-900 text-center">
            {replaceMode ? 'Select a meal to replace the current one' : 'Select a meal to add to your plan'}
          </Text>
        </View>
      )}

      {/* Search Bar - Fixed at top, not scrollable */}
      <View className="px-4 pt-4 pb-2 bg-white">
        <View className="flex-row items-center bg-neutral-50 rounded-full px-4 py-3 border border-neutral-200">
          <Ionicons name="search" size={20} color="#737373" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            className="flex-1 text-base text-neutral-900 ml-2"
            placeholderTextColor="#a3a3a3"
          />
        </View>
      </View>
      
      {/* Filter Tags - Fixed at top, not scrollable */}
      {uniqueTags.length > 0 && (
        <View className="pb-3 bg-white">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {uniqueTags.map(tag => renderFilterButton(tag, tag))}
          </ScrollView>
        </View>
      )}

      {filteredMeals.length === 0 ? (
        <EmptyState
          title={searchQuery || selectedFilter !== 'all' ? 'No meals found' : 'No meals yet'}
          description={
            searchQuery || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first meal to get started'
          }
          actionLabel="Create Meal"
          onAction={() => router.push('/(home)/meals/new')}
          icon={
            <Ionicons
              name="restaurant-outline"
              size={64}
              color="#a3a3a3"
            />
          }
        />
      ) : (
        <>
          <FlatList
            data={filteredMeals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MealCard
                meal={item}
                onPress={() => !addingMeal && onMealPress(item)}
                onEdit={onMealEdit && !isSelectionMode ? () => onMealEdit(item) : undefined}
                className="mx-4 mb-3"
                disabled={addingMeal}
              />
            )}
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            refreshing={loading && !isSelectionMode}
            onRefresh={fetchMeals}
          />
          
          {/* Floating Action Button for Create Meal */}
          {!isSelectionMode && (
            <View className="absolute bottom-2 right-6 z-10">
              <TouchableOpacity
                onPress={() => router.push('/(home)/meals/new')}
                activeOpacity={0.7}
                className="bg-teal-500 w-14 h-14 rounded-full items-center justify-center"
                style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
              >
                <Ionicons name="add" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  )
}
