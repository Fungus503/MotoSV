import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@motosv/api'

export function useDriverLocationChannel() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('driver-locations')
      .on('broadcast', { event: 'location' }, (payload) => {
        queryClient.setQueryData(['driver-locations'], payload.payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
