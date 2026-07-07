import { useCallback } from 'react'
import { View, Text, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard, Loading } from '@motosv/ui'
import { useSession, useWallet, useWalletTransactions } from '@motosv/api'

const typeLabels: Record<string, { label: string; icon: string }> = {
  deposit: { label: 'Depósito', icon: '💰' },
  withdrawal: { label: 'Retiro', icon: '🏧' },
  payment: { label: 'Pago de viaje', icon: '🚕' },
  refund: { label: 'Reembolso', icon: '↩️' },
  referral_bonus: { label: 'Bono referido', icon: '🎉' },
}

export function WalletScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: wallet, isLoading } = useWallet(session?.user?.id)
  const { data: transactions } = useWalletTransactions(session?.user?.id)

  const renderTransaction = useCallback(({ item }: { item: any }) => {
    const info = typeLabels[item.type] ?? { label: item.type, icon: '📄' }
    return (
      <GlassCard className="mb-2 p-4">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">{info.icon}</Text>
          <View className="flex-1">
            <Text className="text-on-surface font-medium">{info.label}</Text>
            <Text className="text-onSurfaceVariant text-xs">
              {new Date(item.created_at).toLocaleDateString('es')}
            </Text>
            {item.description && (
              <Text className="text-onSurfaceVariant text-xs mt-0.5">{item.description}</Text>
            )}
          </View>
          <Text className={`font-bold text-lg ${item.amount >= 0 ? 'text-primary' : 'text-error'}`}>
            {item.amount >= 0 ? '+' : ''}${Number(item.amount).toFixed(2)}
          </Text>
        </View>
      </GlassCard>
    )
  }, [])

  if (isLoading) return <Loading fullScreen />

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold">Billetera</Text>
      </View>

      <GlassCard className="mx-4 p-6 mb-4 items-center">
        <Text className="text-onSurfaceVariant text-sm">Saldo disponible</Text>
        <Text className="text-on-surface text-4xl font-bold mt-1">
          ${Number(wallet?.balance ?? 0).toFixed(2)}
        </Text>
        <Text className="text-onSurfaceVariant text-xs mt-1">{wallet?.currency ?? 'USD'}</Text>
      </GlassCard>

      <View className="px-4 flex-1">
        <Text className="text-on-surface text-lg font-semibold mb-3">Movimientos</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          ListEmptyComponent={
            <View className="py-12 items-center">
              <Text className="text-onSurfaceVariant text-base">Sin movimientos</Text>
            </View>
          }
        />
      </View>
    </View>
  )
}
