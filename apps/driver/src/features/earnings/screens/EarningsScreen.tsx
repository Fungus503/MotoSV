import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard, Loading } from '@motosv/ui'
import { useSession, useDriverEarnings } from '@motosv/api'

export function EarningsScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: earnings, isLoading } = useDriverEarnings(session?.user?.id)

  if (isLoading) return <Loading fullScreen />

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold">Ganancias</Text>
      </View>

      <GlassCard className="mx-4 p-6 mb-4">
        <Text className="text-onSurfaceVariant text-sm">Total ganado</Text>
        <Text className="text-on-surface text-4xl font-bold mt-1">
          ${earnings?.total.toFixed(2) ?? '0.00'}
        </Text>
        <Text className="text-onSurfaceVariant text-sm mt-1">
          {earnings?.trips ?? 0} viajes completados
        </Text>
      </GlassCard>

      <View className="flex-row mx-4 gap-3 mb-4">
        <GlassCard className="flex-1 p-4">
          <Text className="text-onSurfaceVariant text-xs">Hoy</Text>
          <Text className="text-on-surface text-xl font-bold mt-1">
            ${earnings?.today.toFixed(2) ?? '0.00'}
          </Text>
        </GlassCard>
        <GlassCard className="flex-1 p-4">
          <Text className="text-onSurfaceVariant text-xs">Esta semana</Text>
          <Text className="text-on-surface text-xl font-bold mt-1">
            ${earnings?.weekly.toFixed(2) ?? '0.00'}
          </Text>
        </GlassCard>
      </View>

      <View className="px-4">
        <Text className="text-on-surface text-lg font-semibold mb-3">Viajes recientes</Text>
        <GlassCard className="p-6 items-center">
          <Text className="text-onSurfaceVariant text-base">
            No hay viajes recientes
          </Text>
        </GlassCard>
      </View>
    </View>
  )
}
