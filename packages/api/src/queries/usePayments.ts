import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../client'

export function usePayment(rideId: string | undefined) {
  return useQuery({
    queryKey: ['payment', rideId],
    queryFn: async () => {
      if (!rideId) return null
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('ride_id', rideId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!rideId,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ride_id: string
      gateway: string
      amount: number
    }) => {
      const { data, error } = await supabase.rpc('create_payment_intent' as never, params as never)
      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['payment', vars.ride_id] })
    },
  })
}
