import { useCallback } from 'react'
import { View, Text, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard, Loading } from '@motosv/ui'
import { useActivePromotions } from '@motosv/api'

export function PromotionsScreen() {
  const insets = useSafeAreaInsets()
  const { data: promotions, isLoading } = useActivePromotions()

  const renderPromo = useCallback(({ item }: { item: any }) => (
    <GlassCard className="mb-4 overflow-hidden">
      <View className="bg-primary px-4 py-3">
        <Text className="text-onPrimary text-lg font-bold">{item.code}</Text>
      </View>
      <View className="p-4">
        <Text className="text-on-surface font-semibold mb-1">
          {item.discount_type === 'percentage'
            ? `${item.discount_value}% de descuento`
            : `$${item.discount_value} de descuento`}
        </Text>
        {item.description && (
          <Text className="text-onSurfaceVariant text-sm mb-2">{item.description}</Text>
        )}
        <View className="flex-row justify-between items-center">
          <Text className="text-onSurfaceVariant text-xs">
            Válido hasta {new Date(item.expires_at).toLocaleDateString('es')}
          </Text>
          <Text className="text-onSurfaceVariant text-xs">
            {item.current_redemptions}/{item.max_redemptions ?? '∞'} usos
          </Text>
        </View>
      </View>
    </GlassCard>
  ), [])

  if (isLoading) return <Loading fullScreen />

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold">Promociones</Text>
        <Text className="text-onSurfaceVariant text-sm">Descuentos y ofertas disponibles</Text>
      </View>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={renderPromo}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-4xl mb-3">🏷️</Text>
            <Text className="text-on-surface text-lg font-semibold text-center">Sin promociones activas</Text>
            <Text className="text-onSurfaceVariant text-sm text-center mt-1">
              Vuelve pronto para nuevas ofertas
            </Text>
          </View>
        }
      />
    </View>
  )
}
