CREATE TABLE public.pages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         TEXT,
  meta_description TEXT,
  is_published    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.blogs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         TEXT,
  excerpt         TEXT,
  featured_image  TEXT,
  category        TEXT DEFAULT 'general',
  tags            TEXT[],
  author_id       UUID REFERENCES public.profiles(id),
  is_published    BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.app_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT UNIQUE NOT NULL,
  value           TEXT,
  type            TEXT DEFAULT 'text' CHECK (type IN ('text', 'boolean', 'number', 'json', 'image')),
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.cancellation_reasons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reason          TEXT NOT NULL,
  applies_to      TEXT NOT NULL DEFAULT 'both' CHECK (applies_to IN ('rider', 'driver', 'both')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.testimonials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  role            TEXT DEFAULT 'rider',
  content         TEXT NOT NULL,
  avatar_url      TEXT,
  rating          SMALLINT CHECK (rating >= 1 AND rating <= 5),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.banners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  image_url       TEXT NOT NULL,
  link_url        TEXT,
  position        TEXT DEFAULT 'home' CHECK (position IN ('home', 'services', 'promotions')),
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  starts_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.privacy_policy (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content         TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_admin_all" ON public.pages FOR ALL USING (public.is_admin());
CREATE POLICY "blogs_admin_all" ON public.blogs FOR ALL USING (public.is_admin());
CREATE POLICY "app_settings_admin_all" ON public.app_settings FOR ALL USING (public.is_admin());
CREATE POLICY "cancellation_reasons_admin_all" ON public.cancellation_reasons FOR ALL USING (public.is_admin());
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "banners_admin_all" ON public.banners FOR ALL USING (public.is_admin());
CREATE POLICY "privacy_policy_admin_all" ON public.privacy_policy FOR ALL USING (public.is_admin());

CREATE POLICY "pages_select_published" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "blogs_select_published" ON public.blogs FOR SELECT USING (is_published = true);
CREATE POLICY "app_settings_select_authenticated" ON public.app_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cancellation_reasons_select_authenticated" ON public.cancellation_reasons FOR SELECT USING (is_active = true);
CREATE POLICY "testimonials_select_active" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "banners_select_active" ON public.banners FOR SELECT USING (is_active = true AND starts_at <= now() AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "privacy_policy_select_authenticated" ON public.privacy_policy FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO public.app_settings (key, value, type, description) VALUES
  ('app_name', 'MotoSV', 'text', 'Application name'),
  ('app_version', '1.0.0', 'text', 'Current version'),
  ('currency', 'USD', 'text', 'Default currency'),
  ('phone_code', '+503', 'text', 'Country phone code'),
  ('max_cancellation_time_min', '5', 'number', 'Max minutes to cancel before penalty'),
  ('referral_bonus', '1.00', 'number', 'Referral bonus amount'),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode');

INSERT INTO public.cancellation_reasons (reason, applies_to) VALUES
  ('El conductor no llegó', 'rider'),
  ('Cambié de opinión', 'rider'),
  ('El pasajero no llegó', 'driver'),
  ('Demasiado tiempo de espera', 'both'),
  ('Otro motivo', 'both');
