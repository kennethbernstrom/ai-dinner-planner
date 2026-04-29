import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { InviteModal } from './InviteModal'

export interface ShareButtonProps {
  planId: string
  onShareSuccess?: () => void
}

export function ShareButton({ planId, onShareSuccess }: ShareButtonProps) {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="p-2"
      >
        <InviteModal
          visible={modalVisible}
          planId={planId}
          onClose={() => setModalVisible(false)}
          onSuccess={onShareSuccess}
        />
      </TouchableOpacity>
    </>
  )
}
