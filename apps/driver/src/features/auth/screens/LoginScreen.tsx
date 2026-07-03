import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { Button, Input, GlassCard } from '@motosv/ui'
import { signInWithPhone, verifyOtp } from '@motosv/api'

export function DriverLoginScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSendOtp() {
    if (!phone || phone.length < 10) {
      setError('Ingresa un número de teléfono válido')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signInWithPhone(phone)
      setStep('otp')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otp || otp.length < 4) {
      setError('Ingresa el código de verificación')
      return
    }
    setLoading(true)
    setError('')
    try {
      await verifyOtp(phone, otp)
      router.replace('/')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface justify-center px-6"
    >
      <Text className="text-on-surface text-3xl font-bold mb-2">MotoSV</Text>
      <Text className="text-onSurfaceVariant text-base mb-8">
        Conduce y gana con MotoSV
      </Text>

      <GlassCard className="p-6">
        {step === 'phone' ? (
          <>
            <Input
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="+503 7000 0000"
              keyboardType="phone-pad"
              error={error}
            />
            <Button
              title="Enviar código"
              onPress={handleSendOtp}
              loading={loading}
              className="mt-4"
            />
          </>
        ) : (
          <>
            <Text className="text-on-surface text-sm mb-2">
              Código enviado a {phone}
            </Text>
            <Input
              label="Código de verificación"
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              keyboardType="numeric"
              error={error}
              autoFocus
            />
            <Button
              title="Verificar"
              onPress={handleVerifyOtp}
              loading={loading}
              className="mt-4"
            />
            <Button
              title="Cambiar número"
              onPress={() => { setStep('phone'); setOtp(''); setError('') }}
              variant="ghost"
              className="mt-2"
            />
          </>
        )}
      </GlassCard>
    </KeyboardAvoidingView>
  )
}
