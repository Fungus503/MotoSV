CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rides_created_at ON public.rides (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_panic_alerts_created_at ON public.panic_alerts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ride_statuses_status ON public.ride_statuses (status);

ANALYZE public.profiles;
ANALYZE public.payments;
ANALYZE public.rides;
ANALYZE public.panic_alerts;
ANALYZE public.ratings;
ANALYZE public.messages;
ANALYZE public.ride_statuses;
