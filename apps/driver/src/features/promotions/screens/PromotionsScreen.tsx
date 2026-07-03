import { View, Text, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard, Loading } from '@motosv/ui'
import { useActivePromotions } from '@motosv/api'

export function DriverPromotionsScreen() {
  const insets = useSafeAreaInsets()
  const { data: promotions, isLoading } = useActivePromotions()

  if (isLoading) return <Loading fullScreen />

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold">Promociones</Text>
        <Text className="text-onSurfaceVariant text-sm">Ofertas para conductores</Text>
      </View>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
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
              <Text className="text-onSurfaceVariant text-xs">
                Válido hasta {new Date(item.expires_at).toLocaleDateString('es')}
              </Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-4xl mb-3">🏷️</Text>
            <Text className="text-on-surface text-lg font-semibold text-center">Sin promociones activas</Text>
          </View>
        }
      />
    </View>
  )
}
