import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'

const payoutColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-200 text-gray-600',
}

export function DriverPayoutsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['driver-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_payouts')
        .select('*, driver:driver_id(full_name), admin:admin_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error; return data ?? []
    },
    refetchInterval: 15000,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const payload: any = { status }
      if (status === 'approved') payload.paid_at = new Date().toISOString()
      if (notes) payload.notes = notes
      const { data: admin } = await supabase.auth.getUser()
      payload.admin_id = admin.user?.id
      const { error } = await supabase.from('driver_payouts').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver-payouts'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('driverPayouts.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('driverPayouts.description')}</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'driver', label: t('driverPayouts.driver'), sortable: true, render: (r: any) => r.driver?.full_name ?? '—' },
          { key: 'amount', label: t('driverPayouts.amount'), sortable: true, render: (r: any) => <span className="font-bold">${Number(r.amount).toFixed(2)}</span> },
          { key: 'method', label: t('driverPayouts.method'), render: (r: any) => <span className="capitalize">{r.method}</span> },
          { key: 'status', label: t('driverPayouts.status'), render: (r: any) => {
            const cls = payoutColors[r.status] ?? 'bg-gray-100 text-gray-800'
            return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{t('driverPayouts.' + r.status)}</span>
          }},
          { key: 'admin', label: t('driverPayouts.admin'), render: (r: any) => r.admin?.full_name ?? '—' },
          { key: 'created_at', label: t('driverPayouts.date'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleString() },
          { key: 'paid_at', label: t('driverPayouts.paidAt'), render: (r: any) => r.paid_at ? new Date(r.paid_at).toLocaleString() : '—' },
          { key: '', label: '', width: 'w-24', render: (r: any) => r.status === 'pending' ? (
            <div className="flex gap-1">
              <button onClick={(e) => { e.stopPropagation(); try { if (confirm(t('driverPayouts.approveConfirm'))) updateMutation.mutateAsync({ id: r.id, status: 'approved' }) } catch (e) { alert(handleError(e)) } }}
                className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100">{t('driverPayouts.approve')}</button>
              <button onClick={(e) => { e.stopPropagation(); try { if (confirm(t('driverPayouts.rejectConfirm'))) updateMutation.mutateAsync({ id: r.id, status: 'cancelled' }) } catch (e) { alert(handleError(e)) } }}
                className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">{t('driverPayouts.reject')}</button>
            </div>
          ) : null},
        ]}
        data={payouts ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
