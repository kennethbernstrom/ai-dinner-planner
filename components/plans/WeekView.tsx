import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { PlanMeal, PlanWithMeals } from '@/types/plan'
import { getDayName, addDays, getWeekStartDate } from '@/lib/utils/date'
import { Ionicons } from '@expo/vector-icons'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'

export interface WeekViewProps {
  // Either pass a full plan object
  plan?: PlanWithMeals | null
  loading?: boolean
  // Or pass individual props (for PlanDetail page)
  weekStartDate?: Date
  planMeals?: PlanMeal[]
  onMealPress?: (planMeal: PlanMeal) => void
  onAddMeal?: (dayOfWeek: number) => void
}

export function WeekView({
  plan,
  loading,
  weekStartDate,
  planMeals,
  onMealPress,
  onAddMeal,
}: WeekViewProps) {
  // Determine which data source to use
  const startDate = weekStartDate || (plan ? new Date(plan.weekStartDate) : getWeekStartDate())
  const meals = planMeals || plan?.planMeals || []

  if (loading) {
    return <LoadingSpinner />
  }

  if (!plan && !weekStartDate) {
    return (
      <EmptyState
        icon={<Ionicons name="calendar-outline" size={64} color="#d4d4d4" />}
        title="No Plan Yet"
        description="Create a weekly plan to get started"
      />
    )
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startDate, i)
    const dayMeals = meals.filter((pm) => pm.dayOfWeek === i && pm.mealSlot === 'dinner')
    return { dayOfWeek: i, date, meals: dayMeals }
  })

  // Get unscheduled meals (where dayOfWeek is null)
  const unscheduledMeals = meals.filter((pm) => pm.dayOfWeek === null)

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <View style={{ width: '100%' }}>
      {/* Unscheduled Meals Section */}
      {unscheduledMeals.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: '#eff6ff',
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: '#1e40af',
                marginBottom: 2,
              }}>
                Unscheduled Meals
              </Text>
              <Text style={{ 
                fontSize: 13, 
                color: '#3b82f6',
              }}>
                {unscheduledMeals.length} meal{unscheduledMeals.length === 1 ? '' : 's'} not yet assigned to a day
              </Text>
            </View>
            <View style={{ 
              backgroundColor: '#3b82f6', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 4 
            }}>
              <Text style={{ 
                color: '#ffffff', 
                fontSize: 11, 
                fontWeight: '600',
              }}>
                {unscheduledMeals.length}
              </Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            {unscheduledMeals.map((planMeal) => (
              <TouchableOpacity
                key={planMeal.id}
                onPress={() => onMealPress?.(planMeal)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: '#dbeafe',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                {/* Meal Image */}
                {planMeal.meal?.imageUrl ? (
                  <Image
                    source={{ uri: planMeal.meal.imageUrl }}
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: '#f5f5f5',
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: '#dbeafe',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="restaurant" size={32} color="#3b82f6" />
                  </View>
                )}

                {/* Meal Info */}
                <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#171717',
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {planMeal.meal?.title || 'Meal'}
                  </Text>
                  {planMeal.meal?.description && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#737373',
                        marginBottom: 6,
                      }}
                      numberOfLines={2}
                    >
                      {planMeal.meal.description}
                    </Text>
                  )}
                  {planMeal.meal?.tags && planMeal.meal.tags.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {planMeal.meal.tags.slice(0, 3).map((tag, idx) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: '#dbeafe',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ fontSize: 11, color: '#1e40af', fontWeight: '500' }}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <View style={{ paddingRight: 12, justifyContent: 'center' }}>
                  <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Scheduled Days */}
      {days.map((day, index) => (
        <View key={day.dayOfWeek} style={{ marginBottom: 16 }}>
          {/* Day Header */}
          <View 
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: isToday(day.date) ? '#fff7ed' : '#f5f5f5',
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '700', 
                color: isToday(day.date) ? '#ea580c' : '#171717',
                marginBottom: 2,
              }}>
                {getDayName(day.dayOfWeek)}
              </Text>
              <Text style={{ 
                fontSize: 13, 
                color: isToday(day.date) ? '#9a3412' : '#737373',
              }}>
                {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            {isToday(day.date) && (
              <View style={{ 
                backgroundColor: '#ea580c', 
                paddingHorizontal: 8, 
                paddingVertical: 4, 
                borderRadius: 4 
              }}>
                <Text style={{ 
                  color: '#ffffff', 
                  fontSize: 11, 
                  fontWeight: '600',
                }}>
                  TODAY
                </Text>
              </View>
            )}
          </View>

          {/* Meals for this day */}
          {day.meals.length > 0 ? (
            <View style={{ gap: 8 }}>
              {day.meals.map((planMeal) => (
                <TouchableOpacity
                  key={planMeal.id}
                  onPress={() => onMealPress?.(planMeal)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: '#e5e5e5',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  {/* Meal Image */}
                  {planMeal.meal?.imageUrl ? (
                    <Image
                      source={{ uri: planMeal.meal.imageUrl }}
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#f5f5f5',
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#fef3c7',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="restaurant" size={32} color="#f59e0b" />
                    </View>
                  )}

                  {/* Meal Info */}
                  <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#171717',
                        marginBottom: 4,
                      }}
                      numberOfLines={1}
                    >
                      {planMeal.meal?.title || 'Meal'}
                    </Text>
                    {planMeal.meal?.description && (
                      <Text
                        style={{
                          fontSize: 13,
                          color: '#737373',
                          marginBottom: 6,
                        }}
                        numberOfLines={2}
                      >
                        {planMeal.meal.description}
                      </Text>
                    )}
                    {planMeal.meal?.tags && planMeal.meal.tags.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                        {planMeal.meal.tags.slice(0, 3).map((tag, idx) => (
                          <View
                            key={idx}
                            style={{
                              backgroundColor: '#fef3c7',
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text style={{ fontSize: 11, color: '#92400e', fontWeight: '500' }}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Arrow */}
                  <View style={{ paddingRight: 12, justifyContent: 'center' }}>
                    <Ionicons name="chevron-forward" size={20} color="#d4d4d4" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => onAddMeal?.(day.dayOfWeek)}
              style={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#d4d4d4',
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
              }}
            >
              <Ionicons name="add-circle" size={32} color="#a3a3a3" />
              <Text style={{ fontSize: 14, color: '#737373', marginTop: 8, fontWeight: '500' }}>
                Add meal for {getDayName(day.dayOfWeek)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  )
}
