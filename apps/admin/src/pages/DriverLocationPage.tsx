import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function DriverLocationPage() {
  const { t, i18n } = useTranslation()
  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-driver-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*, driver:driver_id(full_name, phone)')
        .order('updated_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
    refetchInterval: 10000,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('driverLocation.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('driverLocation.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'driver', label: t('driverLocation.driver'), render: (l: any) => (
            <div><p className="font-medium">{l.driver?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{l.driver?.phone}</p></div>
          )},
          { key: 'is_online', label: t('driverLocation.online'), render: (l: any) => (
            <span className={l.is_online ? 'text-green-600 font-medium' : 'text-gray-400'}>{l.is_online ? t('driverLocation.onlineValue') : t('driverLocation.offlineValue')}</span>
          )},
          { key: 'is_on_ride', label: t('driverLocation.onRide'), render: (l: any) => (
            <span className={l.is_on_ride ? 'text-blue-600' : 'text-gray-400'}>{l.is_on_ride ? t('driverLocation.onRideValue') : '—'}</span>
          )},
          { key: 'heading', label: t('driverLocation.heading'), render: (l: any) => l.heading ? `${l.heading}°` : '—' },
          { key: 'speed', label: t('driverLocation.speed'), render: (l: any) => l.speed ? `${l.speed}${t('driverLocation.speedUnit')}` : '—' },
          { key: 'updated_at', label: t('driverLocation.updated'), sortable: true, render: (l: any) => new Date(l.updated_at).toLocaleString(i18n.language) },
        ]}
        data={locations ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
