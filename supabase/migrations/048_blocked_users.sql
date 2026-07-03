ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS block_reason TEXT,
  ADD COLUMN IF NOT EXISTS unblocked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_blocked ON public.profiles(is_blocked) WHERE is_blocked = true;

CREATE POLICY "profiles_block_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_admin());
