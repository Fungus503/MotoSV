import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@motosv/api'
import type { RideStatus } from '@motosv/domain'

export function useRideChannel(rideId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!rideId) return

    const channel = supabase
      .channel(`ride:${rideId}`)
      .on('broadcast', { event: 'status_change' }, (payload) => {
        queryClient.setQueryData(['ride', rideId], payload.payload)
        queryClient.invalidateQueries({ queryKey: ['ride', rideId] })
      })
      .on('broadcast', { event: 'driver_location' }, (payload) => {
        queryClient.setQueryData(['ride', rideId, 'driver-location'], payload.payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [rideId, queryClient])
}
