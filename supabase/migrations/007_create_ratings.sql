CREATE TABLE public.ratings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL UNIQUE REFERENCES public.rides(id),
  rater_id        UUID NOT NULL REFERENCES public.profiles(id),
  rated_id        UUID NOT NULL REFERENCES public.profiles(id),
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ratings_rated ON public.ratings (rated_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select_own" ON public.ratings
  FOR SELECT USING (auth.uid() = rater_id OR auth.uid() = rated_id);

CREATE POLICY "ratings_select_admin" ON public.ratings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "ratings_insert_participant" ON public.ratings
  FOR INSERT WITH CHECK (
    auth.uid() = rater_id AND
    auth.uid() != rated_id AND
    EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );

-- DOWN
-- DROP POLICY IF EXISTS "ratings_insert_participant" ON public.ratings;
-- DROP POLICY IF EXISTS "ratings_select_admin" ON public.ratings;
-- DROP POLICY IF EXISTS "ratings_select_own" ON public.ratings;
-- ALTER TABLE public.ratings DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_ratings_rated;
-- DROP TABLE IF EXISTS public.ratings;
