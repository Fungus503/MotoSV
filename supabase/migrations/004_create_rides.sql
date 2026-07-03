CREATE TYPE ride_status AS ENUM (
  'pending',
  'assigned',
  'driver_arrived',
  'in_progress',
  'completed',
  'cancelled',
  'payment_pending',
  'paid'
);

CREATE TABLE public.rides (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rider_id        UUID NOT NULL REFERENCES public.profiles(id),
  driver_id       UUID REFERENCES public.profiles(id),
  status          ride_status NOT NULL DEFAULT 'pending',
  pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
  dropoff_location GEOGRAPHY(POINT, 4326),
  pickup_address  TEXT,
  dropoff_address TEXT,
  estimated_fare  DECIMAL(10,2),
  final_fare      DECIMAL(10,2),
  distance_meters REAL,
  duration_seconds INTEGER,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rides_rider ON public.rides (rider_id, created_at DESC);
CREATE INDEX idx_rides_driver ON public.rides (driver_id, created_at DESC);
CREATE INDEX idx_rides_status ON public.rides (status) WHERE status IN ('pending', 'assigned', 'in_progress');

CREATE TABLE public.ride_statuses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id         UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  status          ride_status NOT NULL,
  changed_by      UUID NOT NULL REFERENCES public.profiles(id),
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ride_statuses_ride ON public.ride_statuses (ride_id, created_at);

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_statuses ENABLE ROW LEVEL SECURITY;

-- Rides policies
CREATE POLICY "rides_select_rider" ON public.rides
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "rides_select_driver" ON public.rides
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "rides_select_admin" ON public.rides
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "rides_insert_rider" ON public.rides
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "rides_update_driver" ON public.rides
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "rides_update_rider" ON public.rides
  FOR UPDATE USING (auth.uid() = rider_id)
  WITH CHECK (auth.uid() = rider_id);

-- Ride statuses policies
CREATE POLICY "ride_statuses_select_participant" ON public.ride_statuses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );

CREATE POLICY "ride_statuses_insert_system" ON public.ride_statuses
  FOR INSERT WITH CHECK (
    auth.uid() = changed_by AND
    EXISTS (
      SELECT 1 FROM public.rides
      WHERE id = ride_id AND (rider_id = auth.uid() OR driver_id = auth.uid())
    )
  );

-- DOWN
-- DROP POLICY IF EXISTS "ride_statuses_insert_system" ON public.ride_statuses;
-- DROP POLICY IF EXISTS "ride_statuses_select_participant" ON public.ride_statuses;
-- ALTER TABLE public.ride_statuses DISABLE ROW LEVEL SECURITY;
-- DROP TABLE IF EXISTS public.ride_statuses;
-- DROP POLICY IF EXISTS "rides_update_rider" ON public.rides;
-- DROP POLICY IF EXISTS "rides_update_driver" ON public.rides;
-- DROP POLICY IF EXISTS "rides_insert_rider" ON public.rides;
-- DROP POLICY IF EXISTS "rides_select_admin" ON public.rides;
-- DROP POLICY IF EXISTS "rides_select_driver" ON public.rides;
-- DROP POLICY IF EXISTS "rides_select_rider" ON public.rides;
-- ALTER TABLE public.rides DISABLE ROW LEVEL SECURITY;
-- DROP INDEX IF EXISTS idx_ride_statuses_ride;
-- DROP TABLE IF EXISTS public.ride_statuses;
-- DROP INDEX IF EXISTS idx_rides_status;
-- DROP INDEX IF EXISTS idx_rides_driver;
-- DROP INDEX IF EXISTS idx_rides_rider;
-- DROP TABLE IF EXISTS public.rides;
-- DROP TYPE IF EXISTS ride_status;
