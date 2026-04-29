import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useFamilies } from '@/hooks/useFamilies'
import { useActiveFamilyStore } from '@/lib/stores'
import type { JoinFamilyInput } from '@/lib/validation/schemas'

interface JoinFamilyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function JoinFamilyForm({ onSuccess, onCancel }: JoinFamilyFormProps) {
  const { joinFamily, loading, error } = useFamilies()
  const setActiveFamilyId = useActiveFamilyStore((state) => state.setActiveFamilyId)
  const [inviteCode, setInviteCode] = useState('')

  const handleSubmit = async () => {
    if (inviteCode.length !== 8) {
      return
    }

    const data: JoinFamilyInput = {
      inviteCode: inviteCode.toUpperCase(),
    }

    const member = await joinFamily(data)
    if (member) {
      // Set the newly joined family as active
      setActiveFamilyId(member.familyId)
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  return (
    <View className="p-6">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-neutral-900 mb-2">
          Join a Family
        </Text>
        <Text className="text-base text-neutral-600 text-center">
          Enter the invite code shared by your family
        </Text>
      </View>

      <Input
        label="Invite Code"
        value={inviteCode}
        onChangeText={(text) => setInviteCode(text.toUpperCase())}
        placeholder="ABCD1234"
        maxLength={8}
        autoCapitalize="characters"
        error={error || undefined}
      />

      <View className="mt-6 gap-3">
        <Button
          title="Join Family"
          onPress={handleSubmit}
          disabled={inviteCode.length !== 8 || loading}
          loading={loading}
          variant="primary"
          size="lg"
        />
        {onCancel && (
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="ghost"
            size="md"
            disabled={loading}
          />
        )}
      </View>
    </View>
  )
}

