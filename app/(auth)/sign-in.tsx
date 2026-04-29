import { useSignIn, useOAuth } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { EvilIcons, FontAwesome, Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'

// Complete the OAuth flow in the browser
WebBrowser.maybeCompleteAuthSession()

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const onSignInPress = async () => {
    if (!isLoaded) return

    setError(null)
    setLoading(true)

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(home)')
      } else {
        setError('Please complete all required steps to sign in.')
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || 'Failed to sign in. Please check your credentials.'
      setError(errorMessage)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const onGoogleSignInPress = async () => {
    if (!isLoaded) return
    
    try {
      setGoogleLoading(true)
      setError(null)
      
      const { createdSessionId } = await startOAuthFlow()
      
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        router.replace('/(home)')
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || 'Failed to sign in with Google.'
      setError(errorMessage)
      console.error('Google OAuth error:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
        <View className="flex-1 max-w-md w-full mx-auto px-4">
        {/* Header with Back Button */}
        <View className="flex-row items-center mb-8">
          <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity
            className="w-10 h-10 bg-purple-100 rounded-lg items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#9333ea" />
          </TouchableOpacity>
          </Link>
          <Text className="text-lg font-semibold text-neutral-700">
            Sign up
          </Text>
        </View>

        {/* Main Title */}
        <Text className="text-3xl font-extrabold text-neutral-800 mb-4 mx-auto">
          Log in with Email
        </Text>

        {/* Separator with "or" */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-neutral-800" />
          <Text className="mx-4 text-sm font-extrabold text-neutral-800">or</Text>
          <View className="flex-1 h-px bg-neutral-800" />
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          onPress={onGoogleSignInPress}
          disabled={googleLoading}
          className="rounded-2xl py-4 px-6 bg-purple-200 border border-white mb-8 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          {/* Google Logo */}
          <View className="w-6 h-6 mr-3 relative items-center justify-center">
            <FontAwesome name="google" size={20} color="#4285F4" />
          </View>
          <Text className="text-neutral-700 font-semibold text-base">
            {googleLoading ? 'Signing in...' : 'Log in with Google'}
          </Text>
        </TouchableOpacity>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-neutral-700 mb-2">
            Your email:
          </Text>
          <TextInput
            value={emailAddress}
            onChangeText={setEmailAddress}
            placeholder="example@gmail.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-purple-200 rounded-xl px-4 py-3 text-base text-neutral-900 min-h-[48px] border border-purple-100"
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-neutral-700 mb-2">
            Password:
          </Text>
          <View className="relative">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="bg-purple-200 rounded-xl px-4 py-3 pr-12 text-base text-neutral-900 min-h-[48px] border border-purple-100"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2"
              style={{ transform: [{ translateY: -12 }] }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#9333ea" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Keep me logged in Checkbox */}
        <TouchableOpacity
          onPress={() => setKeepLoggedIn(!keepLoggedIn)}
          className="flex-row items-center mb-16"
          activeOpacity={0.7}
        >
          <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
            keepLoggedIn ? 'bg-purple-600 border-purple-600' : 'border-neutral-300'
          }`}>
            {keepLoggedIn && (
              <Ionicons name="checkmark" size={14} color="#ffffff" />
            )}
          </View>
          <Text className="text-sm text-neutral-700">
            Keep me logged in
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

        {/* Login Button */}
        <TouchableOpacity
          onPress={onSignInPress}
          disabled={!emailAddress || !password || loading}
          className={`rounded-2xl py-3 px-6 mb-4 ${
            !emailAddress || !password || loading
              ? 'bg-neutral-300'
              : 'bg-purple-600'
          }`}
          activeOpacity={0.7}
        >
          <Text className="text-center text-white font-bold text-2xl">
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Forgot Password Link */}
        <TouchableOpacity className="mb-8" activeOpacity={0.7}>
          <Text className="text-center text-sm text-neutral-700">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-sm text-neutral-700 mr-1">
            Don't have an account?
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-purple-600 font-semibold underline">
                Sign up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}
