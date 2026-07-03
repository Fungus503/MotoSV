import { Platform } from 'react-native'

const fontFamily = Platform.select({
  ios: 'PlusJakartaSans',
  android: 'PlusJakartaSans',
  default: 'PlusJakartaSans',
})

export const typography = {
  displayLg: {
    fontFamily,
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    letterSpacing: -1,
  },
  displayMd: {
    fontFamily,
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  headlineLg: {
    fontFamily,
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  headlineLgMobile: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  titleLg: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  bodyLg: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  labelLg: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelMd: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
} as const
