import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useFamilies } from '@/hooks/useFamilies'
import { useActiveFamilyStore } from '@/lib/stores'
import type { CreateFamilyInput } from '@/lib/validation/schemas'

interface CreateFamilyFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateFamilyForm({ onSuccess, onCancel }: CreateFamilyFormProps) {
  const { createFamily, loading, error } = useFamilies()
  const setActiveFamilyId = useActiveFamilyStore((state) => state.setActiveFamilyId)
  const [familyName, setFamilyName] = useState('')

  const handleSubmit = async () => {
    if (familyName.trim().length < 2) {
      return
    }

    const data: CreateFamilyInput = {
      name: familyName.trim(),
    }

    const family = await createFamily(data)
    if (family) {
      // Set the newly created family as active
      setActiveFamilyId(family.id)
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  return (
    <View className="p-6">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-neutral-900 mb-2">
          Create a Family
        </Text>
        <Text className="text-base text-neutral-600 text-center">
          Give your family a name to get started
        </Text>
      </View>

      <Input
        label="Family Name"
        value={familyName}
        onChangeText={setFamilyName}
        placeholder="e.g., The Smith Family"
        error={error || undefined}
      />

      <View className="mt-6 gap-3">
        <Button
          title="Create Family"
          onPress={handleSubmit}
          disabled={familyName.trim().length < 2 || loading}
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

