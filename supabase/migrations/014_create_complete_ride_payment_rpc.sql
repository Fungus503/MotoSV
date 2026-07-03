CREATE OR REPLACE FUNCTION public.complete_ride_payment(
  p_ride_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.rides
  SET status = 'paid',
      updated_at = now()
  WHERE id = p_ride_id
    AND status = 'payment_pending';

  INSERT INTO public.ride_statuses (ride_id, status, changed_by)
  VALUES (p_ride_id, 'paid', '00000000-0000-0000-0000-000000000000');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_ride_payment FROM PUBLIC, anon;
