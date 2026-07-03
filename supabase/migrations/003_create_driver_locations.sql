CREATE TABLE public.driver_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  heading         REAL,
  speed           REAL,
  is_online       BOOLEAN DEFAULT false,
  is_on_ride      BOOLEAN DEFAULT false,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_locations_gist ON public.driver_locations USING GIST (location);
CREATE INDEX idx_driver_locations_online ON public.driver_locations (is_online) WHERE is_online = true AND is_on_ride = false;

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_locations_select_riders" ON public.driver_locations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'rider')
  );

CREATE POLICY "driver_locations_select_own" ON public.driver_locations
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "driver_locations_update_own" ON public.driver_locations
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "driver_locations_insert_own" ON public.driver_locations
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- DOWN
-- DROP POLICY IF EXISTS "driver_locations_insert_own" ON public.driver_locations;
-- DROP POLICY IF EXISTS "driver_locations_update_own" ON public.driver_locations;
-- DROP POLICY IF EXISTS "driver_locations_select_own" ON public.driver_locations;
-- DROP POLICY IF EXISTS "driver_locations_select_riders" ON public.driver_locations;
-- ALTER TABLE public.driver_locations DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_driver_locations_online;
-- DROP INDEX IF EXISTS idx_driver_locations_gist;
-- DROP TABLE IF EXISTS public.driver_locations;
