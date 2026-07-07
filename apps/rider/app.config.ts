import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'MotoSV Rider',
  slug: 'motosv-rider',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'motosv-rider',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    backgroundColor: '#006e2a',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.motosv.rider',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'MotoSV necesita tu ubicación para mostrarte conductores cercanos y calcular tu destino.',
    },
  },
  android: {
    package: 'com.motosv.rider',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    adaptiveIcon: {
      backgroundColor: '#006e2a',
    },
  },
  plugins: [
    'expo-router',
    'expo-asset',
    ['expo-location', { locationAlwaysAndWhenInUsePermission: 'MotoSV necesita tu ubicación para mostrarte conductores cercanos y calcular tu destino.' }],
  ],
  extra: {
    eas: {
      projectId: '2d9c4224-e975-4ee1-add4-73b978550e09',
    },
  },
  experiments: {
    typedRoutes: true,
  },
}

export default config
