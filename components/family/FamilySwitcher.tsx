import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useCurrentFamily } from '@/hooks/useCurrentFamily'
import { CreateFamilyForm } from './CreateFamilyForm'
import { JoinFamilyForm } from './JoinFamilyForm'

export interface FamilySwitcherProps {
  className?: string
  showLabel?: boolean
}

export function FamilySwitcher({ className = '', showLabel = false }: FamilySwitcherProps) {
  const { currentFamily, allFamilies, loading, switchFamily, refetch } = useCurrentFamily()
  const [modalVisible, setModalVisible] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)

  const handleFamilySelect = async (familyId: number) => {
    await switchFamily(familyId)
    setModalVisible(false)
  }

  const handleCreateSuccess = async () => {
    setShowCreateForm(false)
    setModalVisible(false)
    await refetch()
  }

  const handleJoinSuccess = async () => {
    setShowJoinForm(false)
    setModalVisible(false)
    await refetch()
  }

  if (loading && !currentFamily) {
    return (
      <View className={`flex-row items-center ${className}`}>
        <ActivityIndicator size="small" color="#059669" />
      </View>
    )
  }

  if (!currentFamily) {
    return null
  }

  return (
    <>
      <View className={className}>
        {showLabel && (
          <Text className="text-xs font-medium text-neutral-500 mb-1">
            Family
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-neutral-100 rounded-lg px-3 py-2 min-h-[40px]"
          activeOpacity={0.7}
        >
          <Ionicons name="people" size={18} color="#059669" />
          <Text className="text-base font-semibold text-neutral-900 ml-2 flex-1" numberOfLines={1}>
            {currentFamily.family.name}
          </Text>
          {allFamilies.length > 1 && (
            <Ionicons name="chevron-down" size={18} color="#737373" />
          )}
        </TouchableOpacity>
        {allFamilies.length > 1 && (
          <Text className="text-xs text-neutral-500 mt-1">
            {allFamilies.length} families
          </Text>
        )}
      </View>

      <Modal
        visible={modalVisible && !showCreateForm && !showJoinForm}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-4" style={{ maxHeight: '80%' }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-neutral-900">
                Switch Family
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#404040" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={allFamilies}
              keyExtractor={(item) => item.family.id.toString()}
              renderItem={({ item }) => {
                const isActive = currentFamily?.family.id === item.family.id
                return (
                  <TouchableOpacity
                    onPress={() => handleFamilySelect(item.family.id)}
                    className={`p-4 rounded-lg mb-2 flex-row items-center ${
                      isActive ? 'bg-primary-50 border-2 border-primary-500' : 'bg-neutral-50'
                    }`}
                    disabled={isActive}
                  >
                    <Ionicons 
                      name={isActive ? "checkmark-circle" : "people"} 
                      size={24} 
                      color={isActive ? "#059669" : "#737373"} 
                    />
                    <View className="ml-3 flex-1">
                      <Text
                        className={`text-base font-semibold ${
                          isActive ? 'text-primary-700' : 'text-neutral-900'
                        }`}
                      >
                        {item.family.name}
                      </Text>
                      <Text className="text-sm text-neutral-600 mt-1">
                        {item.membership.role === 'admin' ? 'Admin' : 'Member'} · {' '}
                        {item.membership.permissions === 'write' ? 'Can edit' : 'View only'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-neutral-500">No families found</Text>
                </View>
              }
            />

            <View className="border-t border-neutral-200 pt-4 mt-4">
              <TouchableOpacity
                onPress={() => setShowCreateForm(true)}
                className="flex-row items-center justify-center bg-primary-600 rounded-lg py-3 mb-2"
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold text-white ml-2">
                  Create New Family
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowJoinForm(true)}
                className="flex-row items-center justify-center bg-neutral-100 rounded-lg py-3"
              >
                <Ionicons name="enter-outline" size={20} color="#059669" />
                <Text className="text-base font-semibold text-primary-700 ml-2">
                  Join with Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Family Modal */}
      <Modal
        visible={showCreateForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateForm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-[500px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-neutral-900">
                Create New Family
              </Text>
              <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                <Ionicons name="close" size={24} color="#404040" />
              </TouchableOpacity>
            </View>
            <CreateFamilyForm onSuccess={handleCreateSuccess} />
          </View>
        </View>
      </Modal>

      {/* Join Family Modal */}
      <Modal
        visible={showJoinForm}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJoinForm(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-[500px]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-neutral-900">
                Join Family
              </Text>
              <TouchableOpacity onPress={() => setShowJoinForm(false)}>
                <Ionicons name="close" size={24} color="#404040" />
              </TouchableOpacity>
            </View>
            <JoinFamilyForm onSuccess={handleJoinSuccess} />
          </View>
        </View>
      </Modal>
    </>
  )
}

