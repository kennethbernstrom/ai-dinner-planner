import React, { useEffect } from 'react'
import { View, Text, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
  onHide: () => void
  duration?: number
}

export function Toast({
  message,
  type = 'info',
  visible,
  onHide,
  duration = 3000,
}: ToastProps) {
  const slideAnim = new Animated.Value(-100)

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide()
        })
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration])

  if (!visible) return null

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success-50',
          border: 'border-l-success-500',
          icon: 'checkmark-circle' as const,
          iconColor: '#16a34a',
        }
      case 'error':
        return {
          bg: 'bg-error-50',
          border: 'border-l-error-500',
          icon: 'close-circle' as const,
          iconColor: '#dc2626',
        }
      case 'warning':
        return {
          bg: 'bg-warning-50',
          border: 'border-l-warning-500',
          icon: 'warning' as const,
          iconColor: '#d97706',
        }
      default:
        return {
          bg: 'bg-info-50',
          border: 'border-l-info-500',
          icon: 'information-circle' as const,
          iconColor: '#f97316',
        }
    }
  }

  const typeStyles = getTypeClasses()

  return (
    <Animated.View
      className={`absolute top-[50px] left-4 right-4 flex-row items-center p-4 rounded-lg border-l-4 shadow-lg z-[9999] ${typeStyles.bg} ${typeStyles.border}`}
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Ionicons name={typeStyles.icon} size={24} color={typeStyles.iconColor} />
      <Text className="flex-1 ml-3 text-base text-neutral-900 font-medium">
        {message}
      </Text>
    </Animated.View>
  )
}
