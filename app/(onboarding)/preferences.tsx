import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function OnboardingPage() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <OnboardingForm />
    </SafeAreaView>
  )
}
