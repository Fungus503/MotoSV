import { View, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { GlassCard, Button } from '@motosv/ui'
import { useSession, useProfile, signOut } from '@motosv/api'

export function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: profile } = useProfile(session?.user?.id)

  async function handleSignOut() {
    await signOut()
    router.replace('/(auth)/login')
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold">Perfil</Text>
      </View>

      <GlassCard className="mx-4 p-6 items-center mb-6">
        <View className="w-20 h-20 bg-primaryContainer rounded-full items-center justify-center mb-4">
          <Text className="text-onPrimaryContainer text-3xl font-bold">
            {profile?.full_name?.charAt(0) ?? '?'}
          </Text>
        </View>
        <Text className="text-on-surface text-lg font-semibold">
          {profile?.full_name ?? 'Conductor'}
        </Text>
        <Text className="text-onSurfaceVariant text-sm">{profile?.phone}</Text>
      </GlassCard>

      <GlassCard className="mx-4 p-2">
        <TouchableOpacity className="flex-row items-center p-4 border-b border-surfaceContainerHighest">
          <Text className="text-on-surface flex-1">Documentos</Text>
          <Text className="text-onSurfaceVariant">Ver estado</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center p-4 border-b border-surfaceContainerHighest">
          <Text className="text-on-surface flex-1">Idioma</Text>
          <Text className="text-onSurfaceVariant">Español</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center p-4" onPress={handleSignOut}>
          <Text className="text-error flex-1">Cerrar sesión</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  )
}
