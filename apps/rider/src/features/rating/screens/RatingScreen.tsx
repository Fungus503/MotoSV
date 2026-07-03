import { useState } from 'react'
import { View, Text, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button, GlassCard } from '@motosv/ui'
import { useRateRide } from '@motosv/api'

export function RatingScreen() {
  const insets = useSafeAreaInsets()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const rateRide = useRateRide()

  async function handleSubmitRating() {
    if (rating === 0) return
    try {
      await rateRide.mutateAsync({
        ride_id: 'placeholder-ride-id',
        rating,
        comment: comment || undefined,
      })
      router.replace('/(tabs)/home')
    } catch {
      // error handled
    }
  }

  return (
    <View className="flex-1 bg-surface px-4 pt-8">
      <View className="flex-1 items-center justify-center">
        <Text className="text-on-surface text-2xl font-bold mb-2">Califica tu viaje</Text>
        <Text className="text-onSurfaceVariant text-base mb-8 text-center">
          ¿Cómo fue tu experiencia?
        </Text>

        <GlassCard className="p-8 items-center w-full">
          <View className="flex-row mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <View key={star}>
                <Text
                  className={`text-4xl mx-1 ${star <= rating ? '' : 'opacity-20'}`}
                  onPress={() => setRating(star)}
                >
                  ★
                </Text>
              </View>
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Cuéntanos más (opcional)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            className="w-full bg-surfaceContainerLow rounded-xl px-4 py-3 text-on-surface text-base"
          />
        </GlassCard>
      </View>

      <View className="pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          title="Enviar calificación"
          onPress={handleSubmitRating}
          disabled={rating === 0}
          loading={rateRide.isPending}
        />
      </View>
    </View>
  )
}
