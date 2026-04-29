import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps {
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  className?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  label,
  error,
  className = '',
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className={`border rounded-md px-4 py-3 min-h-[44px] flex-row justify-between items-center bg-white ${
          error ? 'border-error-500' : 'border-neutral-300'
        }`}
      >
        <Text
          className={`text-base ${
            selectedOption ? 'text-neutral-900' : 'text-neutral-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#737373" />
      </TouchableOpacity>
      {error && (
        <Text className="text-sm text-error-500 mt-1">{error}</Text>
      )}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-4 max-h-[50%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-neutral-900">
                {label || 'Select an option'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#404040" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(item.value)
                    setModalVisible(false)
                  }}
                  className={`p-4 rounded-md ${
                    value === item.value
                      ? 'bg-primary-50'
                      : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-base ${
                      value === item.value
                        ? 'text-primary-700 font-semibold'
                        : 'text-neutral-900 font-normal'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}
