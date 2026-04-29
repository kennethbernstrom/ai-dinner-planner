import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

export interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading

  const getVariantClasses = () => {
    const baseClasses = 'rounded-lg justify-center items-center min-h-[44px]'
    const sizeClasses = {
      sm: 'py-2.5 px-4',
      md: 'py-3 px-6',
      lg: 'py-4 px-8',
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${sizeClasses[size]} ${
          isDisabled ? 'bg-neutral-300' : 'bg-primary-500 shadow-md'
        }`
      case 'secondary':
        return `${baseClasses} ${sizeClasses[size]} ${
          isDisabled ? 'bg-neutral-200' : 'bg-secondary-500 shadow-sm'
        }`
      case 'ghost':
        return `${baseClasses} ${sizeClasses[size]} bg-transparent`
    }
  }

  const getTextClasses = () => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-base',
    }

    switch (variant) {
      case 'primary':
      case 'secondary':
        return `${sizeClasses[size]} text-white font-semibold`
      case 'ghost':
        return `${sizeClasses[size]} ${
          isDisabled ? 'text-neutral-400' : 'text-primary-600'
        } font-medium`
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`${getVariantClasses()} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? '#ea580c' : '#ffffff'}
          size="small"
        />
      ) : (
        <Text className={getTextClasses()}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
