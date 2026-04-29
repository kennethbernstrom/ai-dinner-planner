import { ClerkProvider, useUser } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import './global.css'

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

function RootLayoutNav() {
  const { isLoaded, user } = useUser()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboardingGroup = segments[0] === '(onboarding)'
    const inHomeGroup = segments[0] === '(home)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/sign-in')
    } else if (user) {
      const onboardingComplete = user.unsafeMetadata?.onboardingCompleted === true
      
      if (!onboardingComplete && !inOnboardingGroup) {
        router.replace('/(onboarding)/preferences')
      } else if (onboardingComplete && !inHomeGroup && !inOnboardingGroup) {
        router.replace('/(home)')
      }
    }
  }, [isLoaded, user, segments])

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
        <RootLayoutNav />
      </ClerkProvider>
    </SafeAreaProvider>
  )
}
