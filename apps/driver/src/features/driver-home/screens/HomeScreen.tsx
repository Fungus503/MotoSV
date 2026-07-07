import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard } from '@motosv/ui'
import { useSession, useProfile, useDriverActiveRide } from '@motosv/api'
import { OSMMap } from '../../../../src/lib/OSMMap'

export function DriverHomeScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: profile } = useProfile(session?.user?.id)
  const { data: activeRide } = useDriverActiveRide(session?.user?.id)
  const [isOnline, setIsOnline] = useState(false)

  const isVerified = profile?.is_verified ?? false
  const isOnboardingComplete = profile?.is_onboarding_completed ?? false

  if (!isOnboardingComplete) {
    return (
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-on-surface text-2xl font-bold text-center mb-3">
            Completa tu registro
          </Text>
          <Text className="text-onSurfaceVariant text-base text-center mb-8">
            Sube tus documentos para comenzar a recibir solicitudes de viaje.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-xl font-bold">
          {profile?.full_name ?? 'Conductor'}
        </Text>
        <Text className="text-onSurfaceVariant text-sm">
          {isOnline ? 'En línea' : 'Desconectado'}
        </Text>
      </View>

      <View className="flex-1 mx-4 rounded-2xl mb-4 overflow-hidden">
        <OSMMap showUserLocation />
      </View>

      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={() => setIsOnline(!isOnline)}
          className={`w-full py-4 rounded-2xl items-center ${isOnline ? 'bg-surfaceContainerHigh' : 'bg-primary'}`}
        >
          <Text className={`text-lg font-bold ${isOnline ? 'text-onSurfaceVariant' : 'text-onPrimary'}`}>
            {isOnline ? 'Poner fuera de línea' : 'Ponerse en línea'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
