import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { useFamiliesApi } from '@/lib/api/families'
import { useActiveFamilyStore } from '@/lib/stores'
import type { CurrentUserFamily } from '@/types/family'

/**
 * Hook to get and manage the current user's active family
 * Supports multiple families and uses the active family store to persist selection
 */
export function useCurrentFamily() {
  const { isSignedIn } = useAuth()
  const api = useFamiliesApi()
  
  // Get active family ID from persistent store
  const activeFamilyId = useActiveFamilyStore((state) => state.activeFamilyId)
  const setActiveFamilyId = useActiveFamilyStore((state) => state.setActiveFamilyId)
  
  const [allFamilies, setAllFamilies] = useState<CurrentUserFamily[]>([])
  const [currentFamily, setCurrentFamily] = useState<CurrentUserFamily | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all families the user belongs to
  const fetchAllFamilies = useCallback(async () => {
    if (!isSignedIn) {
      setAllFamilies([])
      setCurrentFamily(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const families = await api.getAllUserFamilies()
      setAllFamilies(families)
      
      // If there's an active family ID set, try to find it in the list
      if (activeFamilyId) {
        const activeFamily = families.find((f) => f.family.id === activeFamilyId)
        if (activeFamily) {
          setCurrentFamily(activeFamily)
        } else {
          // Active family ID is invalid, clear it and use first family
          setActiveFamilyId(families[0]?.family.id || null)
          setCurrentFamily(families[0] || null)
        }
      } else if (families.length > 0) {
        // No active family set, use the first one
        setActiveFamilyId(families[0].family.id)
        setCurrentFamily(families[0])
      } else {
        setCurrentFamily(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch families')
      setAllFamilies([])
      setCurrentFamily(null)
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, api, activeFamilyId, setActiveFamilyId])

  // Fetch a specific family by ID
  const fetchFamilyById = useCallback(
    async (familyId: number) => {
      try {
        const family = await api.getCurrentUserFamily(familyId)
        return family
      } catch (err: any) {
        console.error('Error fetching family:', err)
        return null
      }
    },
    [api]
  )

  useEffect(() => {
    fetchAllFamilies()
  }, [fetchAllFamilies])

  // Function to switch active family
  const switchFamily = useCallback(
    async (familyId: number) => {
      const family = allFamilies.find((f) => f.family.id === familyId)
      if (family) {
        setActiveFamilyId(familyId)
        setCurrentFamily(family)
      } else {
        // Family not in current list, fetch it
        const fetchedFamily = await fetchFamilyById(familyId)
        if (fetchedFamily) {
          setActiveFamilyId(familyId)
          setCurrentFamily(fetchedFamily)
          // Also refresh all families to update the list
          fetchAllFamilies()
        }
      }
    },
    [allFamilies, setActiveFamilyId, fetchFamilyById, fetchAllFamilies]
  )

  const refetch = useCallback(() => {
    return fetchAllFamilies()
  }, [fetchAllFamilies])

  // Helper to check if user has write permissions
  const hasWritePermission = useCallback(() => {
    if (!currentFamily) return false
    return currentFamily.membership.permissions === 'write' || currentFamily.membership.role === 'admin'
  }, [currentFamily])

  // Helper to check if user is admin
  const isAdmin = useCallback(() => {
    if (!currentFamily) return false
    return currentFamily.membership.role === 'admin'
  }, [currentFamily])

  return {
    currentFamily,
    allFamilies,
    familyId: currentFamily?.family?.id,
    membership: currentFamily?.membership,
    loading,
    error,
    refetch,
    switchFamily,
    hasWritePermission,
    isAdmin,
  }
}
