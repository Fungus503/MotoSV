import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function PaymentsPage() {
  const { t, i18n } = useTranslation()
  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*, ride:ride_id(id, pickup_address, dropoff_address), rider:rider_id(full_name), driver:driver_id(full_name)')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('payments.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('payments.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'rider', label: t('payments.rider'), render: (p: any) => p.rider?.full_name ?? '—' },
          { key: 'driver', label: t('payments.driver'), render: (p: any) => p.driver?.full_name ?? '—' },
          { key: 'gateway', label: t('payments.gateway'), sortable: true, render: (p: any) => <span className="uppercase text-xs font-mono">{p.gateway}</span> },
          { key: 'amount', label: t('payments.amount'), sortable: true, render: (p: any) => <span className="font-medium">${Number(p.amount).toFixed(2)}</span> },
          { key: 'status', label: t('payments.status'), render: (p: any) => <StatusBadge status={p.status} /> },
          { key: 'created_at', label: t('payments.date'), sortable: true, render: (p: any) => new Date(p.created_at).toLocaleDateString(i18n.language) },
        ]}
        data={payments ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}

