import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { GlassCard, Button } from '@motosv/ui'
import { OSMMap } from '../../../../src/lib/OSMMap'

function handleAccept() {
  router.push('/ride/navigation')
}

function handleDecline() {
  router.back()
}

export function IncomingRideScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1">
        <OSMMap
          pickup={{ latitude: 13.6989, longitude: -89.1895, title: 'Colonia Escalón' }}
          dropoff={{ latitude: 13.7012, longitude: -89.2245, title: 'Centro Comercial Galerías' }}
        />
      </View>

      <View className="absolute top-0 left-0 right-0 px-4" style={{ paddingTop: insets.top + 16 }}>
        <GlassCard className="p-4 bg-primary">
          <Text className="text-onPrimary text-lg font-bold text-center">
            Nueva solicitud de viaje
          </Text>
        </GlassCard>
      </View>

      <View className="absolute bottom-0 left-0 right-0 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <GlassCard className="mx-4 p-4 mb-4">
          <View className="flex-row items-start mb-4">
            <View className="w-3 h-3 bg-primary rounded-full mt-2 mr-3" />
            <View className="flex-1">
              <Text className="text-onSurfaceVariant text-xs">Origen</Text>
              <Text className="text-on-surface text-base">Colonia Escalón</Text>
            </View>
          </View>
          <View className="h-6 border-l-2 border-outlineVariant ml-1.5 mb-2" />
          <View className="flex-row items-start mb-4">
            <View className="w-3 h-3 bg-onSurface rounded-full mt-2 mr-3" />
            <View className="flex-1">
              <Text className="text-onSurfaceVariant text-xs">Destino</Text>
              <Text className="text-on-surface text-base">Centro Comercial Galerías</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-onSurfaceVariant text-sm">Distancia</Text>
              <Text className="text-on-surface font-bold">2.5 km</Text>
            </View>
            <View className="items-end">
              <Text className="text-onSurfaceVariant text-sm">Tarifa estimada</Text>
              <Text className="text-on-surface font-bold text-lg">$3.50</Text>
            </View>
          </View>

          <View className="flex-row gap-3 mt-2">
            <Button title="Rechazar" variant="outline" onPress={handleDecline} className="flex-1" />
            <Button title="Aceptar" onPress={handleAccept} className="flex-1" />
          </View>
        </GlassCard>
      </View>
    </View>
  )
}
