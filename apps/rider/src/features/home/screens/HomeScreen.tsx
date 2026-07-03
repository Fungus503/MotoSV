import { useState } from 'react'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button } from '@motosv/ui'
import { DestinationInput } from '../components/DestinationInput'
import { OSMMap } from '../../../src/lib/OSMMap'

export function HomeScreen() {
  const insets = useSafeAreaInsets()
  const [pickupAddress, setPickupAddress] = useState('')
  const [dropoffAddress, setDropoffAddress] = useState('')

  function handleConfirmDestination() {
    if (!dropoffAddress.trim()) return
    router.push('/ride/request')
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1">
        <OSMMap showUserLocation />
      </View>

      <View style={{ paddingTop: insets.top }} className="absolute top-0 left-0 right-0">
        <View className="bg-primary px-4 py-3">
          <Text className="text-onPrimary text-lg font-bold">MotoSV</Text>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 right-0 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <DestinationInput
          pickupAddress={pickupAddress}
          dropoffAddress={dropoffAddress}
          onPickupChange={setPickupAddress}
          onDropoffChange={setDropoffAddress}
        />
        {dropoffAddress.trim().length > 0 && (
          <View className="mx-4">
            <Button title="Confirmar destino" onPress={handleConfirmDestination} />
          </View>
        )}
      </View>
    </View>
  )
}
