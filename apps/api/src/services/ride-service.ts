import { supabase } from '../lib/supabase'
import { logger } from '../lib/logger'

export interface RequestRideInput {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
  pickupAddress: string
  dropoffAddress: string
}

export async function requestRide(input: RequestRideInput, userId: string): Promise<string> {
  const { data: ride, error: rideError } = await supabase
    .from('rides')
    .insert({
      rider_id: userId,
      pickup_location: `POINT(${input.pickupLng} ${input.pickupLat})`,
      dropoff_location: `POINT(${input.dropoffLng} ${input.dropoffLat})`,
      pickup_address: input.pickupAddress,
      dropoff_address: input.dropoffAddress,
    })
    .select('id')
    .single()

  if (rideError) {
    logger.error({ error: rideError }, 'Failed to create ride')
    throw new Error('Failed to create ride')
  }

  const { error: statusError } = await supabase
    .from('ride_statuses')
    .insert({
      ride_id: ride.id,
      status: 'pending',
      changed_by: userId,
    })

  if (statusError) {
    logger.error({ error: statusError }, 'Failed to create ride status')
    throw new Error('Failed to create ride')
  }

  return ride.id
}

export async function cancelRide(rideId: string, reason: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('rides')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId)
    .or(`rider_id.eq.${userId},driver_id.eq.${userId}`)

  if (error) throw error

  await supabase.from('ride_statuses').insert({
    ride_id: rideId,
    status: 'cancelled',
    changed_by: userId,
    metadata: { reason },
  })
}

export async function startRide(rideId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('rides')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId)
    .eq('driver_id', userId)
    .eq('status', 'assigned')

  if (error) throw error

  await supabase.from('ride_statuses').insert({
    ride_id: rideId,
    status: 'in_progress',
    changed_by: userId,
  })
}

export interface CompleteRideInput {
  finalFare: number
  distanceMeters: number
  durationSeconds: number
}

export async function completeRide(rideId: string, input: CompleteRideInput, userId: string): Promise<void> {
  const { error } = await supabase
    .from('rides')
    .update({
      status: 'payment_pending',
      final_fare: input.finalFare,
      distance_meters: input.distanceMeters,
      duration_seconds: input.durationSeconds,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', rideId)
    .eq('driver_id', userId)
    .eq('status', 'in_progress')

  if (error) throw error

  await supabase.from('ride_statuses').insert({
    ride_id: rideId,
    status: 'payment_pending',
    changed_by: userId,
    metadata: {
      final_fare: input.finalFare,
      distance: input.distanceMeters,
      duration: input.durationSeconds,
    },
  })
}
