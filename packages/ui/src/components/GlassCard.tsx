import { View } from 'react-native'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <View
      className={`bg-surfaceContainerLow/80 backdrop-blur-xl rounded-2xl border border-surfaceContainerHigh/50 shadow-sm ${className}`}
    >
      {children}
    </View>
  )
}
