-- Fix: Ensure public.is_admin() function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Add missing user-level policies for 8 tables

-- 1. commissions: drivers need to see their own
CREATE POLICY "commissions_select_driver" ON public.commissions
  FOR SELECT USING (auth.uid() = driver_id);

-- 2. driver_subscriptions: drivers need to see their own
CREATE POLICY "driver_subscriptions_select_own" ON public.driver_subscriptions
  FOR SELECT USING (auth.uid() = driver_id);

-- 3. dispatchers: dispatchers need to see their own profile
CREATE POLICY "dispatchers_select_own" ON public.dispatchers
  FOR SELECT USING (auth.uid() = user_id);

-- 4. fleet_managers: fleet managers need to see their own profile
CREATE POLICY "fleet_managers_select_own" ON public.fleet_managers
  FOR SELECT USING (auth.uid() = user_id);

-- 5. fleet_vehicles: fleet managers need to see their fleet's vehicles
CREATE POLICY "fleet_vehicles_select_manager" ON public.fleet_vehicles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.fleet_managers WHERE id = fleet_manager_id AND user_id = auth.uid())
  );

-- 6. extra_charges: authenticated users can read active charges
CREATE POLICY "extra_charges_select_active" ON public.extra_charges
  FOR SELECT USING (is_active = true);

-- 7. ticket_priorities: all authenticated users can read
CREATE POLICY "ticket_priorities_select_all" ON public.ticket_priorities
  FOR SELECT USING (auth.role() = 'authenticated');

-- 8. ticket_statuses: all authenticated users can read
CREATE POLICY "ticket_statuses_select_all" ON public.ticket_statuses
  FOR SELECT USING (auth.role() = 'authenticated');
