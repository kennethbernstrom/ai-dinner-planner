import React from 'react'
import { ActivityIndicator, View } from 'react-native'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
  className?: string
}

export function LoadingSpinner({
  size = 'large',
  color = '#f97316',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <View className={`flex-1 justify-center items-center p-5 ${className}`}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}
