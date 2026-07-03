CREATE TABLE public.vehicle_types (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  icon            TEXT,
  capacity        INTEGER NOT NULL DEFAULT 2,
  luggage_capacity INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.driver_vehicles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type_id UUID NOT NULL REFERENCES public.vehicle_types(id),
  make            TEXT,
  model           TEXT,
  year            INTEGER,
  color           TEXT,
  plate_number    TEXT,
  is_verified     BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_vehicles_driver ON public.driver_vehicles (driver_id);

ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_types_select_active" ON public.vehicle_types
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "vehicle_types_admin_all" ON public.vehicle_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "driver_vehicles_select_own" ON public.driver_vehicles
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "driver_vehicles_insert_own" ON public.driver_vehicles
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "driver_vehicles_update_own" ON public.driver_vehicles
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "driver_vehicles_admin_all" ON public.driver_vehicles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.vehicle_types (name, slug, description, icon, capacity, luggage_capacity) VALUES
  ('Mototaxi', 'mototaxi', 'Mototaxi estándar', '🛵', 2, 1),
  ('Moto', 'moto', 'Motocicleta', '🏍️', 1, 0),
  ('Moto Carga', 'moto-carga', 'Motocicleta con baúl de carga', '📦', 1, 2);
