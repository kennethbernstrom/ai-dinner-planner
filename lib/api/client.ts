import { useMemo } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { ApiResponse } from '@/types/api'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
          message: data.message,
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, token)
  }

  async post<T>(
    endpoint: string,
    body?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    )
  }

  async put<T>(
    endpoint: string,
    body?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      token
    )
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token)
  }
}

export const apiClient = new ApiClient()

// Hook for using API client with auth token
export function useApiClient() {
  const { getToken } = useAuth()

  const getTokenAsync = async () => {
    try {
      return await getToken()
    } catch (error) {
      console.error('Failed to get auth token:', error)
      return null
    }
  }

  return useMemo(() => ({
    get: async <T>(endpoint: string) => {
      const token = await getTokenAsync()
      return apiClient.get<T>(endpoint, token || undefined)
    },
    post: async <T>(endpoint: string, body?: any) => {
      const token = await getTokenAsync()
      return apiClient.post<T>(endpoint, body, token || undefined)
    },
    put: async <T>(endpoint: string, body?: any) => {
      const token = await getTokenAsync()
      return apiClient.put<T>(endpoint, body, token || undefined)
    },
    delete: async <T>(endpoint: string) => {
      const token = await getTokenAsync()
      return apiClient.delete<T>(endpoint, token || undefined)
    },
  }), [getToken])
}

