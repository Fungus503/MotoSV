CREATE TABLE public.saved_places (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  location        GEOGRAPHY(POINT, 4326) NOT NULL,
  place_id        TEXT,
  icon            TEXT,
  is_favorite     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_places_user ON public.saved_places (user_id);

ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_places_select_own" ON public.saved_places
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_places_insert_own" ON public.saved_places
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_places_update_own" ON public.saved_places
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_places_delete_own" ON public.saved_places
  FOR DELETE USING (auth.uid() = user_id);

-- DOWN
-- DROP POLICY IF EXISTS "saved_places_delete_own" ON public.saved_places;
-- DROP POLICY IF EXISTS "saved_places_update_own" ON public.saved_places;
-- DROP POLICY IF EXISTS "saved_places_insert_own" ON public.saved_places;
-- DROP POLICY IF EXISTS "saved_places_select_own" ON public.saved_places;
-- ALTER TABLE public.saved_places DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_saved_places_user;
-- DROP TABLE IF EXISTS public.saved_places;
