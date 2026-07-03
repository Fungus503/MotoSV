# Esquema de Base de Datos — MotoSV

## 1. Extensiones Postgres

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 2. Resumen de Migraciones (11 total)

| # | Migración | Descripción |
|---|---|---|
| 001 | `enable_extensions` | Activar uuid-ossp, postgis, pgcrypto |
| 002 | `create_profiles` | Tabla profiles + triggers de auth.users |
| 003 | `create_driver_locations` | Tabla driver_locations con PostGIS + GIST index |
| 004 | `create_rides` | Tabla rides + state machine + ride_statuses history |
| 005 | `create_matching_rpc` | FUnción match_driver() con FOR UPDATE + distance |
| 006 | `create_payments` | Tabla payments multi-gateway + transactions |
| 007 | `create_ratings` | Tabla ratings rider ↔ driver |
| 008 | `create_saved_places` | Tabla saved_places + Google Places reference |
| 009 | `create_driver_documents` | Tabla driver_documents + storage bucket |
| 010 | `create_promotions` | Tabla promotions + promo_redemptions |
| 011 | `create_price_estimates` | Tabla price_estimates + RPC calculate_fare |

## 3. Esquema Detallado

### 3.1. profiles

```sql
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone           TEXT UNIQUE,
  full_name       TEXT,
  email           TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL CHECK (role IN ('rider', 'driver', 'admin')) DEFAULT 'rider',
  is_verified     BOOLEAN DEFAULT false,
  is_onboarding_completed BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'es',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Trigger: auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, role)
  VALUES (NEW.id, NEW.phone, COALESCE(NEW.raw_user_meta_data->>'role', 'rider'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**RLS:**
- `SELECT`: propio perfil (rider, driver), todos los perfiles (admin)
- `UPDATE`: propio perfil
- `INSERT`: solo trigger (no público)

### 3.2. driver_locations

```sql
CREATE TABLE public.driver_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  heading         REAL,        -- grados (0-360)
  speed           REAL,        -- km/h
  is_online       BOOLEAN DEFAULT false,
  is_on_ride      BOOLEAN DEFAULT false,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_locations_gist ON public.driver_locations USING GIST (location);
CREATE INDEX idx_driver_locations_online ON public.driver_locations (is_online) WHERE is_online = true AND is_on_ride = false;
```

**RLS:**
- `SELECT`: riders pueden ver conductores online cercanos; drivers solo su propia ubicación
- `UPDATE`: solo propio driver

### 3.3. rides & ride_statuses

```sql
CREATE TYPE ride_status AS ENUM (
  'pending',       -- solicitado, buscando conductor
  'assigned',      -- conductor asignado
  'driver_arrived',-- conductor llegó al origen
  'in_progress',   -- viaje iniciado
  'completed',     -- viaje completado
  'cancelled',     -- cancelado (rider o driver)
  'payment_pending',
  'paid'
);

CREATE TABLE public.rides (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id        UUID NOT NULL REFERENCES public.profiles(id),
  driver_id       UUID REFERENCES public.profiles(id),
  status          ride_status NOT NULL DEFAULT 'pending',
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff_location GEOGRAPHY(POINT, 4326),
  pickup_address  TEXT,
  dropoff_address TEXT,
  estimated_fare  DECIMAL(10,2),
  final_fare      DECIMAL(10,2),
  distance_meters REAL,
  duration_seconds INTEGER,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rides_rider ON public.rides (rider_id, created_at DESC);
CREATE INDEX idx_rides_driver ON public.rides (driver_id, created_at DESC);
CREATE INDEX idx_rides_status ON public.rides (status) WHERE status IN ('pending', 'assigned', 'in_progress');

-- Historial de cambios de estado
CREATE TABLE public.ride_statuses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  status          ride_status NOT NULL,
  changed_by      UUID NOT NULL REFERENCES public.profiles(id),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ride_statuses_ride ON public.ride_statuses (ride_id, created_at);
```

**RLS:**
- `rides`: rider ve sus rides, driver ve rides asignados, admin ve todos
- `ride_statuses`: rider y driver ven historial de su ride

### 3.4. matching_rpc (función atómica)

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
  -- Lock fila para evitar race conditions
  SELECT status INTO v_current_status
  FROM public.rides
  WHERE id = p_ride_id
  FOR UPDATE;

  IF v_current_status != 'pending' THEN
    RETURN FALSE; -- Ya fue tomado por otro driver
  END IF;

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

### 3.5. payments

```sql
CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id),
  rider_id        UUID NOT NULL REFERENCES public.profiles(id),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id),
  amount          DECIMAL(10,2) NOT NULL,
  gateway         TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal', 'wompi', 'cash')),
  gateway_txn_id  TEXT,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))
                  DEFAULT 'pending',
  gateway_fee     DECIMAL(10,2),
  net_amount      DECIMAL(10,2),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_ride ON public.payments (ride_id);
