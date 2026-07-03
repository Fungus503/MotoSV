import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button, GlassCard } from '@motosv/ui'
import { useRequestRide } from '@motosv/api'
import { OSMMap } from '../../../src/lib/OSMMap'

export function RideRequestScreen() {
  const insets = useSafeAreaInsets()
  const requestRide = useRequestRide()
  const estimatedFare = '$3.50'
  const estimatedTime = '8 min'

  async function handleRequestRide() {
    try {
      await requestRide.mutateAsync({
        pickup_lat: 13.6989,
        pickup_lng: -89.1895,
        dropoff_lat: 13.7012,
        dropoff_lng: -89.2245,
        pickup_address: 'Ubicación actual',
        dropoff_address: 'Colonia Escalón',
      })
      router.push('/ride/tracking')
    } catch {
      // error handled by query
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1">
        <OSMMap
          pickup={{ latitude: 13.6989, longitude: -89.1895 }}
          dropoff={{ latitude: 13.7012, longitude: -89.2245, title: 'Colonia Escalón' }}
        />
      </View>

      <View className="absolute bottom-0 left-0 right-0 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <GlassCard className="mx-4 p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-onSurfaceVariant text-sm">Tarifa estimada</Text>
              <Text className="text-on-surface text-2xl font-bold">{estimatedFare}</Text>
            </View>
            <View className="items-end">
              <Text className="text-onSurfaceVariant text-sm">Duración</Text>
              <Text className="text-on-surface text-lg font-semibold">{estimatedTime}</Text>
            </View>
          </View>
          <Button
            title="Solicitar mototaxi"
            onPress={handleRequestRide}
            loading={requestRide.isPending}
          />
        </GlassCard>
      </View>
    </View>
  )
}
