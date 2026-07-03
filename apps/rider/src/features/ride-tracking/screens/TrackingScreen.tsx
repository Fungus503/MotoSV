import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button, GlassCard, Loading } from '@motosv/ui'
import { useActiveRide, useSession } from '@motosv/api'
import { OSMMap } from '../../../src/lib/OSMMap'

export function TrackingScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: ride, isLoading } = useActiveRide(session?.user?.id)

  if (isLoading) return <Loading fullScreen message="Cargando viaje..." />

  if (!ride) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <Text className="text-on-surface text-lg">No hay viaje activo</Text>
        <Button title="Volver al inicio" onPress={() => {}} className="mt-4" />
      </View>
    )
  }

  const statusLabels: Record<string, string> = {
    pending: 'Buscando conductor...',
    assigned: 'Conductor en camino',
    driver_arrived: 'Conductor llegó',
    in_progress: 'Viaje en curso',
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1">
        <OSMMap
          pickup={ride.pickup_location?.coordinates ? { latitude: ride.pickup_location.coordinates[1], longitude: ride.pickup_location.coordinates[0] } : undefined}
          dropoff={ride.dropoff_location?.coordinates ? { latitude: ride.dropoff_location.coordinates[1], longitude: ride.dropoff_location.coordinates[0] } : undefined}
        />
      </View>

      <View className="absolute bottom-0 left-0 right-0 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <GlassCard className="mx-4 p-4 mb-4">
          <Text className="text-primary text-lg font-bold mb-1">
            {statusLabels[ride.status] ?? ride.status}
          </Text>
          {ride.driver && (
            <View className="flex-row items-center mt-2">
              <View className="w-10 h-10 bg-primaryContainer rounded-full items-center justify-center mr-3">
                <Text className="text-onPrimaryContainer font-bold text-lg">
                  {ride.driver.full_name?.charAt(0) ?? '?'}
                </Text>
              </View>
              <View>
                <Text className="text-on-surface font-semibold">{ride.driver.full_name}</Text>
                <Text className="text-onSurfaceVariant text-sm">{ride.driver.phone}</Text>
              </View>
            </View>
          )}
          <View className="mt-4 flex-row gap-3">
            <Button title="Chat" variant="secondary" className="flex-1" onPress={() => router.push('/ride/chat?rideId=' + ride.id)} />
            <Button title="Pánico" variant="outline" className="flex-1 text-error" onPress={() => router.push('/ride/panic?rideId=' + ride.id)} />
          </View>
          <View className="mt-2">
            <Button title="Compartir viaje" variant="ghost" onPress={() => router.push('/ride/share?rideId=' + ride.id)} />
          </View>
          <View className="mt-2">
            <Button title="Cancelar" variant="outline" onPress={() => {}} />
          </View>
        </GlassCard>
      </View>
    </View>
  )
}
