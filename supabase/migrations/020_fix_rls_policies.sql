CREATE POLICY "trip_shares_update_own" ON public.trip_shares
  FOR UPDATE USING (auth.uid() = shared_by)
  WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "faqs_insert_admin" ON public.faqs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "faqs_update_admin" ON public.faqs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "faqs_delete_admin" ON public.faqs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE OR REPLACE FUNCTION public.handle_panic_alert_updated()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_panic_alert_updated
  BEFORE UPDATE ON public.panic_alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_panic_alert_updated();
