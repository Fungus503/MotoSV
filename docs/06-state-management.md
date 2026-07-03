# Gestión de Estado — MotoSV

## 1. Estrategia General

MotoSV usa **tres herramientas de estado**, cada una para un dominio específico:

| Herramienta | Dominio | Ejemplos |
|---|---|---|
| **TanStack Query** | Server state | Rides, perfiles, tarifas, historial |
| **Zustand** | UI state local | Modal abierto/cerrado, online toggle, onboarding step |
| **XState** | State machine | Ciclo de vida del ride: pending → assigned → in_progress → completed |

## 2. TanStack Query — Server State

### Responsabilidad
- Datos del servidor (Supabase)
- Caching automático con stale-while-revalidate
- Re-fetch en intervalos (para datos que cambian sin Realtime)
- Optimistic updates para acciones instantáneas
- Invalidación al mutar datos relacionados

### Query Key Convention

```typescript
// [domain, identifier?, ...filters]
['ride', rideId]                    → Ride específico
['rides', 'active', userId]         → Rides activos del usuario
['driver-locations', lat, lng]      → Drivers cercanos
['profile', userId]                 → Perfil de usuario
['earnings', driverId, 'week']      → Ganancias semanales
['history', userId, { page }]       → Historial paginado
```

### Hooks Predefinidos (packages/api)

```typescript
// packages/api/src/queries/useRide.ts
export function useRide(rideId: string) {
  return useQuery({
    queryKey: ['ride', rideId],
    queryFn: () => getRideById(rideId),
    staleTime: 5_000,
    refetchInterval: (query) => {
      const ride = query.state.data
      // Refetch cada 5s si el ride está activo
      return ride?.status === 'in_progress' ? 5_000 : false
    },
  })
}
```

### Mutations

```typescript
// features/ride-request/queries/useRequestRide.ts
export function useRequestRide() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestRideRPC,
    onSuccess: (newRideId) => {
      // Insert optimista en caché
      queryClient.setQueryData(['ride', newRideId], { status: 'pending' })
      // Redirigir a pantalla de searching
      router.push(`/ride/searching?id=${newRideId}`)
    },
    onError: (error) => {
      toast.show('Error al solicitar viaje', { type: 'error' })
    },
  })
}
```

## 3. Zustand — UI State

### Responsabilidad
- Estado puramente UI (no persiste, no viene del servidor)
- Preferir hooks locales cuando sea posible
- Usar store solo cuando múltiples componentes no relacionados comparten el estado

### Store Convention

```typescript
// features/home/store/mapStore.ts
interface MapStore {
  isBottomSheetOpen: boolean
  selectedPlace: Place | null
  cameraRegion: CameraRegion | null

  openBottomSheet: () => void
  closeBottomSheet: () => void
  selectPlace: (place: Place) => void
  setCameraRegion: (region: CameraRegion) => void
}

export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      (set) => ({
        isBottomSheetOpen: false,
        selectedPlace: null,
        cameraRegion: null,
        openBottomSheet: () => set({ isBottomSheetOpen: true }),
        closeBottomSheet: () => set({ isBottomSheetOpen: false, selectedPlace: null }),
        selectPlace: (place) => set({ selectedPlace: place }),
        setCameraRegion: (region) => set({ cameraRegion: region }),
      }),
      {
        name: 'map-store',
        partialize: (state) => ({ selectedPlace: state.selectedPlace }),
      }
    ),
    { name: 'MapStore' }
  )
)
```

### Stores Planeados

| Store | Propósito |
|---|---|
| `mapStore` | Estado del mapa (bottom sheet, lugar seleccionado, región) |
| `rideUIStore` | UI del ride activo (tab de chat abierta, sheet detent) |
| `onboardingStore` | Progreso del onboarding (paso actual) |
| `appStore` | Estado global de la app (online/offline, theme) |
| `driverUIStore` | Estado UI del conductor (modal de solicitud, toggle) |

## 4. XState — State Machine (Ride)

### Responsabilidad
- Ciclo de vida del ride — **garantiza que no se pueden saltar estados**
- Lógica compleja con guards, acciones, y transitions condicionales
- Ideal para flujos que requieren validación antes de cambiar

