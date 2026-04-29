import { useState, useCallback } from 'react'
import { supabase, createAuthenticatedSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@clerk/clerk-expo'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system/legacy'

export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userId, getToken } = useAuth()

  const uploadImage = useCallback(
    async (imageUri: string): Promise<string | null> => {
      if (!userId) {
        setError('Not authenticated')
        return null
      }

      setUploading(true)
      setError(null)

      try {
        // Try to get Clerk session token for Supabase authentication (if JWT template is configured)
        let supabaseClient = supabase
        try {
          const token = await getToken({ template: 'supabase' })
          if (token) {
            // Create authenticated Supabase client with Clerk JWT
            supabaseClient = createAuthenticatedSupabaseClient(token)
            console.log('Using authenticated Supabase client with Clerk JWT')
          }
        } catch (jwtError) {
          // JWT template not configured - fall back to default client with simple RLS policies
          console.log('No JWT template configured, using default Supabase client')
        }
        
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: 'base64',
        })

        // Create unique file name
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${userId}/${Date.now()}.${fileExt}`

        // Convert base64 to ArrayBuffer
        const arrayBuffer = decode(base64)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('meal-images')
          .upload(fileName, arrayBuffer, {
            contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          setError(uploadError.message)
          setUploading(false)
          return null
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('meal-images')
          .getPublicUrl(uploadData.path)

        setUploading(false)
        return publicUrl
      } catch (err) {
        console.error('Image upload error:', err)
        setError(err instanceof Error ? err.message : 'Upload failed')
        setUploading(false)
        return null
      }
    },
    [userId, getToken]
  )

  const deleteImage = useCallback(
    async (imageUrl: string): Promise<boolean> => {
      if (!userId) {
        return false
      }

      try {
        // Try to get authenticated client
        let supabaseClient = supabase
        try {
          const token = await getToken({ template: 'supabase' })
          if (token) {
            supabaseClient = createAuthenticatedSupabaseClient(token)
          }
        } catch {
          // Fall back to default client
        }

        // Extract path from URL
        const urlParts = imageUrl.split('/meal-images/')
        if (urlParts.length < 2) {
          return false
        }
        const filePath = urlParts[1]

        const { error: deleteError } = await supabaseClient.storage
          .from('meal-images')
          .remove([filePath])

        if (deleteError) {
          console.error('Delete error:', deleteError)
          return false
        }

        return true
      } catch (err) {
        console.error('Image delete error:', err)
        return false
      }
    },
    [userId, getToken]
  )

  return {
    uploading,
    error,
    uploadImage,
    deleteImage,
  }
}

