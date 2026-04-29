import { useState, useEffect, useCallback } from 'react'
import * as Notifications from 'expo-notifications'
import { useNotificationsApi } from '@/lib/api/notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const api = useNotificationsApi()

  useEffect(() => {
    registerForPushNotifications()
  }, [])

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.warn('Push notifications not supported on web')
      return
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      setError('Failed to get push token for push notification!')
      return
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      })
      setExpoPushToken(token.data)

      // Register token with backend
      await api.register({
        expoPushToken: token.data,
        deviceId: Platform.OS,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register push token')
    }
  }, [api])

  const scheduleNotification = useCallback(
    async (title: string, body: string, trigger?: Notifications.NotificationTriggerInput) => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: trigger || { seconds: 2 } as Notifications.TimeIntervalTriggerInput,
      })
    },
    []
  )

  return {
    expoPushToken,
    loading,
    error,
    scheduleNotification,
    registerForPushNotifications,
  }
}

