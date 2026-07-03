CREATE TABLE public.trip_shares (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  share_code      TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  shared_by       UUID NOT NULL REFERENCES public.profiles(id),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + interval '2 hours',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trip_shares_code ON public.trip_shares (share_code) WHERE is_active = true;

ALTER TABLE public.trip_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trip_shares_insert_own" ON public.trip_shares
  FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "trip_shares_select_own" ON public.trip_shares
  FOR SELECT USING (auth.uid() = shared_by);

CREATE POLICY "trip_shares_select_public" ON public.trip_shares
  FOR SELECT USING (is_active = true AND expires_at > now());

CREATE POLICY "trip_shares_update_own" ON public.trip_shares
  FOR UPDATE USING (auth.uid() = shared_by)
  WITH CHECK (auth.uid() = shared_by);