CREATE INDEX idx_payments_rider ON public.payments (rider_id);
```

### 3.6. ratings

```sql
CREATE TABLE public.ratings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL UNIQUE REFERENCES public.rides(id),
  rater_id        UUID NOT NULL REFERENCES public.profiles(id),
  rated_id        UUID NOT NULL REFERENCES public.profiles(id),
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ratings_rated ON public.ratings (rated_id);
```

### 3.7. saved_places

```sql
CREATE TABLE public.saved_places (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,         -- "Casa", "Trabajo"
  address         TEXT NOT NULL,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  place_id        TEXT,                  -- Google Places ID
  icon            TEXT,
  is_favorite     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_places_user ON public.saved_places (user_id);
```

### 3.8. driver_documents

```sql
CREATE TABLE public.driver_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL CHECK (document_type IN ('license', 'identity', 'vehicle_registration', 'insurance', 'photo')),
  status          TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  file_url        TEXT NOT NULL,
  expires_at      DATE,
  reviewed_by     UUID REFERENCES public.profiles(id),
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_documents_driver ON public.driver_documents (driver_id);
```

### 3.9. promotions & promo_redemptions

```sql
CREATE TABLE public.promotions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  DECIMAL(10,2) NOT NULL,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  min_fare        DECIMAL(10,2),
  max_discount    DECIMAL(10,2),
  starts_at       TIMESTAMPTZ NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.promo_redemptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id    UUID NOT NULL REFERENCES public.promotions(id),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  ride_id         UUID REFERENCES public.rides(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(promotion_id, user_id)
);
```

### 3.10. price_estimates

```sql
CREATE TABLE public.price_estimates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff_location GEOGRAPHY(POINT, 4326) NOT NULL,
  distance_meters REAL NOT NULL,
  duration_seconds INTEGER NOT NULL,
  estimated_fare  DECIMAL(10,2) NOT NULL,
  surge_multiplier REAL DEFAULT 1.0,
  currency        TEXT DEFAULT 'USD',
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_price_estimates_expires ON public.price_estimates (expires_at);
```

## 4. PostGIS — Uso en Querys

### Buscar conductores cercanos (usa GIST index)

```sql
SELECT
  dl.driver_id,
  p.full_name,
  ST_Distance(dl.location, ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography) AS distance_meters
FROM public.driver_locations dl
JOIN public.profiles p ON p.id = dl.driver_id
WHERE dl.is_online = true
  AND dl.is_on_ride = false
  AND ST_DWithin(
    dl.location,
    ST_SetSRID(ST_MakePoint($lng, $lat), 4326)::geography,
    $radius_meters
  )
ORDER BY distance_meters ASC;
```

### Calcular distancia entre dos puntos para tarifa

```sql
SELECT ST_Distance(
  (SELECT location FROM public.saved_places WHERE id = $pickup_place_id),
  (SELECT location FROM public.saved_places WHERE id = $dropoff_place_id)
) AS distance_meters;
```

## 5. Migraciones — Convenciones

- Cada migración es **reversible** (contiene `-- DOWN` comment block)
- Nombres: `001_enable_extensions.sql`, `002_create_profiles.sql`, etc.
- RLS habilitado **dentro** de cada migración de tabla
- Los triggers de `auth.users` van en la migración `002_create_profiles`
- PostGIS se usa desde la migración 1; todas las location columns son `GEOGRAPHY(POINT, 4326)`
