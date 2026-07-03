ALTER TABLE public.rate_limits
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_admin ON public.rate_limits(admin_id) WHERE admin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rate_limits_action_identifier ON public.rate_limits(action, identifier);

CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  p_admin_id UUID,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - (p_window_seconds || ' seconds')::interval;

  SELECT attempts INTO v_attempts
  FROM public.rate_limits
  WHERE admin_id = p_admin_id AND action = p_action
  AND window_start > now() - (p_window_seconds || ' seconds')::interval
  ORDER BY window_start DESC LIMIT 1;

  IF v_attempts IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, attempts, ip_address, admin_id, window_start)
    VALUES (p_admin_id::TEXT, p_action, 1, inet_client_addr()::TEXT, p_admin_id, now());
    RETURN true;
  ELSIF v_attempts < p_max_attempts THEN
    UPDATE public.rate_limits SET attempts = attempts + 1
    WHERE admin_id = p_admin_id AND action = p_action
    AND window_start > now() - (p_window_seconds || ' seconds')::interval;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_admin_rate_limit FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_admin_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit TO authenticated;
