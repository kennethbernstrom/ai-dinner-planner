import React from 'react'
import { TextInput, View, Text } from 'react-native'

export interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  error?: string
  multiline?: boolean
  numberOfLines?: number
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  className?: string
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  className = '',
}: InputProps) {
  const inputClasses = `border rounded-md px-4 py-3 text-base text-neutral-900 bg-white min-h-[44px] ${
    error ? 'border-error-500' : 'border-neutral-300'
  } ${multiline ? 'text-top' : ''}`

  return (
    <View className={className} style={{ flexShrink: 1 }}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        className={inputClasses}
        style={multiline ? { minHeight: numberOfLines * 24 + 24 } : undefined}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
      {error && (
        <Text className="text-sm text-error-500 mt-1">{error}</Text>
      )}
    </View>
  )
}
