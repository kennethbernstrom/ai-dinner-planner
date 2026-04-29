import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { PlanMeal } from '@/types/plan'
import { getDayAbbreviation, addDays } from '@/lib/utils/date'
import { Ionicons } from '@expo/vector-icons'

export interface WeeklyCalendarProps {
  weekStartDate: Date
  planMeals: PlanMeal[]
  onDayPress?: (dayOfWeek: number) => void
  onMealPress?: (planMeal: PlanMeal) => void
  onAddMeal?: (dayOfWeek: number) => void
}

export function WeeklyCalendar({
  weekStartDate,
  planMeals,
  onDayPress,
  onMealPress,
  onAddMeal,
}: WeeklyCalendarProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStartDate, i)
    const dayMeals = planMeals.filter((pm) => pm.dayOfWeek === i)
    return { dayOfWeek: i, date, meals: dayMeals }
  })

  // Get unscheduled meals
  const unscheduledMeals = planMeals.filter((pm) => pm.dayOfWeek === null)

  const getMealsForDay = (dayOfWeek: number, mealSlot: 'breakfast' | 'lunch' | 'dinner') => {
    return planMeals.filter(
      (pm) => pm.dayOfWeek === dayOfWeek && pm.mealSlot === mealSlot
    )
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 8 }}
      className="bg-white"
    >
      {/* Unscheduled Meals Card */}
      {unscheduledMeals.length > 0 && (
        <View className="w-[160px] mr-3">
          <View style={{ backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 2, borderColor: '#3b82f6' }}>
            <View style={{ alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#bfdbfe' }}>
              <Ionicons name="time-outline" size={32} color="#3b82f6" style={{ marginBottom: 4 }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#1e40af', textTransform: 'uppercase', textAlign: 'center' }}>
                Unscheduled
              </Text>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#1e40af', marginBottom: 8 }}>
                {unscheduledMeals.length} Meal{unscheduledMeals.length === 1 ? '' : 's'}
              </Text>
              {unscheduledMeals.slice(0, 2).map((planMeal) => (
                <TouchableOpacity
                  key={planMeal.id}
                  onPress={() => onMealPress?.(planMeal)}
                  style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#bfdbfe' }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#1e40af' }} numberOfLines={1}>
                    {planMeal.meal?.title || 'Meal'}
                  </Text>
                </TouchableOpacity>
              ))}
              {unscheduledMeals.length > 2 && (
                <Text style={{ fontSize: 11, color: '#3b82f6', textAlign: 'center', marginTop: 4 }}>
                  +{unscheduledMeals.length - 2} more
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Scheduled Days */}
      {days.map((day) => (
        <View key={day.dayOfWeek} className="w-[160px] mr-3">
          <TouchableOpacity
            onPress={() => onDayPress?.(day.dayOfWeek)}
            activeOpacity={0.7}
          >
            <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
              <View style={{ alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#525252', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 }}>
                  {getDayAbbreviation(day.dayOfWeek)}
                </Text>
                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#171717' }}>
                  {day.date.getDate()}
                </Text>
                <Text style={{ fontSize: 11, color: '#737373', marginTop: 2 }}>
                  {day.date.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </View>

              {/* Only show dinner meals */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#404040', marginBottom: 8, textTransform: 'capitalize' }}>
                  Dinner
                </Text>
                {(() => {
                  const dinnerMeals = getMealsForDay(day.dayOfWeek, 'dinner')
                  return dinnerMeals.length > 0 ? (
                    dinnerMeals.map((planMeal) => (
                      <TouchableOpacity
                        key={planMeal.id}
                        onPress={() => onMealPress?.(planMeal)}
                        style={{ backgroundColor: '#fff7ed', borderRadius: 8, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#ffedd5' }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#9a3412' }} numberOfLines={1}>
                          {planMeal.meal?.title || 'Meal'}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity
                      onPress={() => onAddMeal?.(day.dayOfWeek)}
                      style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#d4d4d4', borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center', minHeight: 48, backgroundColor: '#fafafa' }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#737373" />
                      <Text style={{ fontSize: 11, color: '#737373', marginTop: 4 }}>Add meal</Text>
                    </TouchableOpacity>
                  )
                })()}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )
}
