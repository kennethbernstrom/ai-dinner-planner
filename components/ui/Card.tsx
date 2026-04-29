import React from 'react'
import { View } from 'react-native'

export interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  className?: string
}

export function Card({
  children,
  variant = 'default',
  className = '',
}: CardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'bg-white rounded-xl p-4 shadow-lg'
      case 'outlined':
        return 'bg-white rounded-xl p-4 border-2 border-primary-200'
      default:
        return 'bg-white rounded-xl p-4 shadow-md'
    }
  }

  return (
    <View className={`${getVariantClasses()} ${className}`}>
      {children}
    </View>
  )
}
