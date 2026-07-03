import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../client'

export function useRateRide() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      ride_id: string
      rating: number
      comment?: string
    }) => {
      const { error } = await supabase.rpc('rate_ride' as never, {
        p_ride_id: params.ride_id,
        p_rating: params.rating,
        p_comment: params.comment ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-history'] })
    },
  })
}
