CREATE TABLE public.vehicle_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_vehicle_id UUID NOT NULL REFERENCES public.driver_vehicles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_vehicle_approvals_status ON public.vehicle_approvals(status) WHERE status = 'pending';
CREATE INDEX idx_vehicle_approvals_vehicle ON public.vehicle_approvals(driver_vehicle_id);

ALTER TABLE public.vehicle_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_approvals_admin_all" ON public.vehicle_approvals
  FOR ALL USING (public.is_admin());

CREATE POLICY "vehicle_approvals_select_driver" ON public.vehicle_approvals
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.driver_vehicles dv WHERE dv.id = driver_vehicle_id AND dv.driver_id = auth.uid()
  ));

CREATE OR REPLACE FUNCTION public.handle_vehicle_approval()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.driver_vehicles
  SET is_verified = (NEW.status = 'approved')
  WHERE id = NEW.driver_vehicle_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vehicle_approval_update
  AFTER INSERT OR UPDATE OF status ON public.vehicle_approvals
  FOR EACH ROW
  WHEN (NEW.status IN ('approved', 'rejected'))
  EXECUTE FUNCTION public.handle_vehicle_approval();