### Ride State Machine

```typescript
// features/ride-request/services/rideMachine.ts
import { setup, assign } from 'xstate'

export const rideMachine = setup({
  types: {
    context: {} as {
      rideId: string | null
      riderId: string | null
      driverId: string | null
      pickup: GeoPoint | null
      dropoff: GeoPoint | null
      estimatedFare: number | null
      finalFare: number | null
      error: string | null
    },
    events: {} as
      | { type: 'REQUEST_RIDE'; pickup: GeoPoint; dropoff: GeoPoint }
      | { type: 'DRIVER_MATCHED'; rideId: string; driverId: string }
      | { type: 'DRIVER_ARRIVED' }
      | { type: 'START_RIDE' }
      | { type: 'COMPLETE_RIDE'; finalFare: number }
      | { type: 'CANCEL'; reason?: string }
      | { type: 'RETRY' }
      | { type: 'TIMEOUT' },
  },
}).createMachine({
  id: 'ride',
  initial: 'idle',
  context: {
    rideId: null,
    riderId: null,
    driverId: null,
    pickup: null,
    dropoff: null,
    estimatedFare: null,
    finalFare: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        REQUEST_RIDE: {
          target: 'searching',
          actions: assign({
            pickup: ({ event }) => event.pickup,
            dropoff: ({ event }) => event.dropoff,
          }),
        },
      },
    },
    searching: {
      on: {
        DRIVER_MATCHED: {
          target: 'driver_assigned',
          actions: assign({
            rideId: ({ event }) => event.rideId,
            driverId: ({ event }) => event.driverId,
          }),
        },
        TIMEOUT: 'searching_timeout',
        CANCEL: 'cancelled',
      },
    },
    searching_timeout: {
      on: {
        RETRY: 'searching',
        CANCEL: 'cancelled',
      },
    },
    driver_assigned: {
      on: {
        DRIVER_ARRIVED: 'driver_arrived',
        CANCEL: {
          target: 'cancelled',
          guard: ({ context }) => context.riderId !== null,
        },
      },
    },
    driver_arrived: {
      on: {
        START_RIDE: 'in_progress',
        CANCEL: 'cancelled',
      },
    },
    in_progress: {
      on: {
        COMPLETE_RIDE: {
          target: 'completed',
          actions: assign({
            finalFare: ({ event }) => event.finalFare,
          }),
        },
      },
    },
    completed: {
      type: 'final',
    },
    cancelled: {
      type: 'final',
    },
  },
})
```

### Uso en React

```typescript
// features/ride-tracking/hooks/useRideMachine.ts
import { useMachine } from '@xstate/react'
import { rideMachine } from '../services/rideMachine'

export function useRideMachine() {
  const [state, send] = useMachine(rideMachine)

  return {
    state: state.value as RideState,
    context: state.context,
    // Acciones simplificadas para la UI
    actions: {
      requestRide: (pickup: GeoPoint, dropoff: GeoPoint) =>
        send({ type: 'REQUEST_RIDE', pickup, dropoff }),
      driverMatched: (rideId: string, driverId: string) =>
        send({ type: 'DRIVER_MATCHED', rideId, driverId }),
      startRide: () => send({ type: 'START_RIDE' }),
      completeRide: (finalFare: number) =>
        send({ type: 'COMPLETE_RIDE', finalFare }),
      cancelRide: (reason?: string) =>
        send({ type: 'CANCEL', reason }),
    },
  }
}
```

## 5. Reglas de Uso

| Situación | Usar | No Usar |
|---|---|---|
| Datos de DB (rides, profiles) | TanStack Query | Zustand |
| Modal abierto/cerrado | Estado local `useState` o Zustand | TanStack Query |
| Ride lifecycle | XState | Zustand o TanStack Query |
| Tema oscuro/claro | Zustand persist | TanStack Query |
| Ubicación GPS en tiempo real | Realtime subscription + TanStack Query cache | Zustand |
| Formulario de registro | React Hook Form + Zod | TanStack Query |
| Chat en tiempo real | Realtime subscription | TanStack Query (no polling) |
