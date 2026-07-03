# OpenStreetMap Integration — MotoSV

## Stack
- **react-native-maps** v1.18.0 (Expo SDK 52+)
- **expo-location** v18.0.0
- **OpenStreetMap tiles** (gratis, sin API key)

## Archivos creados

| Archivo | Propósito |
|---------|-----------|
| `apps/rider/src/lib/OSMMap.tsx` | Componente mapa para rider (markers pickup/dropoff/driver) |
| `apps/driver/src/lib/OSMMap.tsx` | Componente mapa para driver (markers pickup/dropoff/rider) |

## Pantallas actualizadas

| App | Pantalla | Reemplazado |
|-----|----------|------------|
| Rider | HomeScreen | ✅ Placeholder → OSMMap con ubicación actual |
| Rider | RideRequestScreen | ✅ Placeholder → OSMMap con ruta pickup→dropoff |
| Rider | TrackingScreen | ✅ Placeholder → OSMMap con ruta real del viaje |
| Driver | HomeScreen | ✅ Placeholder → OSMMap con ubicación actual |
| Driver | IncomingRideScreen | ✅ Placeholder → OSMMap con ruta de solicitud |
| Driver | NavigationScreen | ✅ Placeholder → OSMMap con navegación |

## Permisos

- **iOS**: `NSLocationWhenInUseUsageDescription` en `app.json`
- **Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` en `app.json`
- **Driver Android**: `ACCESS_BACKGROUND_LOCATION` adicional
- **plugin**: `expo-location` config plugin agregado en ambos apps

## Limitaciones

- `UrlTile` requiere **expo-dev-client** (no funciona en Expo Go)
- Para probar en dispositivo, ejecutar: `npx expo run:android` o `npx expo run:ios`
- En web, `react-native-maps` no soporta `UrlTile` — muestra mapa vacío
- Los tiles de OSM tienen rate limit: ~20 tiles/s por IP (suficiente para dev/testing)

## Configuración para producción

Para producción, considerar:
1. **Servicio de tiles propio** con MapTiler/OpenMapTiles (más rápido, sin rate limit)
2. **Cache de tiles** con react-native-maps `offlineMode`
3. **Google Maps** como fallback si se paga API key
