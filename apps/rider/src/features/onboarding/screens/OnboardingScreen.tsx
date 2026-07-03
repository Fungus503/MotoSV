import { useState } from 'react'
import { View, Text, Image } from 'react-native'
import { router } from 'expo-router'
import { Button } from '@motosv/ui'

const slides = [
  {
    title: 'Solicita tu mototaxi',
    description: 'Elige tu destino y encuentra un mototaxi cerca de ti en segundos.',
  },
  {
    title: 'Viaje en tiempo real',
    description: 'Sigue la ubicación de tu conductor y comparte tu viaje con quien quieras.',
  },
  {
    title: 'Pago seguro',
    description: 'Paga con efectivo, tarjeta o billetera digital. Tú eliges.',
  },
]

export function OnboardingScreen() {
  const [slideIndex, setSlideIndex] = useState(0)
  const slide = slides[slideIndex]
  const isLast = slideIndex === slides.length - 1

  function handleNext() {
    if (isLast) {
      router.replace('/(tabs)/home')
    } else {
      setSlideIndex((i) => i + 1)
    }
  }

  function handleSkip() {
    router.replace('/(tabs)/home')
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center px-8">
        <View className="w-48 h-48 bg-primaryContainer/30 rounded-full items-center justify-center mb-8">
          <Text className="text-5xl">🛵</Text>
        </View>
        <Text className="text-on-surface text-2xl font-bold text-center mb-3">
          {slide.title}
        </Text>
        <Text className="text-onSurfaceVariant text-base text-center leading-6">
          {slide.description}
        </Text>
      </View>

      <View className="flex-row justify-center mb-8">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`w-2 h-2 rounded-full mx-1 ${i === slideIndex ? 'bg-primary w-6' : 'bg-outlineVariant'}`}
          />
        ))}
      </View>

      <View className="px-6 pb-12">
        <Button title={isLast ? 'Comenzar' : 'Siguiente'} onPress={handleNext} />
        {!isLast && (
          <Button title="Saltar" onPress={handleSkip} variant="ghost" className="mt-2" />
        )}
      </View>
    </View>
  )
}
