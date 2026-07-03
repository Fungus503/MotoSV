import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@motosv/api'

export function useRideChatChannel(rideId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!rideId) return

    const channel = supabase
      .channel(`ride:${rideId}:chat`)
      .on('broadcast', { event: 'message' }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', rideId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rideId, queryClient])
}
