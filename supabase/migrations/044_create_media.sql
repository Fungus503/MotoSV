CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER DEFAULT 0,
  alt_text TEXT DEFAULT '',
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_admin_all" ON public.media FOR ALL USING (public.is_admin());
CREATE POLICY "media_select_authenticated" ON public.media FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "media_insert_authenticated" ON public.media FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "media_delete_admin" ON public.media FOR DELETE USING (public.is_admin());

CREATE INDEX idx_media_created_at ON public.media(created_at DESC);
