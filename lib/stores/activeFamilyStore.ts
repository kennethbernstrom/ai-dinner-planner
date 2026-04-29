import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface ActiveFamilyState {
  activeFamilyId: number | null
  setActiveFamilyId: (familyId: number | null) => void
  clearActiveFamilyId: () => void
}

/**
 * Store for managing the currently active/selected family
 * This persists the user's family selection across app sessions
 */
export const useActiveFamilyStore = create<ActiveFamilyState>()(
  persist(
    (set) => ({
      activeFamilyId: null,
      
      setActiveFamilyId: (familyId) => {
        set({ activeFamilyId: familyId })
      },
      
      clearActiveFamilyId: () => {
        set({ activeFamilyId: null })
      },
    }),
    {
      name: 'active-family-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

