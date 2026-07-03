import { TextInput, View, Text } from 'react-native'

interface InputProps {
  label?: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric'
  secureTextEntry?: boolean
  error?: string
  className?: string
  autoFocus?: boolean
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  className = '',
  autoFocus = false,
}: InputProps) {
  return (
    <View className={`w-full ${className}`}>
      {label && <Text className="text-on-surface text-sm font-medium mb-1">{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoFocus={autoFocus}
        className={`bg-surfaceContainerLow border ${error ? 'border-error' : 'border-outlineVariant'} rounded-xl px-4 py-3 text-on-surface text-base`}
        placeholderTextColor="#9ca3af"
      />
      {error && <Text className="text-error text-xs mt-1">{error}</Text>}
    </View>
  )
}
