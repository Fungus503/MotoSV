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

ALTER TABLE public.price_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_estimates_insert_authenticated" ON public.price_estimates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "price_estimates_select_authenticated" ON public.price_estimates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Fare calculation function
CREATE OR REPLACE FUNCTION public.calculate_fare(
  p_pickup_lat DOUBLE PRECISION,
  p_pickup_lng DOUBLE PRECISION,
  p_dropoff_lat DOUBLE PRECISION,
  p_dropoff_lng DOUBLE PRECISION
)
RETURNS TABLE (
  distance_meters REAL,
  duration_seconds INTEGER,
  estimated_fare DECIMAL(10,2),
  surge_multiplier REAL
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_distance REAL;
  v_base_fare DECIMAL(10,2) := 1.50;
  v_per_km DECIMAL(10,2) := 0.75;
  v_per_min DECIMAL(10,2) := 0.15;
  v_min_fare DECIMAL(10,2) := 3.00;
  v_surge REAL := 1.0;
BEGIN
  v_distance := ST_Distance(
    ST_SetSRID(ST_MakePoint(p_pickup_lng, p_pickup_lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(p_dropoff_lng, p_dropoff_lat), 4326)::geography
  );

  distance_meters := v_distance;
  duration_seconds := (v_distance / 8.33)::INTEGER;
  estimated_fare := GREATEST(
    v_min_fare,
    v_base_fare + (v_distance / 1000.0) * v_per_km + (duration_seconds / 60.0) * v_per_min
  );
  surge_multiplier := v_surge;

  RETURN NEXT;
END;
$$;

-- DOWN
-- DROP FUNCTION IF EXISTS public.calculate_fare;
-- DROP POLICY IF EXISTS "price_estimates_select_authenticated" ON public.price_estimates;
-- DROP POLICY IF EXISTS "price_estimates_insert_authenticated" ON public.price_estimates;
-- ALTER TABLE public.price_estimates DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_price_estimates_expires;
-- DROP TABLE IF EXISTS public.price_estimates;
