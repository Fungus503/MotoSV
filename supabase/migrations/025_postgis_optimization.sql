CREATE INDEX IF NOT EXISTS idx_driver_locations_online_covering
  ON public.driver_locations (is_online, is_on_ride)
  INCLUDE (driver_id, location, heading)
  WHERE is_online = true AND is_on_ride = false;

ANALYZE public.driver_locations;
