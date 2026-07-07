import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useRideRequests, useUpdateRideRequest } from '../lib/queries'

export function RideRequestsPage() {
  const { t } = useTranslation()
  const { data: requests, isLoading } = useRideRequests()
  const updateReq = useUpdateRideRequest()
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = statusFilter
    ? (requests ?? []).filter((r: any) => r.status === statusFilter)
    : (requests ?? [])

  async function handleAction(id: string, status: string) {
    await updateReq.mutateAsync({ id, status })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('rideRequests.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('rideRequests.description')}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'pending', 'finding_driver', 'accepted', 'cancelled', 'expired'].map((s) => (
          <button type="button" key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {s ? t('status.' + s) : t('rideRequests.all')}
          </button>
        ))}
      </div>
      <DataTable
        columns={[
          { key: 'rider', label: t('rideRequests.rider'), sortable: true, render: (r: any) => r.rider?.full_name ?? '—' },
          { key: 'service', label: t('rideRequests.service'), render: (r: any) => r.service?.name ?? '—' },
          { key: 'pickup_address', label: t('rideRequests.pickup') },
          { key: 'dropoff_address', label: t('rideRequests.dropoff') },
          { key: 'estimated_fare', label: t('rideRequests.fare'), sortable: true, render: (r: any) => `$${Number(r.estimated_fare ?? 0).toFixed(2)}` },
          { key: 'ride_type', label: t('rideRequests.type'), render: (r: any) => <span className="capitalize">{r.ride_type}</span> },
          { key: 'status', label: t('rideRequests.status'), render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'actions', label: '', width: 'w-32', render: (r: any) => (
            <div className="flex gap-1">
              {r.status === 'pending' && (
                <>
                  <button type="button" onClick={(e) => { e.stopPropagation(); handleAction(r.id, 'cancelled') }}
                    className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">{t('rideRequests.cancel')}</button>
                </>
              )}
              {r.status === 'finding_driver' && (
                <button type="button" onClick={(e) => { e.stopPropagation(); handleAction(r.id, 'cancelled') }}
                  className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">{t('rideRequests.cancel')}</button>
              )}
            </div>
          )},
        ]}
        data={filtered}
        loading={isLoading}
        searchable
      />
    </div>
  )
}

