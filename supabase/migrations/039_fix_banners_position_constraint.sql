ALTER TABLE public.banners DROP CONSTRAINT IF EXISTS banners_position_check;
ALTER TABLE public.banners ADD CONSTRAINT banners_position_check CHECK (position IN ('home', 'services', 'promotions', 'onboarding'));
