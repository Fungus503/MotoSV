CREATE TABLE public.promotions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  DECIMAL(10,2) NOT NULL,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  min_fare        DECIMAL(10,2),
  max_discount    DECIMAL(10,2),
  starts_at       TIMESTAMPTZ NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.promo_redemptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id    UUID NOT NULL REFERENCES public.promotions(id),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  ride_id         UUID REFERENCES public.rides(id),
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(promotion_id, user_id)
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_select_active" ON public.promotions
  FOR SELECT USING (is_active = true AND starts_at <= now() AND expires_at > now());

CREATE POLICY "promotions_select_admin" ON public.promotions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "promotions_insert_admin" ON public.promotions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "promotions_update_admin" ON public.promotions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "promo_redemptions_select_own" ON public.promo_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "promo_redemptions_insert_own" ON public.promo_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DOWN
-- DROP POLICY IF EXISTS "promo_redemptions_insert_own" ON public.promo_redemptions;
-- DROP POLICY IF EXISTS "promo_redemptions_select_own" ON public.promo_redemptions;
-- ALTER TABLE public.promo_redemptions DISABLE ROW LEVEL SECURITY;
-- DROP TABLE IF EXISTS public.promo_redemptions;
-- DROP POLICY IF EXISTS "promotions_update_admin" ON public.promotions;
-- DROP POLICY IF EXISTS "promotions_insert_admin" ON public.promotions;
-- DROP POLICY IF EXISTS "promotions_select_admin" ON public.promotions;
-- DROP POLICY IF EXISTS "promotions_select_active" ON public.promotions;
-- ALTER TABLE public.promotions DISABLE ROW LEVEL SECURITY;
-- DROP TABLE IF EXISTS public.promotions;
