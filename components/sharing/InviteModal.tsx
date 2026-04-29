import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useSharing } from '@/hooks/useSharing'
import { sharePlanSchema, type SharePlanInput } from '@/lib/validation/schemas'
import { ZodError } from 'zod'

export interface InviteModalProps {
  visible: boolean
  planId: string
  onClose: () => void
  onSuccess?: () => void
}

export function InviteModal({
  visible,
  planId,
  onClose,
  onSuccess,
}: InviteModalProps) {
  const { sharePlan, loading } = useSharing()
  const [inviteType, setInviteType] = useState<'email' | 'link'>('email')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'editor' | 'viewer'>('editor')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)

    try {
      if (inviteType === 'email') {
        const input = sharePlanSchema.parse({
          email,
          role,
        })

        const response = await sharePlan(planId, input)
        if (response.error) {
          setError(response.error)
        } else {
          onSuccess?.()
          onClose()
          setEmail('')
        }
      } else {
        onSuccess?.()
        onClose()
      }
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors.map(e => e.message).join(', '))
      } else {
        setError(err instanceof Error ? err.message : 'Validation failed')
      }
    }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Share Plan">
      <View className="gap-4">
        <Select
          label="Invite Method"
          value={inviteType}
          onValueChange={(value) => setInviteType(value as 'email' | 'link')}
          options={[
            { label: 'Email', value: 'email' },
            { label: 'Share Link', value: 'link' },
          ]}
        />

        {inviteType === 'email' && (
          <>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error || undefined}
            />

            <Select
              label="Permission Level"
              value={role}
              onValueChange={(value) => setRole(value as 'editor' | 'viewer')}
              options={[
                { label: 'Editor - Can edit plan', value: 'editor' },
                { label: 'Viewer - Can only view', value: 'viewer' },
              ]}
            />
          </>
        )}

        {inviteType === 'link' && (
          <Text className="text-sm text-neutral-600">
            A shareable link will be generated. Anyone with the link can access
            the plan.
          </Text>
        )}

        <Button
          title={inviteType === 'email' ? 'Send Invite' : 'Generate Link'}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          size="lg"
        />
      </View>
    </Modal>
  )
}
