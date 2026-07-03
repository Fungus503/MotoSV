CREATE OR REPLACE FUNCTION public.get_zones_with_coords()
RETURNS TABLE (id UUID, name TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT z.id, z.name, ST_Y(z.center::geometry) AS lat, ST_X(z.center::geometry) AS lng
  FROM public.zones z
  WHERE z.center IS NOT NULL
  ORDER BY z.name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_zones_with_coords FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_zones_with_coords TO authenticated;
