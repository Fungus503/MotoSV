CREATE TABLE public.ride_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id        UUID NOT NULL REFERENCES public.profiles(id),
  service_type_id UUID NOT NULL REFERENCES public.service_types(id),
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff_location GEOGRAPHY(POINT, 4326),
  pickup_address  TEXT NOT NULL,
  dropoff_address TEXT,
  estimated_fare  DECIMAL(10,2),
  final_fare      DECIMAL(10,2),
  distance_meters REAL,
  duration_seconds INTEGER,
  ride_type       TEXT NOT NULL DEFAULT 'instant' CHECK (ride_type IN ('instant', 'scheduled', 'rental', 'parcel')),
  scheduled_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'finding_driver', 'driver_assigned', 'accepted', 'rejected', 'cancelled', 'expired')),
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ride_requests_rider ON public.ride_requests (rider_id, created_at DESC);
CREATE INDEX idx_ride_requests_status ON public.ride_requests (status) WHERE status IN ('pending', 'finding_driver');

ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ride_requests_select_rider" ON public.ride_requests
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "ride_requests_insert_rider" ON public.ride_requests
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "ride_requests_update_rider" ON public.ride_requests
  FOR UPDATE USING (auth.uid() = rider_id)
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "ride_requests_select_driver" ON public.ride_requests
  FOR SELECT USING (
    status IN ('pending', 'finding_driver')
  );

CREATE POLICY "ride_requests_admin_all" ON public.ride_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
