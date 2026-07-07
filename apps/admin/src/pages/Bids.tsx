import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function BidsPage() {
  const { t, i18n } = useTranslation()
  const { data: bids, isLoading } = useQuery({
    queryKey: ['admin-bids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('*, driver:driver_id(full_name, phone), request:ride_request_id(pickup_address, dropoff_address, rider:rider_id(full_name))')
        .order('created_at', { ascending: false }).limit(100)
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('bids.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('bids.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'driver', label: t('bids.driver'), render: (b: any) => b.driver?.full_name ?? '—' },
          { key: 'amount', label: t('bids.bid'), sortable: true, render: (b: any) => <span className="font-bold">${Number(b.amount).toFixed(2)}</span> },
          { key: 'status', label: t('bids.status'), render: (b: any) => {
            const colors: Record<string, string> = { pending: 'text-yellow-600', accepted: 'text-green-600', rejected: 'text-red-500', withdrawn: 'text-gray-400' }
            return <span className={`text-sm font-medium ${colors[b.status] ?? ''}`}>{b.status}</span>
          }},
          { key: 'request', label: t('bids.pickup'), render: (b: any) => (
            <div><p className="text-xs text-gray-600 truncate max-w-[150px]">{b.request?.pickup_address ?? '—'}</p>
              <p className="text-xs text-gray-400">{b.request?.rider?.full_name ?? ''}</p></div>
          )},
          { key: 'created_at', label: t('bids.date'), sortable: true, render: (b: any) => new Date(b.created_at).toLocaleString(i18n.language) },
        ]}
        data={bids ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}

