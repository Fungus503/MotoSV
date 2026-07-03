import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { GlassCard, Button } from '@motosv/ui'
import { OSMMap } from '../../../../src/lib/OSMMap'

export function NavigationScreen() {
  const insets = useSafeAreaInsets()

  function handleComplete() {
    router.replace('/(tabs)/home')
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1">
        <OSMMap
          pickup={{ latitude: 13.6989, longitude: -89.1895, title: 'Origen' }}
          dropoff={{ latitude: 13.7012, longitude: -89.2245, title: 'Destino' }}
        />
      </View>

      <View className="absolute bottom-0 left-0 right-0 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <GlassCard className="mx-4 p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-primaryContainer rounded-full items-center justify-center mr-3">
              <Text className="text-onPrimaryContainer font-bold text-lg">C</Text>
            </View>
            <View className="flex-1">
              <Text className="text-on-surface font-semibold">Carlos Martínez</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-primary rounded-full mr-1" />
                <Text className="text-onSurfaceVariant text-sm">En destino</Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-start mb-4">
            <View className="w-3 h-3 bg-primary rounded-full mt-2 mr-3" />
            <View className="flex-1">
              <Text className="text-onSurfaceVariant text-xs">Origen</Text>
              <Text className="text-on-surface text-base">Colonia Escalón</Text>
              <Text className="text-onSurfaceVariant text-xs mt-2">A 2 min (500 m)</Text>
            </View>
          </View>

          <View className="flex-row gap-3 mt-2">
            <Button title="Llegué al origen" variant="secondary" onPress={() => {}} className="flex-1" />
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Button title="Chat" variant="secondary" onPress={() => router.push('/ride/chat?rideId=placeholder')} className="px-4" />
            <Button title="Pánico" variant="outline" onPress={() => router.push('/ride/panic?rideId=placeholder')} className="px-4 text-error" />
          </View>
          <View className="flex-row gap-3 mt-2">
            <Button title="Iniciar viaje" variant="primary" onPress={() => {}} disabled className="flex-1" />
            <Button title="Completar viaje" variant="primary" onPress={handleComplete} className="flex-1" />
          </View>
        </GlassCard>
      </View>
    </View>
  )
}
