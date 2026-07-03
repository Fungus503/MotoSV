CREATE TABLE public.driver_documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type   TEXT NOT NULL CHECK (document_type IN ('license', 'identity', 'vehicle_registration', 'insurance', 'photo')),
  status          TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  file_url        TEXT NOT NULL,
  expires_at      DATE,
  reviewed_by     UUID REFERENCES public.profiles(id),
  review_notes    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_driver_documents_driver ON public.driver_documents (driver_id);

ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver_documents_select_own" ON public.driver_documents
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "driver_documents_select_admin" ON public.driver_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "driver_documents_insert_own" ON public.driver_documents
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "driver_documents_update_admin" ON public.driver_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DOWN
-- DROP POLICY IF EXISTS "driver_documents_update_admin" ON public.driver_documents;
-- DROP POLICY IF EXISTS "driver_documents_insert_own" ON public.driver_documents;
-- DROP POLICY IF EXISTS "driver_documents_select_admin" ON public.driver_documents;
-- DROP POLICY IF EXISTS "driver_documents_select_own" ON public.driver_documents;
-- ALTER TABLE public.driver_documents DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_driver_documents_driver;
-- DROP TABLE IF EXISTS public.driver_documents;
