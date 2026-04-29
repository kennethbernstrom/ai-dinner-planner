import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface CheckboxProps {
  checked: boolean
  onPress: () => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  checked,
  onPress,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`flex-row items-center ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <View
        className={`w-6 h-6 rounded-sm border-2 justify-center items-center ${
          checked
            ? 'border-primary-500 bg-primary-500'
            : 'border-neutral-300 bg-transparent'
        } ${label ? 'mr-2' : ''}`}
      >
        {checked && (
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        )}
      </View>
      {label && (
        <Text className="text-base text-neutral-900">{label}</Text>
      )}
    </TouchableOpacity>
  )
}
