ALTER TABLE public.fleet_managers
  ADD COLUMN IF NOT EXISTS company_email TEXT,
  ADD COLUMN IF NOT EXISTS company_phone TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT;

CREATE TABLE IF NOT EXISTS public.fleet_manager_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fleet_manager_id UUID NOT NULL REFERENCES public.fleet_managers(id) ON DELETE CASCADE,
  driver_vehicle_id UUID NOT NULL REFERENCES public.driver_vehicles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_fleet_mv_manager ON public.fleet_manager_vehicles(fleet_manager_id);

ALTER TABLE public.fleet_manager_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "fleet_mv_admin_all" ON public.fleet_manager_vehicles
  FOR ALL USING (public.is_admin());

CREATE POLICY IF NOT EXISTS "fleet_mv_select_manager" ON public.fleet_manager_vehicles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.fleet_managers fm WHERE fm.id = fleet_manager_id AND fm.user_id = auth.uid())
  );
