import { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Button, GlassCard } from '@motosv/ui'
import { useTriggerPanic, useActivePanicAlert } from '@motosv/api'

const alertTypes = [
  { id: 'emergency', label: 'Emergencia', icon: '🚨', color: 'bg-error' },
  { id: 'accident', label: 'Accidente', icon: '💥', color: 'bg-orange-500' },
  { id: 'harassment', label: 'Acoso', icon: '⚠️', color: 'bg-yellow-600' },
  { id: 'other', label: 'Otro', icon: '❓', color: 'bg-surfaceContainerHigh' },
]

export function PanicScreen() {
  const insets = useSafeAreaInsets()
  const { rideId } = useLocalSearchParams<{ rideId: string }>()
  const triggerPanic = useTriggerPanic()
  const { data: activeAlert } = useActivePanicAlert(rideId)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSendAlert() {
    if (!selectedType || !rideId) return
    try {
      await triggerPanic.mutateAsync({ ride_id: rideId, alert_type: selectedType })
      setSent(true)
    } catch {}
  }

  if (activeAlert || sent) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-6xl mb-4">🚨</Text>
        <Text className="text-on-surface text-2xl font-bold text-center mb-2">
          Alerta enviada
        </Text>
        <Text className="text-onSurfaceVariant text-base text-center mb-8">
          Tu alerta ha sido recibida. Nuestro equipo de seguridad está al tanto.
          {activeAlert?.alert_type === 'emergency' && '\n\nSi es una emergencia real, contacta a las autoridades locales al 911.'}
        </Text>
        <Button title="Volver al viaje" onPress={() => router.back()} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold mb-1">Botón de pánico</Text>
        <Text className="text-onSurfaceVariant text-sm">Selecciona el tipo de alerta</Text>
      </View>

      <View className="px-4 flex-1">
        {alertTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setSelectedType(type.id)}
            className={`flex-row items-center p-4 rounded-2xl mb-3 ${
              selectedType === type.id ? `${type.color} bg-opacity-20 border-2 border-${type.color.replace('bg-', '')}` : 'bg-surfaceContainerLow'
            }`}
          >
            <Text className="text-2xl mr-3">{type.icon}</Text>
            <Text className="text-on-surface text-base font-medium">{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          title="Enviar alerta"
          onPress={handleSendAlert}
          disabled={!selectedType}
          loading={triggerPanic.isPending}
          className="bg-error"
        />
      </View>
    </View>
  )
}
