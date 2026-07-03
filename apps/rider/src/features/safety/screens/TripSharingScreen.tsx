import { useState } from 'react'
import { View, Text, Share } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { Button, GlassCard, Input } from '@motosv/ui'
import { useCreateTripShare } from '@motosv/api'

export function TripSharingScreen() {
  const insets = useSafeAreaInsets()
  const { rideId } = useLocalSearchParams<{ rideId: string }>()
  const createShare = useCreateTripShare()
  const [shareLink, setShareLink] = useState<string | null>(null)

  async function handleCreateLink() {
    if (!rideId) return
    try {
      const result = await createShare.mutateAsync({ ride_id: rideId })
      const link = `https://motosv.app/share/${result.share_code}`
      setShareLink(link)
    } catch {}
  }

  async function handleShare() {
    if (!shareLink) return
    try {
      await Share.share({
        message: `Estoy en un viaje con MotoSV. Sigue mi viaje en vivo aquí: ${shareLink}`,
        url: shareLink,
      })
    } catch {}
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold mb-1">Compartir viaje</Text>
        <Text className="text-onSurfaceVariant text-sm">
          Comparte tu viaje en vivo con tus contactos de confianza
        </Text>
      </View>

      <View className="flex-1 px-4 items-center justify-center">
        <GlassCard className="w-full p-6 items-center mb-6">
          <Text className="text-5xl mb-4">🔗</Text>
          <Text className="text-on-surface text-lg font-semibold text-center mb-2">
            Enlace de seguimiento en vivo
          </Text>
          <Text className="text-onSurfaceVariant text-sm text-center mb-6">
            Tus contactos podrán ver tu ubicación en tiempo real durante el viaje
          </Text>

          {shareLink ? (
            <>
              <View className="w-full bg-surfaceContainerLow rounded-xl px-4 py-3 mb-4">
                <Text className="text-on-surface text-sm" selectable>{shareLink}</Text>
              </View>
              <Text className="text-onSurfaceVariant text-xs mb-4">
                El enlace expira en 2 horas
              </Text>
              <Button title="Compartir enlace" onPress={handleShare} />
            </>
          ) : (
            <Button
              title="Generar enlace"
              onPress={handleCreateLink}
              loading={createShare.isPending}
            />
          )}
        </GlassCard>
      </View>

      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button title="Volver" variant="ghost" onPress={() => router.back()} />
      </View>
    </View>
  )
}
