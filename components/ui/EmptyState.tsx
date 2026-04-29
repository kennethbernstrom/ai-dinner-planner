import React from 'react'
import { View, Text } from 'react-native'
import { Button } from './Button'

export interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <View className={`flex-1 justify-center items-center p-6 ${className}`}>
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-2xl font-bold text-neutral-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-neutral-600 text-center mb-6 max-w-[300px]">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </View>
  )
}
