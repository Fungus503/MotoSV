export const RIDE_STATUSES = [
  'pending',
  'assigned',
  'driver_arrived',
  'in_progress',
  'completed',
  'cancelled',
  'payment_pending',
  'paid',
] as const

export const USER_ROLES = ['rider', 'driver', 'admin'] as const

export const PAYMENT_GATEWAYS = ['stripe', 'paypal', 'wompi', 'cash'] as const

export const DRIVER_SEARCH_RADIUS_METERS = 5000

export const RIDE_REQUEST_TIMEOUT_MS = 30_000

export const LOCATION_UPDATE_INTERVAL_MS = 1000

export const MAP_DEFAULT_ZOOM = 15

export const FARE_BASE_RATE = 1.50
export const FARE_PER_KM = 0.75
export const FARE_PER_MINUTE = 0.15
export const FARE_MINIMUM = 3.00
export const FARE_SURGE_MULTIPLIER = 1.5

export const STORAGE_KEYS = {
  AUTH_SESSION: 'motosv-auth-session',
  ONBOARDING_COMPLETED: 'motosv-onboarding-completed',
  THEME_PREFERENCE: 'motosv-theme',
  MAP_LAST_REGION: 'motosv-map-region',
} as const
