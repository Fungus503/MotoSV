-- =============================================
-- Migration 037: Complete remaining modules
-- =============================================

-- 1. DRIVER RULES
CREATE TABLE public.driver_rules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.driver_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_rules_admin_all" ON public.driver_rules FOR ALL USING (public.is_admin());

-- 2. NOTICES
CREATE TABLE public.notices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  content         TEXT,
  target_role     TEXT DEFAULT 'driver' CHECK (target_role IN ('driver', 'rider', 'both')),
  is_active       BOOLEAN DEFAULT true,
  starts_at       TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notices_admin_all" ON public.notices FOR ALL USING (public.is_admin());
CREATE POLICY "notices_select_active" ON public.notices FOR SELECT USING (is_active = true AND starts_at <= now() AND (expires_at IS NULL OR expires_at > now()));

-- 3. COMMISSIONS
CREATE TABLE public.commissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID REFERENCES public.rides(id) ON DELETE SET NULL,
  driver_id       UUID REFERENCES public.profiles(id),
  amount          DECIMAL(10,2) NOT NULL,
  commission_pct  DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_commissions_driver ON public.commissions (driver_id, created_at DESC);
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "commissions_admin_all" ON public.commissions FOR ALL USING (public.is_admin());

-- 4. WITHDRAW REQUESTS
CREATE TABLE public.withdraw_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id),
  amount          DECIMAL(10,2) NOT NULL,
  gateway         TEXT DEFAULT 'bank' CHECK (gateway IN ('bank', 'stripe', 'paypal', 'cash')),
  account_details TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reviewed_by     UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_withdraw_requests_user ON public.withdraw_requests (user_id, created_at DESC);
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "withdraw_requests_admin_all" ON public.withdraw_requests FOR ALL USING (public.is_admin());
CREATE POLICY "withdraw_requests_select_own" ON public.withdraw_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "withdraw_requests_insert_own" ON public.withdraw_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. PEAK ZONES
CREATE TABLE public.peak_zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id         UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  days_of_week    INTEGER[] DEFAULT '{1,2,3,4,5}'::INTEGER[],
  surge_multiplier REAL NOT NULL DEFAULT 1.5,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.peak_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "peak_zones_admin_all" ON public.peak_zones FOR ALL USING (public.is_admin());
CREATE POLICY "peak_zones_select_active" ON public.peak_zones FOR SELECT USING (is_active = true);

-- 6. DISPATCHERS
CREATE TABLE public.dispatchers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dispatchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dispatchers_admin_all" ON public.dispatchers FOR ALL USING (public.is_admin());

-- 7. FLEET MANAGERS
CREATE TABLE public.fleet_managers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name    TEXT,
  phone           TEXT,
  is_verified     BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.fleet_managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fleet_managers_admin_all" ON public.fleet_managers FOR ALL USING (public.is_admin());

-- 8. FLEET VEHICLES
CREATE TABLE public.fleet_vehicles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fleet_manager_id UUID NOT NULL REFERENCES public.fleet_managers(id) ON DELETE CASCADE,
  vehicle_type_id UUID REFERENCES public.vehicle_types(id),
  make            TEXT,
  model           TEXT,
  year            INTEGER,
  color           TEXT,
  plate_number    TEXT,
  capacity        INTEGER DEFAULT 2,
  is_verified     BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_fleet_vehicles_manager ON public.fleet_vehicles (fleet_manager_id);
ALTER TABLE public.fleet_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fleet_vehicles_admin_all" ON public.fleet_vehicles FOR ALL USING (public.is_admin());

-- 9. SUBSCRIPTIONS + PLANS
CREATE TABLE public.plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  price           DECIMAL(10,2) NOT NULL,
  duration_days   INTEGER NOT NULL DEFAULT 30,
  max_rides       INTEGER,
  commission_pct  DECIMAL(5,2) DEFAULT 15.00,
  features        JSONB,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_admin_all" ON public.plans FOR ALL USING (public.is_admin());
CREATE POLICY "plans_select_active" ON public.plans FOR SELECT USING (is_active = true);

