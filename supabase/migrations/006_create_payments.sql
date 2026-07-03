CREATE TABLE public.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id),
  rider_id        UUID NOT NULL REFERENCES public.profiles(id),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id),
  amount          DECIMAL(10,2) NOT NULL,
  gateway         TEXT NOT NULL CHECK (gateway IN ('stripe', 'paypal', 'wompi', 'cash')),
  gateway_txn_id  TEXT,
  status          TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'))
                  DEFAULT 'pending',
  gateway_fee     DECIMAL(10,2),
  net_amount      DECIMAL(10,2),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_ride ON public.payments (ride_id);
CREATE INDEX idx_payments_rider ON public.payments (rider_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_rider" ON public.payments
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "payments_select_driver" ON public.payments
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "payments_select_admin" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "payments_insert_system" ON public.payments
  FOR INSERT WITH CHECK (
    auth.uid() = rider_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DOWN
-- DROP POLICY IF EXISTS "payments_insert_system" ON public.payments;
-- DROP POLICY IF EXISTS "payments_select_admin" ON public.payments;
-- DROP POLICY IF EXISTS "payments_select_driver" ON public.payments;
-- DROP POLICY IF EXISTS "payments_select_rider" ON public.payments;
-- ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_payments_rider;
-- DROP INDEX IF EXISTS idx_payments_ride;
-- DROP TABLE IF EXISTS public.payments;
