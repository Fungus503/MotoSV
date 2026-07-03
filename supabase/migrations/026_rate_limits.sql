CREATE TABLE IF NOT EXISTS public.rate_limits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier      TEXT NOT NULL,
  action          TEXT NOT NULL,
  attempts        INTEGER NOT NULL DEFAULT 1,
  window_start    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits (identifier, action, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - (p_window_seconds || ' seconds')::INTERVAL;

  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action
    AND window_start > now() - (p_window_seconds || ' seconds')::INTERVAL;

  IF v_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.rate_limits (identifier, action)
  VALUES (p_identifier, p_action);

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit FROM PUBLIC, anon;
