import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function IconButton({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
}: IconButtonProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24
  const buttonSize = size === 'sm' ? 36 : size === 'lg' ? 56 : 44

  const getVariantClasses = () => {
    const baseClasses = 'rounded-full justify-center items-center'

    switch (variant) {
      case 'primary':
        return `${baseClasses} ${
          disabled ? 'bg-neutral-300' : 'bg-primary-500 shadow-sm'
        }`
      case 'secondary':
        return `${baseClasses} ${
          disabled ? 'bg-neutral-200' : 'bg-secondary-500 shadow-sm'
        }`
      case 'ghost':
        return `${baseClasses} bg-transparent`
    }
  }

  const getIconColor = () => {
    if (disabled) return '#a3a3a3'
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#ffffff'
      case 'ghost':
        return '#404040'
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`${getVariantClasses()} ${className}`}
      style={{ width: buttonSize, height: buttonSize }}
    >
      <Ionicons name={icon} size={iconSize} color={getIconColor()} />
    </TouchableOpacity>
  )
}
