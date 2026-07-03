# Seguridad — MotoSV

## 1. Principios

- **RLS en TODAS las tablas:** no hay tabla pública sin Row Level Security
- **Defensa en profundidad:** RLS + validación en Edge Functions + Zod en inputs
- **Mínimo privilegio:** cada rol (rider, driver, admin) solo ve/edita lo que necesita
- **Sin secretos en cliente:** todas las API keys sensibles están en Supabase o Edge Functions
- **Race condition prevention:** `SELECT FOR UPDATE` en operaciones críticas

## 2. Autenticación (Supabase Auth)

### Métodos Soportados
| Método | Prioridad | Implementación |
|---|---|---|
| Phone OTP | Alta | SMS con código de 6 dígitos (principal en El Salvador) |
| Google | Media | Google One Tap en iOS/Android |
| Apple | Alta | Sign in with Apple (requerido para iOS) |

### Flujo de Auth
```
1. User ingresa phone → Supabase Auth signInWithOtp()
2. User recibe SMS con código OTP
3. User ingresa código → Supabase Auth verifyOtp()
4. onAuthStateChange dispara → trigger handle_new_user() → insert profiles
5. JWT session expires → auto-refresh con refresh token
```

### Manejo de Sesión en Cliente

```typescript
// packages/api/src/auth/session.ts
export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    },
    staleTime: Infinity, // No refetch, solo cambia por onAuthStateChange
  })
}

// Escuchar cambios de auth
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    queryClient.setQueryData(['session'], session)
  })
  return () => subscription.unsubscribe()
}, [])
```

## 3. Row Level Security (RLS)

### Políticas por Tabla

#### profiles
```sql
-- Rider: solo su propio perfil
CREATE POLICY "users_view_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin: puede ver todos
CREATE POLICY "admin_view_all_profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User: puede actualizar su propio perfil
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- No INSERT público (solo trigger desde auth.users)
```

#### driver_locations
```sql
-- Driver: puede ver y actualizar su propia ubicación
CREATE POLICY "driver_manage_own_location" ON public.driver_locations
  FOR ALL USING (auth.uid() = driver_id);

-- Rider: puede ver conductores online cercanos
CREATE POLICY "rider_view_nearby_drivers" ON public.driver_locations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'rider')
    AND is_online = true
  );
```

#### rides
```sql
-- Rider: puede ver sus propios rides
CREATE POLICY "rider_view_own_rides" ON public.rides
  FOR SELECT USING (auth.uid() = rider_id);

-- Driver: puede ver rides asignados a él
CREATE POLICY "driver_view_assigned_rides" ON public.rides
  FOR SELECT USING (auth.uid() = driver_id);

-- Rider: puede crear rides
CREATE POLICY "rider_create_rides" ON public.rides
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

-- Admin: puede ver todos los rides
CREATE POLICY "admin_view_all_rides" ON public.rides
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

#### payments
```sql
-- Rider: puede ver sus propios pagos
CREATE POLICY "rider_view_own_payments" ON public.payments
  FOR SELECT USING (auth.uid() = rider_id);

-- Driver: puede ver pagos de sus rides
CREATE POLICY "driver_view_ride_payments" ON public.payments
  FOR SELECT USING (auth.uid() = driver_id);

-- Solo Edge Function puede INSERT/UPDATE payments
CREATE POLICY "edge_function_manage_payments" ON public.payments
  FOR ALL USING (auth.role() = 'service_role');
-- (service_role solo disponible en Edge Functions con SECURITY DEFINER)
```

## 4. Race Condition Prevention

### El Problema
Dos conductores pueden aceptar el mismo ride simultáneamente.

### La Solución
La función `match_driver()` usa `SELECT FOR UPDATE` para bloquear la fila
exclusivamente durante la transacción:

```sql
CREATE OR REPLACE FUNCTION public.match_driver(
  p_ride_id UUID,
  p_driver_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status ride_status;
BEGIN
  -- Lock exclusivo: otro driver que llame match_driver() esperará
  SELECT status INTO v_current_status
  FROM public.rides
  WHERE id = p_ride_id
  FOR UPDATE;

  -- Si ya no está pending, otro driver ganó la carrera
  IF v_current_status != 'pending' THEN
    RETURN FALSE;
  END IF;

  -- Asignación atómica
  UPDATE public.rides
  SET status = 'assigned',
      driver_id = p_driver_id,
      updated_at = now()
  WHERE id = p_ride_id;

  INSERT INTO public.ride_statuses (ride_id, status, changed_by)
  VALUES (p_ride_id, 'assigned', p_driver_id);

  UPDATE public.driver_locations
  SET is_on_ride = true
  WHERE driver_id = p_driver_id;

  RETURN TRUE;
END;
$$;
```

### Flujo de Contención
```
Time  Driver A                          Driver B
 0    CALL match_driver(ride_123, A)    CALL match_driver(ride_123, B)
 1    SELECT FOR UPDATE → OBTIENE LOCK  SELECT FOR UPDATE → ESPERA
 2    status = pending → UPDATE success  (esperando...)
 3    COMMIT → release lock             (esperando...)
 4                                      OBTIENE LOCK → status = 'assigned'
 5                                      RETURN FALSE (rechazado)
```

## 5. Edge Functions Security

### JWT Verification
```typescript
// Edge Functions verifican JWT automáticamente con verify_jwt: true
// Solo requests con Authorization header válido pueden ejecutar la función

// supabase/functions/matching/index.ts
Deno.serve(async (req) => {
  // Supabase ya verificó el JWT automáticamente
  // auth.uid() está disponible en req.headers
  const userId = req.headers.get('x-supabase-auth-uid')

  // Validación adicional con Zod
  const body = requestSchema.parse(await req.json())
  // ...
})
```

### Webhook Security
```typescript
// Stripe webhook: verify signature
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
const sig = req.headers.get('stripe-signature')!
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

## 6. Validación de Inputs (Zod)

```typescript
// packages/domain/src/schemas/ride.ts
export const requestRideSchema = z.object({
  pickup_lat: z.number().min(-90).max(90),
  pickup_lng: z.number().min(-180).max(180),
  dropoff_lat: z.number().min(-90).max(90),
  dropoff_lng: z.number().min(-180).max(180),
  pickup_address: z.string().min(1).max(500),
  dropoff_address: z.string().min(1).max(500),
})

export type RequestRideInput = z.infer<typeof requestRideSchema>
```

## 7. Storage Security

### Bucket: driver-documents
```sql
-- Driver: puede subir sus propios documentos
CREATE POLICY "driver_upload_own_documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'driver-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin: puede ver todos los documentos
CREATE POLICY "admin_view_all_documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'driver-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Driver: puede ver sus propios documentos
CREATE POLICY "driver_view_own_documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'driver-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 8. Environment Variables (Cliente)

```bash
# .env.local (nunca commit)
EXPO_PUBLIC_SUPABASE_URL=https://guwddvudyyxtbbxjzqbx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Todo lo secreto (Stripe secret, PayPal secret, Wompi secret) va en
**Edge Functions environment variables**, nunca en el cliente.
