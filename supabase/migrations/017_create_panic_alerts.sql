CREATE TABLE public.panic_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reporter_id     UUID NOT NULL REFERENCES public.profiles(id),
  alert_type      TEXT NOT NULL CHECK (alert_type IN ('emergency', 'accident', 'harassment', 'other')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  location        GEOGRAPHY(POINT, 4326),
  notes           TEXT,
  resolved_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_panic_alerts_status ON public.panic_alerts (status) WHERE status = 'active';

ALTER TABLE public.panic_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "panic_alerts_insert_participant" ON public.panic_alerts
  FOR INSERT WITH CHECK (
    auth.uid() = reporter_id AND
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid()))
  );

CREATE POLICY "panic_alerts_select_own" ON public.panic_alerts
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "panic_alerts_select_admin" ON public.panic_alerts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "panic_alerts_update_admin" ON public.panic_alerts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION public.handle_panic_alert_updated()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_panic_alert_updated
  BEFORE UPDATE ON public.panic_alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_panic_alert_updated();
