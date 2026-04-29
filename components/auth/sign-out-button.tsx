import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity, Alert, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SignOutButtonProps {
  variant?: 'button' | 'menuItem'
}

export const SignOutButton = ({ variant = 'button' }: SignOutButtonProps) => {
  const { signOut } = useClerk()
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
              Linking.openURL(Linking.createURL('/'))
            } catch (err) {
              console.error(JSON.stringify(err, null, 2))
              Alert.alert('Error', 'Failed to sign out. Please try again.')
            }
          },
        },
      ]
    )
  }

  if (variant === 'menuItem') {
    return (
      <TouchableOpacity
        onPress={handleSignOut}
        className="flex-row items-center px-6 py-4 bg-error-50"
      >
        <Ionicons name="log-out-outline" size={24} color="#dc2626" />
        <Text className="text-base text-error-600 ml-4 flex-1 font-medium">Sign Out</Text>
        <Ionicons name="chevron-forward" size={20} color="#dc2626" />
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="bg-error-500 rounded-lg py-3 px-6 items-center justify-center flex-row shadow-sm"
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={20} color="#ffffff" />
      <Text className="text-base text-white font-semibold ml-2">Sign Out</Text>
    </TouchableOpacity>
  )
}