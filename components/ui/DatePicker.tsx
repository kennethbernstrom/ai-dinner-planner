import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { formatWeekDate } from '@/lib/utils/date'
import { Ionicons } from '@expo/vector-icons'

export interface DatePickerProps {
  label: string
  value: Date
  onChange: (date: Date) => void
  error?: string
  className?: string
  minimumDate?: Date
  maximumDate?: Date
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  className = '',
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  // Format date for react-native-calendars (YYYY-MM-DD format)
  const formatDateForCalendar = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Parse date string from calendar to Date object
  const parseDateFromCalendar = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    // Create date at midnight in local timezone
    const date = new Date(year, month - 1, day, 0, 0, 0, 0)
    return date
  }

  const handleDateSelect = (day: { dateString: string }) => {
    const selectedDate = parseDateFromCalendar(day.dateString)
    onChange(selectedDate)
    setShowPicker(false)
  }

  const openPicker = () => {
    setShowPicker(true)
  }

  const markedDates = {
    [formatDateForCalendar(value)]: {
      selected: true,
      selectedColor: '#f97316',
      selectedTextColor: '#ffffff',
    },
  }

  return (
    <View className={className}>
      <Text className="text-sm font-medium text-neutral-700 mb-2">{label}</Text>
      <TouchableOpacity
        onPress={openPicker}
        className={`border rounded-lg p-4 flex-row items-center justify-between ${
          error ? 'border-red-500' : 'border-neutral-300'
        }`}
      >
        <View className="flex-row items-center flex-1">
          <View className="mr-2">
            <Ionicons name="calendar-outline" size={20} color="#737373" />
          </View>
          <Text className="text-base text-neutral-900">
            {formatWeekDate(value)}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#737373" />
      </TouchableOpacity>
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#171717' }}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#f97316' }}>Done</Text>
              </TouchableOpacity>
            </View>
            <Calendar              
              current={formatDateForCalendar(value)}
              showWeekNumbers={true}
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              minDate={minimumDate ? formatDateForCalendar(minimumDate) : undefined}
              maxDate={maximumDate ? formatDateForCalendar(maximumDate) : undefined}
              theme={{
                todayTextColor: '#f97316',
                arrowColor: '#f97316',
                selectedDayBackgroundColor: '#f97316',
                selectedDayTextColor: '#ffffff',
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '500',
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

