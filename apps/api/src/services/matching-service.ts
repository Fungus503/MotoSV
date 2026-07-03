import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface DriverInfo {
  driver_id: string
  full_name: string
  distance_meters: number
  heading: number | null
}

export interface RideInfo {
  ride_id: string
  rider_id: string
  pickup_lng: number
  pickup_lat: number
  pickup_address: string | null
  dropoff_address: string | null
  estimated_fare: number | null
}

export async function findNearbyDrivers(
  lng: number,
  lat: number,
  radiusMeters = 3000,
): Promise<DriverInfo[]> {
  const { data, error } = await supabase.rpc('find_nearby_drivers', {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
  })

  if (error) {
    logger.error({ error }, 'Error finding nearby drivers')
    return []
  }

  return (data as DriverInfo[]) ?? []
}

export async function notifyDrivers(
  driverIds: string[],
  rideInfo: {
    ride_id: string
    pickup_address: string | null
    dropoff_address: string | null
    estimated_fare: number | null
  },
): Promise<void> {
  for (const driverId of driverIds) {
    try {
      await supabase.channel(`driver:${driverId}:requests`).send({
        type: 'broadcast',
        event: 'new_ride_request',
        payload: rideInfo,
      })
    } catch (error) {
      logger.error({ error, driverId }, 'Error notifying driver')
    }
  }
}

export async function cancelRideNoDrivers(rideId: string): Promise<void> {
  const { error } = await supabase
    .from('rides')
    .update({ status: 'cancelled', cancel_reason: 'no_drivers_available', updated_at: new Date().toISOString() })
    .eq('id', rideId)

  if (error) {
    logger.error({ error, rideId }, 'Error cancelling ride (no drivers)')
  }
}

export async function cancelRideTimeout(rideId: string): Promise<void> {
  const { data: ride } = await supabase
    .from('rides')
    .select('status')
    .eq('id', rideId)
    .single()

  if (ride?.status === 'pending') {
    const { error } = await supabase
      .from('rides')
      .update({ status: 'cancelled', cancel_reason: 'matching_timeout', updated_at: new Date().toISOString() })
      .eq('id', rideId)

    if (error) {
      logger.error({ error, rideId }, 'Error cancelling ride (timeout)')
    }
  }
}

export async function isRideAssigned(rideId: string): Promise<string | null> {
  const { data } = await supabase
    .from('rides')
    .select('status, driver_id')
    .eq('id', rideId)
    .single()

  if (data?.status === 'assigned' && data.driver_id) {
    return data.driver_id
  }

  if (data?.status === 'cancelled') {
    return 'CANCELLED'
  }

  return null
}
