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
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN;
  END IF;
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
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT DATE(completed_at) AS day, COALESCE(SUM(final_fare), 0) AS amount
  FROM public.rides
  WHERE status = 'paid' AND completed_at >= now() - interval '7 days'
  GROUP BY DATE(completed_at)
  ORDER BY day ASC;
END;
$$;
