import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Share, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { useFamilies } from '@/hooks/useFamilies'
import type { FamilyMember } from '@/types/family'

export function FamilySettings() {
  const { currentFamily, loading: familyLoading, refetch, isAdmin } = useCurrentFamily()
  const { getMembers, updateMember, removeMember, regenerateInviteCode, loading: actionLoading } = useFamilies()
  const [members, setMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    if (currentFamily?.family.id) {
      loadMembers()
    }
  }, [currentFamily?.family.id])

  const loadMembers = async () => {
    if (!currentFamily?.family.id) return
    const fetchedMembers = await getMembers(currentFamily.family.id)
    if (fetchedMembers) {
      setMembers(fetchedMembers)
    }
  }

  const handleShareInviteCode = async () => {
    if (!currentFamily?.family.inviteCode) return
    
    try {
      await Share.share({
        message: `Join my family on Dinner Planner! Use invite code: ${currentFamily.family.inviteCode}`,
      })
    } catch (error) {
      console.error('Error sharing invite code:', error)
    }
  }

  const handleRegenerateCode = async () => {
    if (!currentFamily?.family.id) return

    Alert.alert(
      'Regenerate Invite Code',
      'This will invalidate the current invite code. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            await regenerateInviteCode(currentFamily.family.id)
            await refetch()
          },
        },
      ]
    )
  }

  const handleUpdatePermissions = async (memberId: number, permissions: 'read' | 'write') => {
    if (!currentFamily?.family.id) return
    
    const updated = await updateMember(currentFamily.family.id, memberId, { permissions })
    if (updated) {
      await loadMembers()
    }
  }

  const handleRemoveMember = async (memberId: number, memberUserId: string) => {
    if (!currentFamily?.family.id) return

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the family?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeMember(currentFamily.family.id, memberId)
            if (success) {
              await loadMembers()
            }
          },
        },
      ]
    )
  }

  if (familyLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <LoadingSpinner size="large" />
      </View>
    )
  }

  if (!currentFamily) {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-lg text-neutral-600">No family found</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {/* Family Info */}
      <View className="bg-primary-50 rounded-xl p-6 mb-6">
        <Text className="text-2xl font-bold text-neutral-900 mb-2">
          {currentFamily.family.name}
        </Text>
        <View className="flex-row items-center gap-2">
          <Ionicons name="people" size={20} color="#666" />
          <Text className="text-base text-neutral-600">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </Text>
        </View>
      </View>

      {/* Invite Code Section */}
      {isAdmin() && (
        <View className="bg-white border-2 border-neutral-200 rounded-xl p-6 mb-6">
          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            Invite Code
          </Text>
          <View className="bg-neutral-100 rounded-lg p-4 mb-4">
            <Text className="text-2xl font-mono text-center text-primary-600 tracking-widest">
              {currentFamily.family.inviteCode}
            </Text>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Share Code"
                onPress={handleShareInviteCode}
                variant="primary"
                size="md"
                icon={<Ionicons name="share-outline" size={20} color="white" />}
              />
            </View>
            <View className="flex-1">
              <Button
                title="Regenerate"
                onPress={handleRegenerateCode}
                variant="ghost"
                size="md"
                disabled={actionLoading}
              />
            </View>
          </View>
        </View>
      )}

      {/* Members List */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-neutral-900 mb-4">
          Family Members
        </Text>
        {members.map((member) => (
          <View
            key={member.id}
            className="bg-neutral-50 rounded-xl p-4 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons
                  name={member.role === 'admin' ? 'shield-checkmark' : 'person'}
                  size={20}
                  color={member.role === 'admin' ? '#ea580c' : '#666'}
                />
                <Text className="text-base font-semibold text-neutral-900">
                  {member.clerkUserId === currentFamily.membership.clerkUserId
                    ? 'You'
                    : `Member ${member.id}`}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    member.role === 'admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {member.role}
                </Text>
                <Text
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    member.permissions === 'write'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {member.permissions}
                </Text>
              </View>
            </View>

            {/* Admin Controls */}
            {isAdmin() && member.clerkUserId !== currentFamily.membership.clerkUserId && (
              <View className="flex-row gap-2">
                {member.role !== 'admin' && (
                  <TouchableOpacity
                    onPress={() =>
                      handleUpdatePermissions(
                        member.id,
                        member.permissions === 'write' ? 'read' : 'write'
                      )
                    }
                    className="bg-white border border-neutral-300 rounded-lg px-3 py-2"
                    disabled={actionLoading}
                  >
                    <Ionicons
                      name={member.permissions === 'write' ? 'eye-outline' : 'create-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.id, member.clerkUserId)}
                  className="bg-red-50 border border-red-300 rounded-lg px-3 py-2"
                  disabled={actionLoading}
                >
                  <Ionicons name="close" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

