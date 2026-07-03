import { useState } from 'react'
import { View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Button, GlassCard } from '@motosv/ui'
import { useCreatePayment } from '@motosv/api'

const paymentMethods = [
  { id: 'cash', label: 'Efectivo', icon: '💵' },
  { id: 'stripe', label: 'Tarjeta', icon: '💳' },
  { id: 'paypal', label: 'PayPal', icon: '📱' },
]

export function PaymentScreen() {
  const insets = useSafeAreaInsets()
  const [selectedMethod, setSelectedMethod] = useState('cash')
  const createPayment = useCreatePayment()

  async function handlePay() {
    try {
      await createPayment.mutateAsync({
        ride_id: 'placeholder-ride-id',
        gateway: selectedMethod,
        amount: 3.5,
      })
      router.push('/ride/rating')
    } catch {
      // error handled
    }
  }

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-1 px-4 pt-8">
        <Text className="text-on-surface text-2xl font-bold mb-2">Método de pago</Text>
        <Text className="text-onSurfaceVariant text-base mb-6">
          Total: $3.50
        </Text>

        <GlassCard className="p-2">
          {paymentMethods.map((method) => (
            <View
              key={method.id}
              className={`flex-row items-center p-4 rounded-xl mb-1 ${selectedMethod === method.id ? 'bg-primaryContainer/30' : ''}`}
            >
              <Text className="text-2xl mr-3">{method.icon}</Text>
              <Text className="flex-1 text-on-surface text-base font-medium">{method.label}</Text>
              <View
                className={`w-5 h-5 rounded-full border-2 ${selectedMethod === method.id ? 'bg-primary border-primary' : 'border-outlineVariant'} items-center justify-center`}
              >
                {selectedMethod === method.id && <View className="w-2.5 h-2.5 bg-onPrimary rounded-full" />}
              </View>
            </View>
          ))}
        </GlassCard>
      </View>

      <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          title="Pagar ahora"
          onPress={handlePay}
          loading={createPayment.isPending}
        />
      </View>
    </View>
  )
}
