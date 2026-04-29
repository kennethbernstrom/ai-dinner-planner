import { Tabs, router, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Platform, View } from 'react-native'

export default function HomeLayout() {
  const pathname = usePathname()
  
  // Handler for meals tab press - always navigate to meals list
  const handleMealsTabPress = (e: any) => {
    if (pathname.startsWith('/meals')) {
      e.preventDefault()
      router.push('/meals')
    }
  }
  
  // Handler for plans tab press - always navigate to plans list
  const handlePlansTabPress = (e: any) => {
    if (pathname.startsWith('/plans')) {
      e.preventDefault()
      router.push('/plans')
    }
  }
  
  const tabBarStyle = {
    position: 'absolute' as const,
    bottom: 0,
    alignSelf: 'center' as const,
    height: 70,
    width: '100%' as const,
    marginLeft: 0,
    backgroundColor: 'rgba(249, 115, 22, 0.85)',
    borderRadius: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: 30,
    paddingRight: 30,
    ...Platform.select({
      ios: { shadowOpacity: 0.3 },
      android: { elevation: 8 },
    }),
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 0,
          marginHorizontal: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-[50px] h-[50px] rounded-full mt-8 justify-center items-center ${focused ? 'bg-white/20 border-2 border-white/40' : 'bg-transparent'}`}>
              <Ionicons name="home-outline" size={26} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-[50px] h-[50px] rounded-full mt-8 justify-center items-center ${focused ? 'bg-white/20 border-2 border-white/40' : 'bg-transparent'}`}>
              <Ionicons name="restaurant-outline" size={26} color={color} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handleMealsTabPress,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-[50px] h-[50px] rounded-full mt-8 justify-center items-center ${focused ? 'bg-white/20 border-2 border-white/40' : 'bg-transparent'}`}>
              <Ionicons name="calendar-outline" size={26} color={color} />
            </View>
          ),
        }}
        listeners={{
          tabPress: handlePlansTabPress,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-[50px] h-[50px] rounded-full mt-8 justify-center items-center ${focused ? 'bg-white/20 border-2 border-white/40' : 'bg-transparent'}`}>
              <Ionicons name="person-outline" size={26} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          href: null,
        }}
      />
    </Tabs>
    
  )
}
