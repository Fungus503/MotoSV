CREATE TABLE public.fare_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_fare       DECIMAL(10,2) NOT NULL DEFAULT 1.50,
  per_km          DECIMAL(10,2) NOT NULL DEFAULT 0.75,
  per_min         DECIMAL(10,2) NOT NULL DEFAULT 0.15,
  min_fare        DECIMAL(10,2) NOT NULL DEFAULT 3.00,
  surge_enabled   BOOLEAN DEFAULT false,
  surge_multiplier REAL DEFAULT 1.5,
  updated_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.fare_config (base_fare, per_km, per_min, min_fare) VALUES (1.50, 0.75, 0.15, 3.00);

ALTER TABLE public.fare_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fare_config_select_authenticated" ON public.fare_config
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "fare_config_update_admin" ON public.fare_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION public.get_dashboard_metrics()
RETURNS TABLE (
  rides_today BIGINT,
  revenue_today DECIMAL,
  drivers_online BIGINT,
  active_rides BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  today_start TIMESTAMPTZ := date_trunc('day', now());
BEGIN
  SELECT COUNT(*) INTO rides_today FROM public.rides WHERE created_at >= today_start;
  SELECT COALESCE(SUM(final_fare), 0) INTO revenue_today FROM public.rides WHERE status = 'paid' AND completed_at >= today_start;
  SELECT COUNT(*) INTO drivers_online FROM public.driver_locations WHERE is_online = true AND is_on_ride = false;
  SELECT COUNT(*) INTO active_rides FROM public.rides WHERE status IN ('pending', 'assigned', 'in_progress');
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_weekly_earnings()
RETURNS TABLE (day DATE, amount DECIMAL)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT DATE(completed_at) AS day, COALESCE(SUM(final_fare), 0) AS amount
  FROM public.rides
  WHERE status = 'paid' AND completed_at >= now() - interval '7 days'
  GROUP BY DATE(completed_at)
  ORDER BY day ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_dashboard_metrics FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_weekly_earnings FROM PUBLIC, anon;
