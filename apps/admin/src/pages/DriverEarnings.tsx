import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function DriverEarningsPage() {
  const { t } = useTranslation()

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['driver-earnings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_earnings')
        .select('*, driver:driver_id(full_name), ride:ride_id(id)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error; return data ?? []
    },
  })

  const { data: summary } = useQuery({
    queryKey: ['driver-earnings-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_earnings')
        .select('amount, platform_fee, net_amount')
      if (error) throw error
      const rows = data ?? []
      return {
        total: rows.reduce((s, r: any) => s + Number(r.amount), 0),
        fees: rows.reduce((s, r: any) => s + Number(r.platform_fee), 0),
        net: rows.reduce((s, r: any) => s + Number(r.net_amount), 0),
      }
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('driverEarnings.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('driverEarnings.description')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{t('driverEarnings.totalEarnings')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${Number(summary?.total ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{t('driverEarnings.totalFees')}</p>
          <p className="text-2xl font-bold text-red-600 mt-1">${Number(summary?.fees ?? 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{t('driverEarnings.totalNet')}</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${Number(summary?.net ?? 0).toFixed(2)}</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'driver', label: t('driverEarnings.driver'), sortable: true, render: (r: any) => r.driver?.full_name ?? '—' },
          { key: 'amount', label: t('driverEarnings.amount'), sortable: true, render: (r: any) => <span className="font-medium">${Number(r.amount).toFixed(2)}</span> },
          { key: 'platform_fee', label: t('driverEarnings.platformFee'), render: (r: any) => <span className="text-red-600">-${Number(r.platform_fee).toFixed(2)}</span> },
          { key: 'net_amount', label: t('driverEarnings.netAmount'), sortable: true, render: (r: any) => <span className="font-bold text-green-600">${Number(r.net_amount).toFixed(2)}</span> },
          { key: 'type', label: t('driverEarnings.type'), render: (r: any) => <span className="capitalize">{t('driverEarnings.' + r.type)}</span> },
          { key: 'description', label: t('driverEarnings.descriptionLabel'), render: (r: any) => r.description ?? '—' },
          { key: 'created_at', label: t('driverEarnings.date'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleString() },
        ]}
        data={earnings ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
