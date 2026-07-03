import { useTranslation } from 'react-i18next'
import { DataTable, StatusBadge } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function DispatchersPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dispatchers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dispatchers').select('*, user:user_id(full_name, phone, email)').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('dispatchers.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('dispatchers.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'user', label: t('dispatchers.name'), sortable: true, render: (d: any) => <div><p className="font-medium">{d.user?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{d.user?.email}</p></div> },
        { key: 'user', label: t('dispatchers.phone'), render: (d: any) => d.user?.phone ?? '—' },
        { key: 'is_active', label: t('dispatchers.active'), render: (d: any) => <StatusBadge status={d.is_active ? 'approved' : 'rejected'} /> },
        { key: 'created_at', label: t('dispatchers.added'), sortable: true, render: (d: any) => new Date(d.created_at).toLocaleDateString(i18n.language) },
      ]} data={data ?? []} loading={isLoading} searchable />
    </div>
  )
}
