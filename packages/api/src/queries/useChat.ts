import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../client'

export function useMessages(rideId: string | undefined) {
  return useQuery({
    queryKey: ['messages', rideId],
    queryFn: async () => {
      if (!rideId) return []
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, role)')
        .eq('ride_id', rideId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    enabled: !!rideId,
    refetchInterval: 3000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { ride_id: string; content: string }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('messages')
        .insert({ ride_id: params.ride_id, content: params.content, sender_id: user.user.id })
      if (error) throw error
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['messages', vars.ride_id] })
    },
  })
}
