import { View, Text, TextInput, TouchableOpacity } from 'react-native'

interface DestinationInputProps {
  pickupAddress: string
  dropoffAddress: string
  onPickupChange: (text: string) => void
  onDropoffChange: (text: string) => void
  onFocusPickup?: () => void
  onFocusDropoff?: () => void
}

export function DestinationInput({
  pickupAddress,
  dropoffAddress,
  onPickupChange,
  onDropoffChange,
  onFocusPickup,
  onFocusDropoff,
}: DestinationInputProps) {
  return (
    <View className="bg-surfaceContainerLow/90 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-surfaceContainerHigh/50 mx-4 mb-4">
      <View className="flex-row items-start">
        <View className="items-center mr-3 mt-2">
          <View className="w-3 h-3 bg-primary rounded-full" />
          <View className="w-0.5 flex-1 bg-outlineVariant my-1" style={{ minHeight: 24 }} />
          <View className="w-3 h-3 bg-onSurface rounded-full" />
        </View>
        <View className="flex-1">
          <TextInput
            value={pickupAddress}
            onChangeText={onPickupChange}
            onFocus={onFocusPickup}
            placeholder="Tu ubicación"
            placeholderTextColor="#9ca3af"
            className="text-on-surface text-base py-2 border-b border-outlineVariant"
          />
          <TextInput
            value={dropoffAddress}
            onChangeText={onDropoffChange}
            onFocus={onFocusDropoff}
            placeholder="¿A dónde vas?"
            placeholderTextColor="#9ca3af"
            className="text-on-surface text-base py-2"
          />
        </View>
      </View>
    </View>
  )
}
