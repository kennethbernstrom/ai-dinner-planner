import React from 'react'
import {
  Modal as RNModal,
  View,
  Text,
} from 'react-native'
import { IconButton } from './IconButton'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  showCloseButton?: boolean
  className?: string
  noPadding?: boolean
}

export function Modal({
  visible,
  onClose,
  children,
  title,
  showCloseButton = true,
  className = '',
  noPadding = false,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View 
          className={`bg-white rounded-2xl w-full max-w-[500px] shadow-xl ${className}`} 
          style={{ maxHeight: '85%', height: 600 }}
        >
          {(title || showCloseButton) && (
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-neutral-200">
              {title && (
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-900">
                    {title}
                  </Text>
                </View>
              )}
              {showCloseButton && (
                <IconButton
                  icon="close"
                  onPress={onClose}
                  variant="ghost"
                  size="sm"
                />
              )}
            </View>
          )}
          <View className={noPadding ? '' : 'p-4'} style={{ flex: 1 }}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  )
}
