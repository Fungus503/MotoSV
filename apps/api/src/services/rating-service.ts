import { supabase } from '../lib/supabase'

export interface CreateRatingInput {
  rideId: string
  rating: number
  comment?: string
}

export async function createRating(input: CreateRatingInput): Promise<void> {
  const { data: ride } = await supabase
    .from('rides')
    .select('rider_id, driver_id')
    .eq('id', input.rideId)
    .single()

  if (!ride) {
    throw new Error('Ride not found')
  }

}

export async function createRatingAs(input: CreateRatingInput, userId: string): Promise<void> {
  const { data: ride } = await supabase
    .from('rides')
    .select('rider_id, driver_id')
    .eq('id', input.rideId)
    .single()

  if (!ride) {
    throw new Error('Ride not found')
  }

  const ratedId = userId === ride.rider_id ? ride.driver_id : ride.rider_id

  const { error } = await supabase.from('ratings').insert({
    ride_id: input.rideId,
    rater_id: userId,
    rated_id: ratedId,
    rating: input.rating,
    comment: input.comment ?? null,
  })

  if (error) throw error
}
