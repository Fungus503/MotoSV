import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../client'

export function useTriggerPanic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ride_id: string
      alert_type: string
      notes?: string
    }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('panic_alerts').insert({
        ride_id: params.ride_id,
        reporter_id: user.user.id,
        alert_type: params.alert_type,
        notes: params.notes ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panic-alerts'] })
    },
  })
}

export function useActivePanicAlert(rideId: string | undefined) {
  return useQuery({
    queryKey: ['panic-alerts', rideId],
    queryFn: async () => {
      if (!rideId) return null
      const { data, error } = await supabase
        .from('panic_alerts')
        .select('*')
        .eq('ride_id', rideId)
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!rideId,
  })
}

export function useFaqs(category?: string) {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: async () => {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (category) {
        query = query.eq('category', category)
      }
      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateTripShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { ride_id: string }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('trip_shares')
        .insert({ ride_id: params.ride_id, shared_by: user.user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-share'] })
    },
  })
}

export function useTripShare(shareCode: string | undefined) {
  return useQuery({
    queryKey: ['trip-share', shareCode],
    queryFn: async () => {
      if (!shareCode) return null
      const { data, error } = await supabase
        .from('trip_shares')
        .select('*, ride:ride_id(*)')
        .eq('share_code', shareCode)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!shareCode,
  })
}
