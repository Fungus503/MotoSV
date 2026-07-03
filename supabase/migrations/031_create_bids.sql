CREATE TABLE public.bids (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_request_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  driver_id       UUID NOT NULL REFERENCES public.profiles(id),
  amount          DECIMAL(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  message         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ride_request_id, driver_id)
);

CREATE INDEX idx_bids_request ON public.bids (ride_request_id, created_at);
CREATE INDEX idx_bids_driver ON public.bids (driver_id, status);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bids_select_driver_own" ON public.bids
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "bids_select_rider" ON public.bids
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ride_requests WHERE id = ride_request_id AND rider_id = auth.uid())
  );

CREATE POLICY "bids_insert_driver" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "bids_update_driver" ON public.bids
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "bids_admin_all" ON public.bids
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
