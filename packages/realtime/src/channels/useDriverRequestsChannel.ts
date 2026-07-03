import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@motosv/api'

export function useDriverRequestsChannel(driverId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!driverId) return

    const channel = supabase
      .channel(`driver:${driverId}:requests`)
      .on('broadcast', { event: 'new_ride_request' }, (payload) => {
        queryClient.setQueryData(['driver', driverId, 'requests'], payload.payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [driverId, queryClient])
}
