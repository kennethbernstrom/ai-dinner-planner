import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import * as ExpoImagePicker from 'expo-image-picker'
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ProfileEditFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProfileEditForm({ onSuccess, onCancel }: ProfileEditFormProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Profile image state
  const [profileImageUri, setProfileImageUri] = useState<string | undefined>(user?.imageUrl)
  const [imageChanged, setImageChanged] = useState(false)

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const pickImage = async () => {
    try {
      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your photos to update your profile picture.'
        )
        return
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri)
        setImageChanged(true)
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
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri)
        setImageChanged(true)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Error', 'Failed to take photo')
    }
  }

  const showImageOptions = () => {
    const options = [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]

    Alert.alert('Profile Picture', 'Choose an option', options as any)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    // Password validation (only if user wants to change password)
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password'
      }
      if (!newPassword) {
        newErrors.newPassword = 'New password is required'
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters'
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !user) return

    setLoading(true)
    let successMessage = ''

    try {
      // Update basic profile information (name)
      if (firstName.trim() !== (user.firstName || '') || lastName.trim() !== (user.lastName || '')) {
        try {
          await user.update({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          })
          successMessage = 'Profile updated successfully'
        } catch (error: any) {
          console.error('Error updating profile:', error)
          throw new Error(error.errors?.[0]?.message || 'Failed to update profile')
        }
      }

      // Update profile image if changed
      if (imageChanged && profileImageUri && profileImageUri !== user.imageUrl) {
        try {
          // Read the image file as base64
          const base64 = await readAsStringAsync(profileImageUri, {
            encoding: EncodingType.Base64,
          })
          
          // Determine the image type from the URI
          const imageType = profileImageUri.toLowerCase().includes('.png') ? 'png' : 'jpeg'
          
          // Create a data URI that Clerk expects
          const dataUri = `data:image/${imageType};base64,${base64}`
          
          await user.setProfileImage({ file: dataUri as any })
          successMessage = successMessage || 'Profile updated successfully'
        } catch (error: any) {
          console.error('Error updating profile image:', error)
          // Don't fail the entire operation if image upload fails
          Alert.alert('Warning', 'Profile updated but failed to update image. Please try uploading the image again.')
        }
      }

      // Update password if provided
      if (newPassword && currentPassword) {
        try {
          await user.updatePassword({
            currentPassword,
            newPassword,
          })
          successMessage = 'Profile and password updated successfully'
          // Clear password fields on success
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        } catch (error: any) {
          console.error('Error updating password:', error)
          setLoading(false)
          Alert.alert(
            'Password Error',
            error.errors?.[0]?.message || error.message || 'Failed to update password. Please check your current password.'
          )
          return
        }
      }

      if (successMessage) {
        Alert.alert('Success', successMessage, [
          {
            text: 'OK',
            onPress: () => onSuccess?.(),
          },
        ])
      } else {
        Alert.alert('No Changes', 'No changes were made to your profile.')
        onCancel?.()
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      Alert.alert(
        'Error',
        error.message || error.errors?.[0]?.message || 'Failed to update profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
        {/* Profile Image */}
        <View className="items-center py-4">
          <TouchableOpacity
            onPress={showImageOptions}
            className="relative"
            disabled={loading}
          >
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                className="w-20 h-20 rounded-full bg-neutral-200"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center">
                <Ionicons name="person" size={40} color="#ffffff" />
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1.5 border-2 border-white">
              <Ionicons name="camera" size={14} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text className="text-xs text-neutral-600 mt-2">Tap to change photo</Text>
        </View>

        {/* Name Fields */}
        <Input
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          autoCapitalize="words"
          error={errors.firstName}
          className="mb-3"
        />

        <Input
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          autoCapitalize="words"
          error={errors.lastName}
          className="mb-3"
        />

        {/* Email Display (Read Only) */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-neutral-700 mb-2">Email</Text>
          <View className="border border-neutral-300 rounded-md px-4 py-3 bg-neutral-50">
            <Text className="text-sm text-neutral-600">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
          <Text className="text-xs text-neutral-500 mt-1">
            Contact support to change your email
          </Text>
        </View>

        {/* Password Section */}
        <View className="border-t border-neutral-200 pt-4 mb-4">
          <Text className="text-base font-semibold text-neutral-900 mb-2">
            Change Password
          </Text>
          <Text className="text-xs text-neutral-600 mb-3">
            Leave blank if you don't want to change your password
          </Text>

          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.currentPassword}
            className="mb-3"
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Min 8 characters"
            secureTextEntry
            autoCapitalize="none"
            error={errors.newPassword}
            className="mb-3"
          />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
            className="mb-3"
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mt-2">
          {onCancel && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="ghost"
              disabled={loading}
              className="flex-1"
            />
          )}
          <Button
            title="Save Changes"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            className="flex-1"
          />
        </View>
      </ScrollView>
  )
}
