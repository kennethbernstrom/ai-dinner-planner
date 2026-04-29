import React from 'react'
import { View, Text } from 'react-native'

export interface ErrorMessageProps {
  message: string
  className?: string
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <View
      className={`bg-error-50 border-l-4 border-l-error-500 p-4 rounded-md my-2 ${className}`}
    >
      <Text className="text-sm text-error-700 font-medium">{message}</Text>
    </View>
  )
}
