CREATE TABLE public.driver_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'ride' CHECK (type IN ('ride', 'bonus', 'adjustment', 'referral')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.driver_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'bank' CHECK (method IN ('bank', 'wallet', 'cash', 'stripe', 'paypal')),
  account_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'failed', 'cancelled')),
  admin_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_earnings_driver ON public.driver_earnings(driver_id, created_at DESC);
CREATE INDEX idx_driver_earnings_ride ON public.driver_earnings(ride_id);
CREATE INDEX idx_driver_payouts_driver ON public.driver_payouts(driver_id);
CREATE INDEX idx_driver_payouts_status ON public.driver_payouts(status);

ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_earnings_select_driver" ON public.driver_earnings
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "driver_earnings_admin_all" ON public.driver_earnings
  FOR ALL USING (public.is_admin());

CREATE POLICY "driver_payouts_select_driver" ON public.driver_payouts
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "driver_payouts_admin_all" ON public.driver_payouts
  FOR ALL USING (public.is_admin());
