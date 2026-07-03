CREATE TABLE public.rider_sanctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('warning', 'suspension', 'permanent_ban')),
  reason TEXT NOT NULL,
  duration_days INTEGER DEFAULT 0,
  issued_by UUID NOT NULL REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_rider_sanctions_rider ON public.rider_sanctions(rider_id);
CREATE INDEX idx_rider_sanctions_active ON public.rider_sanctions(rider_id) WHERE is_active = true;

ALTER TABLE public.rider_sanctions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rider_sanctions_admin_all" ON public.rider_sanctions
  FOR ALL USING (public.is_admin());

CREATE POLICY "rider_sanctions_select_own" ON public.rider_sanctions
  FOR SELECT USING (rider_id = auth.uid());
