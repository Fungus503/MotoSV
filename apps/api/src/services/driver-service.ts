import { supabase } from '../lib/supabase'

export interface UpdateLocationInput {
  lat: number
  lng: number
  heading?: number
  speed?: number
}

export async function findNearbyDrivers(lat: number, lng: number, radiusMeters = 3000) {
  const { data, error } = await supabase.rpc('find_nearby_drivers', {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
  })

  if (error) throw error
  return data
}

export async function getDriverLocation(driverId: string) {
  const { data, error } = await supabase
    .from('driver_locations')
    .select('driver_id, location, heading, speed, is_online, is_on_ride, updated_at')
    .eq('driver_id', driverId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateDriverLocation(_driverId: string, input: UpdateLocationInput) {
  const { error } = await supabase.rpc('update_driver_location', {
    p_lat: input.lat,
    p_lng: input.lng,
    p_heading: input.heading ?? null,
    p_speed: input.speed ?? null,
  })

  if (error) throw error
}

export async function setDriverOnline(driverId: string, isOnline: boolean) {
  const { error } = await supabase
    .from('driver_locations')
    .update({ is_online: isOnline, updated_at: new Date().toISOString() })
    .eq('driver_id', driverId)

  if (error) throw error
}
