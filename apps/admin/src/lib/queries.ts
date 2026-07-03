import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    },
    staleTime: Infinity,
  })
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_metrics')
      if (error) throw error
      return data as unknown as { rides_today: number; revenue_today: number; drivers_online: number; active_rides: number }
    },
    refetchInterval: 30000,
  })
}

export function useWeeklyEarnings() {
  return useQuery({
    queryKey: ['weekly-earnings'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_weekly_earnings')
      if (error) throw error
      return (data as { day: string; amount: number }[]) ?? []
    },
    refetchInterval: 60000,
  })
}

export function useDrivers() {
  return useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, driver_locations(*)')
        .eq('role', 'driver')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useDriverDocuments(driverId: string) {
  return useQuery({
    queryKey: ['driver-documents', driverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { docId: string; status: string; reviewNotes?: string }) => {
      const { data: user } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('driver_documents')
        .update({ status: params.status, review_notes: params.reviewNotes ?? null, reviewed_by: user.user?.id })
        .eq('id', params.docId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-documents'] })
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] })
    },
  })
}

export function useAllRides(status?: string) {
  return useQuery({
    queryKey: ['admin-rides', status],
    queryFn: async () => {
      let query = supabase
        .from('rides')
        .select('*, rider:rider_id(full_name, phone), driver:driver_id(full_name, phone)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (status) {
        query = status === 'active'
          ? query.in('status', ['pending', 'assigned', 'driver_arrived', 'in_progress'])
          : query.eq('status', status)
      }
      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 30000,
  })
}

export function useFareConfig() {
  return useQuery({
    queryKey: ['fare-config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fare_config').select('*').limit(1).single()
      if (error) throw error
      return data
    },
  })
}

export function useUpdateFareConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { base_fare: number; per_km: number; per_min: number; min_fare: number; surge_enabled: boolean; surge_multiplier: number }) => {
      const { data: user } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('fare_config')
        .update({ ...params, updated_by: user.user?.id })
        .neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fare-config'] }),
  })
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function useProfileStats() {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: async () => {
      const [rides, drivers, riders, online, recentRides] = await Promise.all([
        supabase.from('rides').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'driver'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'rider'),
        supabase.from('driver_locations').select('id', { count: 'exact', head: true }).eq('is_online', true),
        supabase.from('rides').select('id, status, created_at').order('created_at', { ascending: false }).limit(5),
      ])
      if (rides.error) throw rides.error
      return {
        totalRides: rides.count ?? 0,
        totalDrivers: drivers.count ?? 0,
        totalRiders: riders.count ?? 0,
        driversOnline: online.count ?? 0,
        recentRides: recentRides.data ?? [],
      }
    },
    staleTime: 30000,
  })
}

// === Service Categories ===
export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*').order('sort_order')
      if (error) throw error; return data ?? []
    },
  })
}

export function useCreateServiceCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { name: string; slug: string; description?: string; icon?: string; sort_order?: number }) => {
      const { error } = await supabase.from('service_categories').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-categories'] }),
  })
}

export function useUpdateServiceCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...vals }: { id: string; name?: string; description?: string; icon?: string; is_active?: boolean }) => {
      const { error } = await supabase.from('service_categories').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-categories'] }),
  })
}

export function useDeleteServiceCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-categories'] }),
  })
}

// === Service Types ===
export function useServiceTypes(categoryId?: string) {
  return useQuery({
    queryKey: ['service-types', categoryId],
    queryFn: async () => {
      let q = supabase.from('service_types').select('*, category:category_id(name)').order('sort_order')
      if (categoryId) q = q.eq('category_id', categoryId)
      const { data, error } = await q
      if (error) throw error; return data ?? []
    },
  })
}

export function useCreateServiceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { category_id: string; name: string; slug: string; base_fare: number; per_km: number; per_min: number; min_fare: number }) => {
      const { error } = await supabase.from('service_types').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-types'] }),
  })
}

export function useDeleteServiceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('service_types').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-types'] }),
  })
}

// === Vehicle Types ===
export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vehicle_types').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })
}

export function useCreateVehicleType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { name: string; slug: string; description?: string; icon?: string; capacity: number }) => {
      const { error } = await supabase.from('vehicle_types').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-types'] }),
  })
}

export function useDeleteVehicleType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicle_types').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-types'] }),
  })
}

export function useUpdateVehicleType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...vals }: { id: string; name?: string; slug?: string; description?: string; icon?: string; capacity?: number; is_active?: boolean }) => {
      const { error } = await supabase.from('vehicle_types').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-types'] }),
  })
}

// === Zones ===
export function useZones() {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('zones').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })
}

export function useCreateZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { name: string; slug: string; description?: string; lat?: number; lng?: number }) => {
      const { error } = await supabase.rpc('create_zone', {
        p_name: vals.name, p_slug: vals.slug, p_description: vals.description ?? null,
        p_lat: vals.lat ?? null, p_lng: vals.lng ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  })
}

export function useDeleteZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('zones').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zones'] }),
  })
}

// === Ride Requests ===
export function useRideRequests() {
  return useQuery({
    queryKey: ['ride-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*, rider:rider_id(full_name, phone), service:service_type_id(name)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error; return data ?? []
    },
  })
}

export function useUpdateRideRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...vals }: { id: string; status?: string; driver_id?: string }) => {
      const { error } = await supabase.from('ride_requests').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ride-requests'] }),
  })
}

// === Bids ===
export function useBids(rideRequestId?: string) {
  return useQuery({
    queryKey: ['bids', rideRequestId],
    queryFn: async () => {
      let q = supabase.from('bids').select('*, driver:driver_id(full_name, phone)').order('created_at', { ascending: false })
      if (rideRequestId) q = q.eq('ride_request_id', rideRequestId)
      const { data, error } = await q
      if (error) throw error; return data ?? []
    },
  })
}

export function useDriverVehicles() {
  return useQuery({
    queryKey: ['driver-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_vehicles')
        .select('*, driver:driver_id(full_name, phone), vehicle:vehicle_type_id(name)')
        .order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
}

export function useVerifyDriverVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from('driver_vehicles').update({ is_verified }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-vehicles'] }),
  })
}
