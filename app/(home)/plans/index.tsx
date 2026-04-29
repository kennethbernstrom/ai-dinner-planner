import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PlansList } from '@/components/plans/PlansList'
import { PlansHeader } from '@/components/plans/PlansHeader'
import { WeeklyPlan } from '@/types/plan'

export default function PlansPage() {
  const router = useRouter()

  const handlePlanPress = (plan: WeeklyPlan) => {
    router.push(`/(home)/plans/${plan.id}`)
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']} style={{ paddingBottom: 100 }}>
      <PlansList 
        onPlanPress={handlePlanPress}
        ListHeaderComponent={<PlansHeader />}
      />
    </SafeAreaView>
  )
}

