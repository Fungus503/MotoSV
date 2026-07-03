CREATE OR REPLACE FUNCTION public.match_driver(
  p_ride_id UUID,
  p_driver_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_current_status public.ride_status;
BEGIN
  SELECT status INTO v_current_status
  FROM public.rides
  WHERE id = p_ride_id
  FOR UPDATE;

  IF v_current_status IS NULL OR v_current_status != 'pending' THEN
    RETURN FALSE;
  END IF;

  UPDATE public.rides
  SET status = 'assigned',
      driver_id = p_driver_id,
      updated_at = now()
  WHERE id = p_ride_id;

  INSERT INTO public.ride_statuses (ride_id, status, changed_by)
  VALUES (p_ride_id, 'assigned', p_driver_id);

  UPDATE public.driver_locations
  SET is_on_ride = true
  WHERE driver_id = p_driver_id;

  RETURN TRUE;
END;
$$;

-- DOWN
-- DROP FUNCTION IF EXISTS public.match_driver;
