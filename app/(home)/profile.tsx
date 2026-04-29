import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { useRouter } from 'expo-router'
import { colors } from '@/constants/theme'
import { Modal } from '@/components/ui/Modal'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'
import { useState } from 'react'

export default function ProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)

  const menuItems = [
    {
      icon: 'settings-outline',
      label: 'Preferences',
      onPress: () => router.push('/(onboarding)/preferences'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: 'information-circle-outline',
      label: 'About',
      onPress: () => {},
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between py-8">
          <Text className="text-3xl font-bold text-neutral-900">Profile</Text>
          <TouchableOpacity
            onPress={() => setShowEditModal(true)}
            className="bg-primary-500 rounded-full p-2"
          >
            <Ionicons name="pencil" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View className="bg-primary-50 rounded-2xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="w-16 h-16 rounded-full mr-4"
              />
            ) : (
              <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mr-4">
                <Ionicons name="person" size={32} color="#ffffff" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xl font-semibold text-neutral-900">
                {user?.firstName || 'User'} {user?.lastName || ''}
              </Text>
              <Text className="text-sm text-neutral-600 mt-1">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-neutral-50 rounded-2xl overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center px-6 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-neutral-200' : ''
              }`}
            >
              <Ionicons name={item.icon as any} size={24} color={colors.neutral[600]} />
              <Text className="text-base text-neutral-900 ml-4 flex-1">{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <View className="mb-8">
          <SignOutButton variant="button" />
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        noPadding
      >
        <ProfileEditForm
          onSuccess={() => setShowEditModal(false)}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </SafeAreaView>
  )
}

