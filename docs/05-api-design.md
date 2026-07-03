# Diseño de API — MotoSV

## 1. Estrategia General

MotoSV no expone una REST API tradicional. En su lugar, usa tres mecanismos:

| Mecanismo | Propósito | Protocolo |
|---|---|---|
| **Supabase RPC** | Operaciones transaccionales críticas (match_driver, create_ride) | `supabase.rpc()` |
| **Supabase Realtime** | Broadcast de ubicación GPS, eventos de ride, mensajería | WebSocket nativo |
| **Edge Functions** | Lógica compleja (matching engine), webhooks de pago, notificaciones push | HTTP/HTTPS con JWT |

## 2. Cliente Supabase (packages/api)

Todas las apps usan el mismo cliente configurado en `packages/api/`.

```typescript
// packages/api/src/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

## 3. Database RPCs (Functions)

### Ride Lifecycle

| RPC | Args | Returns | Descripción |
|---|---|---|---|
| `request_ride` | rider_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng | ride_id, estimated_fare | Crear ride en estado pending |
| `match_driver` | ride_id, driver_id | boolean | Asignar driver (atómico, FOR UPDATE) |
| `start_ride` | ride_id | void | Cambiar a in_progress |
| `complete_ride` | ride_id, final_fare, distance, duration | void | Finalizar viaje, calcular tarifa |
| `cancel_ride` | ride_id, reason, cancelled_by | void | Cancelar viaje |
| `rate_ride` | ride_id, rater_id, rated_id, rating, comment | void | Calificar post-viaje |

### Drivers

| RPC | Args | Returns | Descripción |
|---|---|---|---|
| `update_driver_location` | driver_id, lat, lng, heading, speed | void | Actualizar ubicación (broadcast Realtime) |
| `set_driver_online` | driver_id, is_online | void | Online/offline toggle |
| `find_nearby_drivers` | lat, lng, radius_meters | driver_id[], distance[] | Consulta PostGIS ST_DWithin |

### Payments

| RPC | Args | Returns | Descripción |
|---|---|---|---|
| `create_payment_intent` | ride_id, gateway, amount | gateway_txn_id | Iniciar pago |
| `confirm_payment` | ride_id, gateway_txn_id | void | Confirmar pago desde webhook |
| `calculate_fare` | pickup_lat, pickup_lng, dropoff_lat, dropoff_lng | estimated_fare, distance, duration | Estimar tarifa |

## 4. Real-time Subscriptions (packages/realtime)

### Canales

| Channel | Eventos | Descripción |
|---|---|---|
| `driver-locations` | `broadcast:location` | Ubicación de drivers (1s interval) |
| `ride:{ride_id}` | `broadcast:status_change` | Cambios de estado del ride |
| `ride:{ride_id}:driver-location` | `broadcast:gps` | GPS del conductor asignado |
| `ride:{ride_id}:chat` | `broadcast:message` | Mensajes rider ↔ driver |
| `driver:{driver_id}:requests` | `broadcast:new_ride_request` | Solicitudes entrantes al driver |

### Hook de ejemplo (TanStack Query + Realtime)

```typescript
// En una feature, e.g., features/ride-tracking/hooks/useRideSubscription.ts
export function useRideSubscription(rideId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`ride:${rideId}`)
      .on(
        'broadcast',
        { event: 'status_change' },
        (payload) => {
          queryClient.setQueryData(['ride', rideId], payload.payload)
          queryClient.invalidateQueries({ queryKey: ['ride', rideId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rideId])
}
```

## 5. Edge Functions (supabase/functions/)

### matching/index.ts

```typescript
// Escucha nuevos rides via Realtime
// Busca drivers cercanos con PostGIS ST_DWithin
// Broadcast a los drivers elegibles con el ride info
// Timeout de 30s — si no hay matching, notify al rider
```

**Flujo:**
```
1. Rider: supabase.rpc('request_ride', {...}) → rides INSERT
2. Realtime broadcast → Edge Function matching detecta nuevo ride
3. Edge Function: SELECT driver_locations WHERE ST_DWithin(...) ORDER BY distance
4. Edge Function: broadcast a cada driver `driver:{id}:requests`
5. Driver: acepta → supabase.rpc('match_driver', {ride_id, driver_id})
6. Respuesta: success → Edge Function broadcast ride confirmado | fail → try next driver
```

### payments-webhook/index.ts

```typescript
// POST /webhooks/stripe
// POST /webhooks/paypal
// POST /webhooks/wompi
// Verificar firma del webhook
// Actualizar payment status
// Si completed → trigger complete_ride flow
```

### notifications/index.ts

```typescript
// Expo Push Notification sender
// Recibe evento Realtime + push_token
// Envía notificación via Expo Push API
```

## 6. TanStack Query Hooks (packages/api)

Cada feature expone hooks en `features/<name>/queries/`.

### Ejemplo: Ride Queries

```typescript
// features/ride-request/queries/useRideRequest.ts
export function useRequestRide() {
  return useMutation({
    mutationFn: async (params: RequestRideParams) => {
      const { data, error } = await supabase.rpc('request_ride', params)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-rides'] })
    },
  })
}

// features/ride-tracking/queries/useRide.ts
export function useRide(rideId: string) {
  return useQuery({
    queryKey: ['ride', rideId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*, driver:driver_id(full_name, avatar_url, phone)')
        .eq('id', rideId)
        .single()
      if (error) throw error
      return data
    },
    staleTime: 1000 * 10, // 10 seconds
  })
}
```

## 7. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| RPC functions | snake_case, verb_noun | `request_ride`, `match_driver` |
| Edge Functions | kebab-case | `payments-webhook` |
| Canales Realtime | kebab-case, con : separador | `ride:{ride_id}`, `driver-locations` |
| Eventos Realtime | snake_case | `status_change`, `new_ride_request` |
| Query keys TanStack | camelCase, array | `['ride', rideId]`, `['driver-locations']` |
| Mutation functions | camelCase | `useRequestRide`, `useMatchDriver` |
