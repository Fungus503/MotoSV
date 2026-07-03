import { supabase } from '../lib/supabase'

export interface CreatePaymentInput {
  rideId: string
  gateway: 'stripe' | 'paypal' | 'wompi' | 'cash'
  amount: number
}

export async function createPayment(input: CreatePaymentInput): Promise<string> {
  const { data: ride, error: rideError } = await supabase
    .from('rides')
    .select('rider_id, driver_id')
    .eq('id', input.rideId)
    .single()

  if (rideError || !ride) {
    throw new Error('Ride not found')
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      ride_id: input.rideId,
      rider_id: ride.rider_id,
      driver_id: ride.driver_id,
      amount: input.amount,
      gateway: input.gateway,
      status: 'processing',
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function completeRidePayment(rideId: string): Promise<void> {
  const { error } = await supabase.rpc('complete_ride_payment', { p_ride_id: rideId })
  if (error) throw error
}
