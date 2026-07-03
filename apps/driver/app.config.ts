import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'MotoSV Driver',
  slug: 'motosv-driver',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'motosv-driver',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.motosv.driver',
  },
  android: {
    package: 'com.motosv.driver',
    adaptiveIcon: {
      backgroundColor: '#006e2a',
    },
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
}

export default config
