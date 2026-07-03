-- Seed data for development

-- Create demo auth users first via Supabase Auth API (run manually):
-- 1. rider-demo@motosv.dev / rider123 (role: rider)
-- 2. driver-demo@motosv.dev / driver123 (role: driver)
-- 3. admin-demo@motosv.dev / admin123 (role: admin)

-- Profiles (run AFTER auth users are created via trigger)
INSERT INTO public.profiles (id, phone, full_name, email, role, is_verified, is_onboarding_completed)
VALUES
  ('00000000-0000-0000-0000-000000000001', '+50370000001', 'Carlos Martínez', 'rider-demo@motosv.dev', 'rider', true, true),
  ('00000000-0000-0000-0000-000000000002', '+50370000002', 'María Hernández', 'driver-demo@motosv.dev', 'driver', true, true),
  ('00000000-0000-0000-0000-000000000003', '+50370000003', 'Admin MotoSV', 'admin-demo@motosv.dev', 'admin', true, true)
ON CONFLICT (id) DO NOTHING;

-- Driver locations (San Salvador Centro Histórico area)
INSERT INTO public.driver_locations (driver_id, location, heading, speed, is_online, is_on_ride)
VALUES
  ('00000000-0000-0000-0000-000000000002',
   ST_SetSRID(ST_MakePoint(-89.1895, 13.6989), 4326)::geography,
   180, 0, true, false)
ON CONFLICT (driver_id) DO NOTHING;

-- Saved places for demo rider
INSERT INTO public.saved_places (user_id, name, address, location, place_id, is_favorite)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Casa',
   'Colonia Escalón, Calle El Pedregal #15, San Salvador',
   ST_SetSRID(ST_MakePoint(-89.2245, 13.7012), 4326)::geography,
   'ChIJFxxxxxxxxxxxxxxxxxxx', true),

  ('00000000-0000-0000-0000-000000000001', 'Trabajo',
   'Centro Comercial Galerías, San Salvador',
   ST_SetSRID(ST_MakePoint(-89.2345, 13.6912), 4326)::geography,
   'ChIJGxxxxxxxxxxxxxxxxxxx', false);

-- Active promotion
INSERT INTO public.promotions (code, description, discount_type, discount_value, max_redemptions, min_fare, max_discount, starts_at, expires_at)
VALUES
  ('BIENVENIDO10', '10% de descuento en tu primer viaje', 'percentage', 10.00, 1000, 3.00, 5.00,
   now() - interval '1 day', now() + interval '30 days');
