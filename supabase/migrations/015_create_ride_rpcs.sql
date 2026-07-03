CREATE OR REPLACE FUNCTION public.request_ride(
  p_pickup_lat DOUBLE PRECISION,
  p_pickup_lng DOUBLE PRECISION,
  p_dropoff_lat DOUBLE PRECISION,
  p_dropoff_lng DOUBLE PRECISION,
  p_pickup_address TEXT,
  p_dropoff_address TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_ride_id UUID;
BEGIN
  INSERT INTO public.rides (rider_id, pickup_location, dropoff_location, pickup_address, dropoff_address)
  VALUES (
    auth.uid(),
    ST_SetSRID(ST_MakePoint(p_pickup_lng, p_pickup_lat), 4326)::geography,
    ST_SetSRID(ST_MakePoint(p_dropoff_lng, p_dropoff_lat), 4326)::geography,
    p_pickup_address,
    p_dropoff_address
  )
  RETURNING id INTO v_ride_id;

  INSERT INTO public.ride_statuses (ride_id, status, changed_by)
  VALUES (v_ride_id, 'pending', auth.uid());

  RETURN v_ride_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_ride(
  p_ride_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.rides
  SET status = 'cancelled', cancelled_at = now(), cancel_reason = p_reason, updated_at = now()
  WHERE id = p_ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid());

  INSERT INTO public.ride_statuses (ride_id, status, changed_by, metadata)
  VALUES (p_ride_id, 'cancelled', auth.uid(), jsonb_build_object('reason', p_reason));
END;
$$;

CREATE OR REPLACE FUNCTION public.start_ride(p_ride_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.rides
  SET status = 'in_progress', started_at = now(), updated_at = now()
  WHERE id = p_ride_id AND driver_id = auth.uid() AND status = 'assigned';

  INSERT INTO public.ride_statuses (ride_id, status, changed_by)
  VALUES (p_ride_id, 'in_progress', auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_ride(
  p_ride_id UUID,
  p_final_fare DECIMAL,
  p_distance_meters REAL,
  p_duration_seconds INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.rides
  SET status = 'payment_pending', final_fare = p_final_fare,
      distance_meters = p_distance_meters, duration_seconds = p_duration_seconds,
      completed_at = now(), updated_at = now()
  WHERE id = p_ride_id AND driver_id = auth.uid() AND status = 'in_progress';

  INSERT INTO public.ride_statuses (ride_id, status, changed_by, metadata)
  VALUES (p_ride_id, 'payment_pending', auth.uid(),
    jsonb_build_object('final_fare', p_final_fare, 'distance', p_distance_meters, 'duration', p_duration_seconds));
END;
$$;

CREATE OR REPLACE FUNCTION public.rate_ride(
  p_ride_id UUID,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_rider_id UUID;
  v_driver_id UUID;
BEGIN
  SELECT rider_id, driver_id INTO v_rider_id, v_driver_id
  FROM public.rides WHERE id = p_ride_id;

  INSERT INTO public.ratings (ride_id, rater_id, rated_id, rating, comment)
  VALUES (p_ride_id, auth.uid(),
    CASE WHEN auth.uid() = v_rider_id THEN v_driver_id ELSE v_rider_id END,
    p_rating, p_comment);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_driver_location(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_heading REAL DEFAULT NULL,
  p_speed REAL DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.driver_locations (driver_id, location, heading, speed, is_online)
  VALUES (auth.uid(), ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography, p_heading, p_speed, true)
  ON CONFLICT (driver_id)
  DO UPDATE SET location = ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
               heading = COALESCE(p_heading, driver_locations.heading),
               speed = COALESCE(p_speed, driver_locations.speed),
               is_online = true,
               updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.set_driver_online(p_is_online BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.driver_locations
  SET is_online = p_is_online, updated_at = now()
  WHERE driver_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.create_payment_intent(
  p_ride_id UUID,
  p_gateway TEXT,
  p_amount DECIMAL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_rider_id UUID;
  v_driver_id UUID;
  v_txn_id TEXT;
BEGIN
  SELECT rider_id, driver_id INTO v_rider_id, v_driver_id
  FROM public.rides WHERE id = p_ride_id;

  v_txn_id := uuid_generate_v4()::TEXT;

  INSERT INTO public.payments (ride_id, rider_id, driver_id, amount, gateway, gateway_txn_id, status)
  VALUES (p_ride_id, v_rider_id, v_driver_id, p_amount, p_gateway, v_txn_id, 'processing');

  RETURN v_txn_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.request_ride FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_ride FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.start_ride FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.complete_ride FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.rate_ride FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_driver_location FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_driver_online FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_payment_intent FROM PUBLIC, anon;
