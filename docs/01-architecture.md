# Arquitectura del Sistema — MotoSV

## 1. Visión General

MotoSV es una plataforma de mototaxis para El Salvador con tres aplicaciones cliente (rider, driver, admin) y un backend unificado en Supabase. La arquitectura sigue un modelo **feature-slices verticales** donde cada funcionalidad completa (DB → API → UI) vive en un slice independiente.

## 2. Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         Clientes                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Rider    │  │  Driver   │  │  Admin   │                  │
│  │ (Expo RN) │  │ (Expo RN) │  │ (React/V)│                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │              │              │                        │
│       └──────────────┴──────────────┘                        │
│                          │                                    │
│                    Supabase Client (packages/api)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Supabase Backend                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL 15 + PostGIS              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ Auth     │  │ Realtime │  │ Storage          │   │   │
│  │  │ (Users,  │  │ (GPS     │  │ (Documentos,     │   │   │
│  │  │  Roles)  │  │  Broadcast)│  │  Fotos)          │   │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  RLS Policies (11 migraciones)               │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Edge Functions (Deno)                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ Matching │  │ Payments │  │ Notifications    │   │   │
│  │  │ Engine   │  │ Webhooks │  │ (Push)           │   │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Servicios Externos                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐          │
│  │ Google   │  │ Stripe   │  │ PayPal / Wompi   │          │
│  │ Maps     │  │ Payments │  │                  │          │
│  └──────────┘  └──────────┘  └──────────────────┘          │
│  ┌──────────┐  ┌──────────┐                                 │
│  │ Sentry   │  │ Grafana  │                                 │
│  │ Errors   │  │ Metrics  │                                 │
│  └──────────┘  └──────────┘                                 │
└──────────────────────────────────────────────────────────┘
```

## 3. Decisiones Técnicas Fundamentales

### 3.1. Monorepo con Turborepo + pnpm
- **Por qué**: Código compartido entre 3 apps (rider, driver, admin) sin duplicación
- **Qué comparte**: tipos, cliente API, validaciones Zod, tokens de diseño, hooks de estado
- **Cómo**: `packages/api`, `packages/domain`, `packages/ui`, `packages/realtime`, `packages/config`

### 3.2. Supabase como Backend Unificado
- **Por qué**: Reduce significativamente la superficie operativa — una sola plataforma maneja DB, Auth, Realtime, Storage, Edge Functions, RLS
- **Qué reemplaza**: Firebase Auth + custom backend + WebSocket server + CDN
- **PostGIS incluido**: consultas geoespaciales nativas para matching de conductores por proximidad

### 3.3. Vertical Slices (no capas horizontales)
- **Por qué**: Cada feature se desarrolla, prueba y despliega independientemente
- **Cómo funciona**: Una feature como "ride-request" incluye su migración DB, RPC, llamada API, hook TanStack Query, y pantalla UI — todo en un solo PR
- **Diferencia clave**: No hay capas "repository", "service layer", "controller" globales — cada feature tiene su propia estructura vertical

### 3.4. State Management por Tipo
- **Server State** (datos de DB): TanStack Query — caching automático, re-fetch, optimistic updates
- **UI State** (modales, toggles): Zustand — liviano, sin boilerplate
- **State Machine** (ride lifecycle): XState — garantiza que el ride no puede saltarse estados

### 3.5. Google Maps como Único Proveedor de Mapas
- **Por qué**: SDK más maduro para React Native, excellent soporte de rutas en El Salvador
- **SDKs usados**: Maps SDK (renderizado), Routes API (ETA), Directions API (rutas), Places API (autocomplete)

## 4. Stack Detallado

| Componente | Tecnología | Versión |
|---|---|---|
| Mobile Framework | Expo SDK | 54+ |
| UI Library | React Native | 0.76+ |
| Language | TypeScript | 5.5+ |
| Routing | Expo Router | 4+ |
| Styling | NativeWind (Tailwind) | 4+ |
| Server State | TanStack Query | 5+ |
| UI State | Zustand | 5+ |
| State Machine | XState | 5+ |
| Forms | React Hook Form + Zod | 7+ |
| Animations | Reanimated | 3+ |
| Database | PostgreSQL + PostGIS | 15 |
| Auth | Supabase Auth | latest |
| Realtime | Supabase Realtime | latest |
| Edge Runtime | Deno | 2+ |
| Maps | Google Maps Platform | latest |
| Payments | Stripe + PayPal + Wompi | latest |
| Monitoring | Sentry + Grafana | latest |
| Notifications | Expo Push | latest |
| CI/CD | EAS Build + GitHub Actions | latest |

## 5. Flujo de Datos — Ride Completo

```
1. Rider abre app → Auth (Phone OTP / Google / Apple)
2. Rider ve mapa → Google Maps SDK renderiza
3. Rider setea destino → Places API autocomplete → Geocoding
4. Rider solicita ride → Supabase RPC request_ride(lat, lng, dest_lat, dest_lng)
5. Matching Engine (Edge Function) recibe evento Realtime
6. Edge Function busca drivers cercanos (PostGIS ST_DWithin)
7. Edge Function notifica drivers via Realtime broadcast
8. Driver acepta → RPC accept_ride(ride_id, driver_id) with FOR UPDATE lock
9. Rider recibe confirmación → Realtime subscription ride_status
10. Rider ve driver en mapa → Realtime broadcast driver_location (1s updates)
11. Driver llega → inicia viaje → RPC start_ride(ride_id)
12. Rider viaja → GPS tracking broadcast
13. Driver finaliza → RPC complete_ride(ride_id)
14. Cálculo de tarifa → RPC calculate_fare(ride_id)
15. Pago → Stripe/PayPal/Wompi intent → confirmación
16. Calificación → RPC rate_ride(ride_id, rating, comment)
```

## 6. Features Planificadas por App

### Rider App
- Autenticación (Phone OTP + Google + Apple)
- Onboarding
- Home con mapa
- Búsqueda de destino (Google Places)
- Solicitud de viaje con tarifas
- Tracking en tiempo real del conductor
- Chat con conductor
- Historial de viajes
- Calificación de viajes
- Billetera y pagos
- Perfil de usuario
- Direcciones guardadas
- Centro de ayuda
- Centro de seguridad
- Referidos y promociones

### Driver App
- Autenticación (Phone OTP + Google)
- Verificación de documentos
- Dashboard de ganancias
- Recepción de solicitudes de viaje
- Navegación GPS al pasajero
- Viaje en curso con tracking
- Chat con pasajero
- Historial de viajes y ganancias
- Configuración y perfil

### Admin Web
- Dashboard con métricas en tiempo real
- Gestión de conductores (verificación documentos)
- Gestión de usuarios
- Monitoreo de viajes en vivo
- Reportes y analytics
- Configuración de tarifas
- Gestión de pagos y comisiones

## 7. Modelo de Datos (Alto Nivel)

Ver `02-database-schema.md` para el esquema detallado.

| Tabla | Propósito |
|---|---|
| `profiles` | Perfiles rider/driver/admin, extendido de auth.users |
| `driver_locations` | Ubicación en tiempo real de conductores (PostGIS Point) |
| `rides` | Ciclo de vida completo del viaje (state machine) |
| `ride_statuses` | Historial de cambios de estado del ride |
| `payments` | Transacciones multi-gateway |
| `ratings` | Calificaciones rider ↔ driver |
| `saved_places` | Direcciones guardadas por usuario |
| `driver_documents` | Documentos de verificación de conductores |
| `promotions` | Códigos promocionales |
| `price_estimates` | Caché de estimaciones de tarifa |
