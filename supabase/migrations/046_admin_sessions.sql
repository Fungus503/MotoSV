CREATE TABLE public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  auth_method TEXT DEFAULT 'email' CHECK (auth_method IN ('email', 'otp', 'google', 'apple')),
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_active ON public.admin_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_admin_sessions_expires ON public.admin_sessions(expires_at);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_sessions_select_own" ON public.admin_sessions
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "admin_sessions_select_admin" ON public.admin_sessions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin_sessions_insert_system" ON public.admin_sessions
  FOR INSERT WITH CHECK (admin_id = auth.uid());

CREATE POLICY "admin_sessions_update_admin" ON public.admin_sessions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "admin_sessions_delete_admin" ON public.admin_sessions
  FOR DELETE USING (public.is_admin());
