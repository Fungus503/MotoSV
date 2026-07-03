CREATE TABLE public.service_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  icon            TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.service_types (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id     UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  icon            TEXT,
  base_fare       DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  per_km          DECIMAL(10,2) NOT NULL DEFAULT 0.50,
  per_min         DECIMAL(10,2) NOT NULL DEFAULT 0.10,
  min_fare        DECIMAL(10,2) NOT NULL DEFAULT 3.00,
  capacity        INTEGER NOT NULL DEFAULT 2,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_select_active" ON public.service_categories
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "service_types_select_active" ON public.service_types
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "service_categories_admin_all" ON public.service_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "service_types_admin_all" ON public.service_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.service_categories (name, slug, description, icon, sort_order) VALUES
  ('Viaje', 'ride', 'Transporte de pasajeros punto a punto', '🚕', 1),
  ('Envío', 'parcel', 'Envío de paquetes y documentos', '📦', 2),
  ('Alquiler', 'rental', 'Alquiler de mototaxi por horas', '🛵', 3);

INSERT INTO public.service_types (category_id, name, slug, description, icon, base_fare, per_km, per_min, min_fare, capacity, sort_order)
SELECT c.id, 'Mototaxi', 'mototaxi', 'Viaje en mototaxi', '🛵', 1.50, 0.75, 0.15, 3.00, 2, 1
FROM public.service_categories c WHERE c.slug = 'ride';

INSERT INTO public.service_types (category_id, name, slug, description, icon, base_fare, per_km, per_min, min_fare, capacity, sort_order)
SELECT c.id, 'Moto', 'moto', 'Viaje rápido en moto', '🏍️', 1.00, 0.50, 0.10, 2.00, 1, 2
FROM public.service_categories c WHERE c.slug = 'ride';

INSERT INTO public.service_types (category_id, name, slug, description, icon, base_fare, per_km, per_min, min_fare, capacity, sort_order)
SELECT c.id, 'Paquete', 'paquete', 'Envío de paquetes', '📦', 2.00, 0.30, 0.00, 3.00, 0, 1
FROM public.service_categories c WHERE c.slug = 'parcel';

INSERT INTO public.service_types (category_id, name, slug, description, icon, base_fare, per_km, per_min, min_fare, capacity, sort_order)
SELECT c.id, 'Alquiler por hora', 'rental', 'Alquiler con tarifa por hora', '🛵', 5.00, 0.00, 0.00, 5.00, 2, 1
FROM public.service_categories c WHERE c.slug = 'rental';
