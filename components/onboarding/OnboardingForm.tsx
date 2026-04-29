import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useClerk } from '@clerk/clerk-expo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboarding } from '@/hooks/useOnboarding'
import { Ionicons } from '@expo/vector-icons'

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten-Free' },
  { value: 'dairy-free', label: 'Dairy-Free' },
  { value: 'nut-free', label: 'Nut-Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'pescatarian', label: 'Pescatarian' },
]

export function OnboardingForm() {
  const router = useRouter()
  const { signOut } = useClerk()
  const { saveOnboardingData, loading } = useOnboarding()
  const [step, setStep] = useState(1)
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [householdSize, setHouseholdSize] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  const togglePreference = (value: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    )
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    const size = parseInt(householdSize, 10)
    if (isNaN(size) || size < 1 || familyName.trim().length < 2) {
      return
    }

    try {
      const success = await saveOnboardingData({
        dietaryPreferences,
        householdSize: size,
        familyName: familyName.trim(),
      })

      if (success) {
        router.replace('/(home)')
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return true
    }
    if (step === 2) {
      const size = parseInt(householdSize, 10)
      return !isNaN(size) && size >= 1
    }
    return familyName.trim().length >= 2
  }

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut()
      router.replace('/(auth)/sign-in')
    } catch (err) {
      console.error('Sign out error:', err)
      setSigningOut(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
      {/* Progress Indicator */}
      <View className="flex-row justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            className={`w-10 h-2 rounded ${
              s <= step ? 'bg-primary-500' : 'bg-neutral-200'
            } ${s < 3 ? 'mr-1' : ''}`}
          />
        ))}
      </View>

      {step === 1 && (
        <View>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-primary-100 justify-center items-center mb-4">
              <Ionicons name="restaurant" size={40} color="#ea580c" />
            </View>
            <Text className="text-3xl font-bold text-neutral-900 text-center mb-2">
              Welcome to Dinner Planner!
            </Text>
            <Text className="text-base text-neutral-600 text-center">
              Let's set up your preferences
            </Text>
          </View>

          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            Dietary Preferences (Optional)
          </Text>
          <Text className="text-sm text-neutral-600 mb-4">
            Select any dietary restrictions or preferences you have
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {DIETARY_OPTIONS.map((option) => {
              const isSelected = dietaryPreferences.includes(option.value)
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => togglePreference(option.value)}
                  className={`px-4 py-2 rounded-full border-2 ${
                    isSelected
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-neutral-100 border-neutral-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-neutral-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      {step === 2 && (
        <View>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-secondary-100 justify-center items-center mb-4">
              <Ionicons name="people" size={40} color="#16a34a" />
            </View>
            <Text className="text-3xl font-bold text-neutral-900 text-center mb-2">
              Household Size
            </Text>
            <Text className="text-base text-neutral-600 text-center">
              How many people are you planning meals for?
            </Text>
          </View>

          <Input
            label="Number of people"
            value={householdSize}
            onChangeText={setHouseholdSize}
            placeholder="e.g., 4"
            keyboardType="numeric"
            error={
              householdSize && (!/^\d+$/.test(householdSize) || parseInt(householdSize, 10) < 1)
                ? 'Please enter a valid number (1 or more)'
                : undefined
            }
          />
        </View>
      )}

      {step === 3 && (
        <View>
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-purple-100 justify-center items-center mb-4">
              <Ionicons name="home" size={40} color="#9333ea" />
            </View>
            <Text className="text-3xl font-bold text-neutral-900 text-center mb-2">
              Create Your Family
            </Text>
            <Text className="text-base text-neutral-600 text-center">
              Give your family a name so others can join
            </Text>
          </View>

          <Input
            label="Family Name"
            value={familyName}
            onChangeText={setFamilyName}
            placeholder="e.g., The Smith Family"
            error={
              familyName && familyName.trim().length < 2
                ? 'Family name must be at least 2 characters'
                : undefined
            }
          />
          <Text className="text-sm text-neutral-500 mt-2">
            You'll be the admin and can invite others to join later.
          </Text>
        </View>
      )}

      <View className="mt-8 gap-3">
        <Button
          title={step === 3 ? 'Complete Setup' : 'Next'}
          onPress={handleNext}
          disabled={!canProceed() || loading}
          loading={loading}
          variant="primary"
          size="lg"
        />
        {step > 1 && (
          <Button
            title="Back"
            onPress={() => setStep(step - 1)}
            variant="ghost"
            size="md"
          />
        )}
      </View>

      {/* Sign Out Button */}
      <View className="mt-8 pt-6 border-t border-neutral-200">
        <TouchableOpacity
          onPress={handleSignOut}
          disabled={signingOut}
          className="rounded-xl py-3 px-6 bg-white border-2 border-purple-600 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#9333ea" style={{ marginRight: 8 }} />
          <Text className="text-purple-600 font-semibold text-base">
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
