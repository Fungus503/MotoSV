import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_categories').select('*').order('sort_order')
      if (error) throw error; return data ?? []
    },
  })
}

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

export function useCreateServiceCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: { name: string; slug: string; description?: string; icon?: string }) => {
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

export function useCreateServiceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vals: any) => {
      const { error } = await supabase.from('service_types').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-types'] }),
  })
}

export function useUpdateServiceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...vals }: any) => {
      const { error } = await supabase.from('service_types').update(vals).eq('id', id)
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