CREATE TABLE public.driver_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id         UUID NOT NULL REFERENCES public.plans(id),
  starts_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  payment_id      UUID REFERENCES public.payments(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_driver_subscriptions_driver ON public.driver_subscriptions (driver_id, status);
ALTER TABLE public.driver_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver_subscriptions_admin_all" ON public.driver_subscriptions FOR ALL USING (public.is_admin());

-- 10. EXTRA CHARGES
CREATE TABLE public.extra_charges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  amount          DECIMAL(10,2) NOT NULL,
  charge_type     TEXT NOT NULL DEFAULT 'fixed' CHECK (charge_type IN ('fixed', 'percentage')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.extra_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "extra_charges_admin_all" ON public.extra_charges FOR ALL USING (public.is_admin());

-- 11. SUPPORT TICKETS
CREATE TABLE public.ticket_departments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ticket_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_departments_admin_all" ON public.ticket_departments FOR ALL USING (public.is_admin());
CREATE POLICY "ticket_departments_select_active" ON public.ticket_departments FOR SELECT USING (is_active = true);

CREATE TABLE public.ticket_priorities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  color           TEXT DEFAULT '#6b7280',
  response_time_hours INTEGER,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ticket_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_priorities_admin_all" ON public.ticket_priorities FOR ALL USING (public.is_admin());

CREATE TABLE public.ticket_statuses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  color           TEXT DEFAULT '#6b7280',
  is_closed       BOOLEAN DEFAULT false,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ticket_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_statuses_admin_all" ON public.ticket_statuses FOR ALL USING (public.is_admin());

CREATE TABLE public.tickets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number   TEXT UNIQUE NOT NULL DEFAULT 'TKT-' || upper(substr(md5(random()::text), 1, 8)),
  user_id         UUID REFERENCES public.profiles(id),
  department_id   UUID REFERENCES public.ticket_departments(id),
  priority_id     UUID REFERENCES public.ticket_priorities(id),
  status_id       UUID REFERENCES public.ticket_statuses(id),
  subject         TEXT NOT NULL,
  description     TEXT,
  assigned_to     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_tickets_user ON public.tickets (user_id, created_at DESC);
CREATE INDEX idx_tickets_status ON public.tickets (status_id);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_admin_all" ON public.tickets FOR ALL USING (public.is_admin());
CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ticket_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id       UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id),
  message         TEXT NOT NULL,
  attachments     JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_ticket_messages ON public.ticket_messages (ticket_id, created_at);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_messages_admin_all" ON public.ticket_messages FOR ALL USING (public.is_admin());
CREATE POLICY "ticket_messages_insert_participant" ON public.ticket_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND (user_id = auth.uid() OR assigned_to = auth.uid()))
);

-- 12. KNOWLEDGE BASE
CREATE TABLE public.knowledge_base (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         TEXT,
  category        TEXT DEFAULT 'general',
  tags            TEXT[],
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_base_admin_all" ON public.knowledge_base FOR ALL USING (public.is_admin());
CREATE POLICY "knowledge_base_select_published" ON public.knowledge_base FOR SELECT USING (is_published = true);

-- Seed data
INSERT INTO public.plans (name, slug, description, price, duration_days, max_rides, commission_pct, features) VALUES
  ('Básico', 'basico', 'Plan básico para conductores', 0, 30, 50, 20.00, '["Viajes ilimitados", "Comisión 20%"]'::jsonb),
  ('Premium', 'premium', 'Plan premium con menos comisión', 19.99, 30, NULL, 10.00, '["Viajes ilimitados", "Comisión 10%", "Soporte prioritario"]'::jsonb),
  ('Pro', 'pro', 'Plan profesional', 49.99, 30, NULL, 5.00, '["Viajes ilimitados", "Comisión 5%", "Soporte prioritario", "Estadísticas avanzadas"]'::jsonb);

INSERT INTO public.ticket_departments (name, slug, description) VALUES
  ('Soporte Técnico', 'soporte-tecnico', 'Problemas técnicos con la app'),
  ('Facturación', 'facturacion', 'Problemas de pago y facturación'),
  ('Conductores', 'conductores', 'Asuntos relacionados con conductores'),
  ('General', 'general', 'Consultas generales');

INSERT INTO public.ticket_priorities (name, slug, color, response_time_hours, sort_order) VALUES
  ('Baja', 'baja', '#6b7280', 48, 1),
  ('Normal', 'normal', '#3b82f6', 24, 2),
  ('Alta', 'alta', '#f59e0b', 8, 3),
  ('Urgente', 'urgente', '#ef4444', 2, 4);

INSERT INTO public.ticket_statuses (name, slug, color, is_closed, sort_order) VALUES
  ('Abierto', 'abierto', '#3b82f6', false, 1),
  ('En Progreso', 'en-progreso', '#f59e0b', false, 2),
  ('Esperando Respuesta', 'esperando-respuesta', '#8b5cf6', false, 3),
  ('Resuelto', 'resuelto', '#10b981', true, 4),
  ('Cerrado', 'cerrado', '#6b7280', true, 5);

INSERT INTO public.extra_charges (name, slug, description, amount, charge_type) VALUES
  ('Espera por minuto', 'espera', 'Cargo por minuto de espera', 0.10, 'fixed'),
  ('Noche (22:00-6:00)', 'nocturno', 'Recargo nocturno', 25.00, 'percentage'),
  ('Maleta extra', 'maleta', 'Cargo por maleta adicional', 1.00, 'fixed'),
  ('Aeropuerto', 'aeropuerto', 'Recargo por recogida en aeropuerto', 3.00, 'fixed');
