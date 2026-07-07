import { Pressable, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  className?: string
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primaryContainer',
  outline: 'border-2 border-primary bg-transparent',
  ghost: 'bg-transparent',
}

const textStyles: Record<string, string> = {
  primary: 'text-onPrimary',
  secondary: 'text-onPrimaryContainer',
  outline: 'text-primary',
  ghost: 'text-primary',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 rounded-2xl',
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${variantStyles[variant]} ${sizeStyles[size]} items-center justify-center flex-row ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading && <ActivityIndicator className="mr-2" color={variant === 'primary' ? '#ffffff' : '#006e2a'} />}
      <Text className={`${textStyles[variant]} font-semibold text-center`}>{title}</Text>
    </Pressable>
  )
}
