import React, { useState } from 'react'
import { View, Image, TouchableOpacity, Text, Alert } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

export interface ImagePickerProps {
  imageUri?: string | null
  onImageSelected: (uri: string) => void
  onImageRemoved?: () => void
  className?: string
}

export function ImagePicker({
  imageUri,
  onImageSelected,
  onImageRemoved,
  className = '',
}: ImagePickerProps) {
  const [loading, setLoading] = useState(false)

  const pickImage = async () => {
    try {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your photos to add meal images.'
        )
        return
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Error', 'Failed to pick image')
    }
  }

  const takePhoto = async () => {
    try {
      const { status } = await ExpoImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your camera to take photos.'
        )
        return
      }

      const result = await ExpoImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Error', 'Failed to take photo')
    }
  }

  const showImageOptions = () => {
    Alert.alert(
      'Add Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
  }

  if (imageUri) {
    return (
      <View className={className}>
        <View className="relative rounded-lg overflow-hidden bg-neutral-100">
          <Image
            source={{ uri: imageUri }}
            className="w-full h-[200px]"
            style={{ resizeMode: 'cover' }}
          />
          <TouchableOpacity
            onPress={showImageOptions}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
          >
            <Ionicons name="camera" size={20} color="#ffffff" />
          </TouchableOpacity>
          {onImageRemoved && (
            <TouchableOpacity
              onPress={onImageRemoved}
              className="absolute top-2 left-2 bg-error-500/80 rounded-full p-2"
            >
              <Ionicons name="trash" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <TouchableOpacity
      onPress={showImageOptions}
      className={`border-2 border-dashed border-primary-300 rounded-lg p-6 items-center justify-center bg-primary-50 min-h-[200px] ${className}`}
    >
      <Ionicons name="camera-outline" size={48} color="#ea580c" />
      <Text className="mt-2 text-base text-primary-700 font-medium">
        Add Image
      </Text>
    </TouchableOpacity>
  )
}
