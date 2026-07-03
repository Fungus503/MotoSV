import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../client'

export function useActiveRide(userId: string | undefined) {
  return useQuery({
    queryKey: ['active-ride', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('rides')
        .select('*, driver:driver_id(full_name, avatar_url, phone)')
        .or(`rider_id.eq.${userId},driver_id.eq.${userId}`)
        .in('status', ['pending', 'assigned', 'driver_arrived', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!userId,
    refetchInterval: 5000,
  })
}

export function useRideHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['ride-history', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('rides')
        .select('*, driver:driver_id(full_name, avatar_url)')
        .eq('rider_id', userId)
        .in('status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data ?? []
    },
    enabled: !!userId,
  })
}

export function useRequestRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      pickup_lat: number
      pickup_lng: number
      dropoff_lat: number
      dropoff_lng: number
      pickup_address: string
      dropoff_address: string
    }) => {
      const { data, error } = await supabase.rpc('request_ride' as never, params as never)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
    },
  })
}

export function useCancelRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { ride_id: string; reason: string }) => {
      const { error } = await supabase.rpc('cancel_ride' as never, {
        p_ride_id: params.ride_id,
        p_reason: params.reason,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
      queryClient.invalidateQueries({ queryKey: ['ride-history'] })
    },
  })
}

export function useStartRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rideId: string) => {
      const { error } = await supabase.rpc('start_ride' as never, { p_ride_id: rideId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
    },
  })
}

export function useCompleteRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { ride_id: string; final_fare: number; distance_meters: number; duration_seconds: number }) => {
      const { error } = await supabase.rpc('complete_ride' as never, {
        p_ride_id: params.ride_id,
        p_final_fare: params.final_fare,
        p_distance_meters: params.distance_meters,
        p_duration_seconds: params.duration_seconds,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-ride'] })
      queryClient.invalidateQueries({ queryKey: ['ride-history'] })
    },
  })
}
