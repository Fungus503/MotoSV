import { useCallback } from 'react'
import { View, Text, FlatList, Share } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard, Button, Loading } from '@motosv/ui'
import { useSession, useReferralCode, useReferrals } from '@motosv/api'

export function DriverReferralsScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: refCode } = useReferralCode(session?.user?.id)
  const { data: referrals } = useReferrals(session?.user?.id)

  async function handleShare() {
    if (!refCode?.code) return
    try {
      await Share.share({
        message: `Únete a MotoSV como conductor con mi código: ${refCode.code}. Gana dinero manejando!`,
      })
    } catch {}
  }

  const renderReferral = useCallback(({ item }: { item: { id: string; status: string; reward_amount: number } }) => (
    <GlassCard className="mb-2 p-4">
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-on-surface font-medium">Conductor referido</Text>
          <Text className="text-onSurfaceVariant text-xs">
            {item.status === 'pending' ? 'Pendiente' : item.status === 'completed' ? 'Completado' : 'Recompensado'}
          </Text>
        </View>
        {item.reward_amount > 0 && (
          <Text className="text-primary font-bold">+${Number(item.reward_amount).toFixed(2)}</Text>
        )}
      </View>
    </GlassCard>
  ), [])

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold">Referidos</Text>
        <Text className="text-onSurfaceVariant text-sm">Invita a otros conductores</Text>
      </View>

      <GlassCard className="mx-4 p-6 items-center mb-4">
        <Text className="text-4xl mb-2">🎉</Text>
        <Text className="text-on-surface text-lg font-semibold mb-1">Tu código</Text>
        {refCode ? (
          <>
            <Text className="text-primary text-3xl font-bold tracking-widest my-3">{refCode.code}</Text>
            <Text className="text-onSurfaceVariant text-xs text-center mb-4">
              Comparte tu código con otros conductores
            </Text>
            <Button title="Compartir código" onPress={handleShare} />
          </>
        ) : (
          <Loading />
        )}
      </GlassCard>

      <View className="px-4 flex-1">
        <Text className="text-on-surface text-lg font-semibold mb-3">
          Tus referidos ({referrals?.length ?? 0})
        </Text>
        <FlatList
          data={referrals}
          keyExtractor={(item) => item.id}
          renderItem={renderReferral}
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-onSurfaceVariant text-base">Aún no has referido a nadie</Text>
            </View>
          }
        />
      </View>
    </View>
  )
}
