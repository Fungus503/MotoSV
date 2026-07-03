import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'MotoSV Rider',
  slug: 'motosv-rider',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'motosv-rider',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.motosv.rider',
  },
  android: {
    package: 'com.motosv.rider',
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
