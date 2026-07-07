import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function CommissionsPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('commissions').select('*, driver:driver_id(full_name, phone), ride:ride_id(id, status)').order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('commissions.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('commissions.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'driver', label: t('commissions.driver'), render: (c: any) => c.driver?.full_name ?? '—' },
        { key: 'amount', label: t('commissions.rideAmount'), sortable: true, render: (c: any) => `$${Number(c.amount).toFixed(2)}` },
        { key: 'commission_pct', label: t('commissions.rate'), render: (c: any) => `${c.commission_pct}%` },
        { key: 'commission_amount', label: t('commissions.commission'), sortable: true, render: (c: any) => <span className="font-medium text-primary">$${Number(c.commission_amount).toFixed(2)}</span> },
        { key: 'created_at', label: t('commissions.date'), sortable: true, render: (c: any) => new Date(c.created_at).toLocaleDateString(i18n.language) },
      ]} data={data ?? []} loading={isLoading} searchable />
    </div>
  )
}

