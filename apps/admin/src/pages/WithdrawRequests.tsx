import { useTranslation } from 'react-i18next'
import { DataTable, StatusBadge } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function WithdrawRequestsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdraw'],
    queryFn: async () => {
      const { data, error } = await supabase.from('withdraw_requests').select('*, user:user_id(full_name, phone), reviewer:reviewed_by(full_name)').order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => {
      const { data: admin } = await supabase.auth.getUser()
      const { error } = await supabase.from('withdraw_requests').update({ ...vals, reviewed_by: admin.user?.id }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-withdraw'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('withdrawRequests.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('withdrawRequests.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'user', label: t('withdrawRequests.user'), render: (w: any) => <div><p className="font-medium">{w.user?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{w.user?.phone}</p></div> },
        { key: 'amount', label: t('withdrawRequests.amount'), sortable: true, render: (w: any) => <span className="font-bold">${Number(w.amount).toFixed(2)}</span> },
        { key: 'gateway', label: t('withdrawRequests.gateway'), render: (w: any) => <span className="uppercase text-xs">{w.gateway}</span> },
        { key: 'status', label: t('withdrawRequests.status'), render: (w: any) => <StatusBadge status={w.status} /> },
        { key: 'notes', label: t('withdrawRequests.notes'), render: (w: any) => <span className="text-xs text-gray-500 truncate max-w-[120px] block">{w.notes ?? '—'}</span> },
        { key: 'created_at', label: t('withdrawRequests.date'), sortable: true, render: (w: any) => new Date(w.created_at).toLocaleDateString(i18n.language) },
        { key: 'actions', label: '', width: 'w-48', render: (w: any) => w.status === 'pending' ? (
          <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); updateMutation.mutateAsync({ id: w.id, status: 'approved' }) }} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100">{t('withdrawRequests.approve')}</button>
            <button onClick={(e) => { e.stopPropagation(); updateMutation.mutateAsync({ id: w.id, status: 'rejected' }) }} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">{t('withdrawRequests.reject')}</button>
          </div>
        ) : <span className="text-xs text-gray-400">—</span> },
      ]} data={data ?? []} loading={isLoading} searchable />
    </div>
  )
}
