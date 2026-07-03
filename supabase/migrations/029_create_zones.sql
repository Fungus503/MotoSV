CREATE TABLE public.zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  boundary        GEOGRAPHY(POLYGON, 4326),
  center          GEOGRAPHY(POINT, 4326),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_zones_boundary ON public.zones USING GIST (boundary);

CREATE TABLE public.zone_vehicle_prices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  service_type_id UUID NOT NULL REFERENCES public.service_types(id) ON DELETE CASCADE,
  base_fare       DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  per_km          DECIMAL(10,2) NOT NULL DEFAULT 0.50,
  per_min         DECIMAL(10,2) NOT NULL DEFAULT 0.10,
  min_fare        DECIMAL(10,2) NOT NULL DEFAULT 3.00,
  surge_multiplier REAL DEFAULT 1.0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(zone_id, service_type_id)
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_vehicle_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "zones_select_active" ON public.zones
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "zones_admin_all" ON public.zones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "zone_prices_select_authenticated" ON public.zone_vehicle_prices
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "zone_prices_admin_all" ON public.zone_vehicle_prices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.zones (name, slug, description, center) VALUES
  ('San Salvador Centro', 'san-salvador-centro', 'Zona centro de San Salvador', ST_SetSRID(ST_MakePoint(-89.2185, 13.6989), 4326)::geography),
  ('San Salvador Este', 'san-salvador-este', 'Zona este de San Salvador', ST_SetSRID(ST_MakePoint(-89.1667, 13.7000), 4326)::geography),
  ('Santa Tecla', 'santa-tecla', 'Municipio de Santa Tecla', ST_SetSRID(ST_MakePoint(-89.2796, 13.6769), 4326)::geography),
  ('Antiguo Cuscatlán', 'antiguo-cuscatlan', 'Municipio de Antiguo Cuscatlán', ST_SetSRID(ST_MakePoint(-89.2500, 13.6833), 4326)::geography);
