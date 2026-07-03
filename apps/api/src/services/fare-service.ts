import { supabase } from '../lib/supabase'

const FARE_DEFAULTS = {
  base_fare: 1.50,
  per_km: 0.75,
  per_min: 0.15,
  min_fare: 3.00,
  surge_multiplier: 1.0,
}

export interface FareInput {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
}

export interface FareResult {
  distanceMeters: number
  durationSeconds: number
  estimatedFare: number
  surgeMultiplier: number
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function calculateFare(input: FareInput): Promise<FareResult> {
  const distanceMeters = haversineDistance(
    input.pickupLat, input.pickupLng,
    input.dropoffLat, input.dropoffLng,
  )

  const durationSeconds = Math.round(distanceMeters / 8.33)
  const durationMinutes = durationSeconds / 60
  const distanceKm = distanceMeters / 1000

  const { data: config } = await supabase
    .from('fare_config')
    .select('base_fare, per_km, per_min, min_fare, surge_multiplier')
    .limit(1)
    .maybeSingle()

  const base = config?.base_fare ?? FARE_DEFAULTS.base_fare
  const perKm = config?.per_km ?? FARE_DEFAULTS.per_km
  const perMin = config?.per_min ?? FARE_DEFAULTS.per_min
  const minFare = config?.min_fare ?? FARE_DEFAULTS.min_fare
  const surge = config?.surge_multiplier ?? FARE_DEFAULTS.surge_multiplier

  const estimatedFare = Math.max(
    minFare,
    Number((base + distanceKm * perKm + durationMinutes * perMin).toFixed(2)),
  )

  return {
    distanceMeters: Math.round(distanceMeters),
    durationSeconds,
    estimatedFare,
    surgeMultiplier: surge,
  }
}
