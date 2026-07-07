import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard, Loading } from '@motosv/ui'
import { useSession, useDriverDocuments } from '@motosv/api'

const documentLabels: Record<string, string> = {
  license: 'Licencia de conducir',
  identity: 'Documento de identidad',
  vehicle_registration: 'Registro vehicular',
  insurance: 'Seguro',
  photo: 'Foto de perfil',
}

const statusColors: Record<string, string> = {
  approved: 'text-primary',
  pending: 'text-yellow-600',
  rejected: 'text-error',
}

export function DocumentsScreen() {
  const insets = useSafeAreaInsets()
  const { data: session } = useSession()
  const { data: documents, isLoading } = useDriverDocuments(session?.user?.id)

  if (isLoading) return <Loading fullScreen />

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold mb-1">Documentos</Text>
        <Text className="text-onSurfaceVariant text-sm">
          Sube tus documentos para comenzar a conducir
        </Text>
      </View>

      <View className="px-4">
        {Object.entries(documentLabels).map(([type, label]) => {
          const doc = documents?.find((d) => d.document_type === type)
          return (
            <GlassCard key={type} className="p-4 mb-3">
              <Pressable className="flex-row items-center">
                <View className="flex-1">
                  <Text className="text-on-surface font-medium">{label}</Text>
                  <Text className={`text-sm mt-1 ${doc ? (statusColors[doc.status] ?? '') : 'text-onSurfaceVariant'}`}>
                    {doc ? (doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'Pendiente') : 'No subido'}
                  </Text>
                </View>
                <Text className="text-primary text-sm">
                  {doc ? 'Ver' : 'Subir'}
                </Text>
              </Pressable>
            </GlassCard>
          )
        })}
      </View>
    </View>
  )
}
