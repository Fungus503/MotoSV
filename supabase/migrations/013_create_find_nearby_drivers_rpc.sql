CREATE OR REPLACE FUNCTION public.find_nearby_drivers(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 3000
)
RETURNS TABLE (
  driver_id UUID,
  full_name TEXT,
  distance_meters DOUBLE PRECISION,
  heading REAL
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dl.driver_id,
    p.full_name,
    ST_Distance(
      dl.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_meters,
    dl.heading
  FROM public.driver_locations dl
  JOIN public.profiles p ON p.id = dl.driver_id
  WHERE dl.is_online = true
    AND dl.is_on_ride = false
    AND ST_DWithin(
      dl.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.find_nearby_drivers FROM PUBLIC, anon;
