import { View, ActivityIndicator, Text } from 'react-native'

interface LoadingProps {
  message?: string
  fullScreen?: boolean
}

export function Loading({ message, fullScreen = false }: LoadingProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#006e2a" />
        {message && <Text className="text-onSurfaceVariant mt-4 text-base">{message}</Text>}
      </View>
    )
  }

  return (
    <View className="items-center justify-center py-8">
      <ActivityIndicator size="large" color="#006e2a" />
      {message && <Text className="text-onSurfaceVariant mt-2 text-sm">{message}</Text>}
    </View>
  )
}
