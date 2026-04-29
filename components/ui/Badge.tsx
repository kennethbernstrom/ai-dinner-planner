import React from 'react'
import { View, Text } from 'react-native'

export interface BadgeProps {
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  label,
  variant = 'primary',
  size = 'md',
  className = '',
}: BadgeProps) {
  const getVariantClasses = () => {
    const baseClasses = 'rounded-full self-start'
    const sizeClasses = {
      sm: 'px-2 py-1',
      md: 'px-3 py-1.5',
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${sizeClasses[size]} bg-primary-100`
      case 'secondary':
        return `${baseClasses} ${sizeClasses[size]} bg-secondary-100`
      case 'success':
        return `${baseClasses} ${sizeClasses[size]} bg-success-100`
      case 'warning':
        return `${baseClasses} ${sizeClasses[size]} bg-warning-100`
      case 'error':
        return `${baseClasses} ${sizeClasses[size]} bg-error-100`
    }
  }

  const getTextClasses = () => {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
    }

    switch (variant) {
      case 'primary':
        return `${sizeClasses[size]} text-primary-700 font-medium`
      case 'secondary':
        return `${sizeClasses[size]} text-secondary-700 font-medium`
      case 'success':
        return `${sizeClasses[size]} text-success-600 font-medium`
      case 'warning':
        return `${sizeClasses[size]} text-warning-600 font-medium`
      case 'error':
        return `${sizeClasses[size]} text-error-600 font-medium`
    }
  }

  return (
    <View className={`${getVariantClasses()} ${className}`}>
      <Text className={getTextClasses()}>{label}</Text>
    </View>
  )
}
