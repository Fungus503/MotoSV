import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAllRides } from '../lib/queries'
import { StatusBadge } from '../components'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

const statusFilters = (t: any) => [
  { value: '', label: t('rides.all') },
  { value: 'active', label: t('rides.active') },
  { value: 'completed', label: t('rides.completed') },
  { value: 'cancelled', label: t('rides.cancelled') },
  { value: 'paid', label: t('rides.paid') },
  { value: 'scheduled', label: t('rides.scheduled') },
  { value: 'accepted', label: t('rides.accepted') },
  { value: 'arrived', label: t('rides.arrived') },
  { value: 'started', label: t('rides.started') },
]

export function RidesPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '')
  const [search, setSearch] = useState('')
  const { data: rides } = useAllRides(statusFilter || undefined)

  useEffect(() => {
    const s = searchParams.get('status') ?? ''
    setStatusFilter(s)
  }, [searchParams])

  function updateFilter(val: string) {
    setStatusFilter(val)
    if (val) setSearchParams({ status: val })
    else setSearchParams({})
  }

  const filtered = (rides ?? []).filter(
    (r) =>
      r.rider?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.driver?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('rides.title')}</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('rides.search')} name="search" autoComplete="off"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64" />
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statusFilters(t).map((f) => (
          <button key={f.value} onClick={() => updateFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{f.label}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('rides.passenger')}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('rides.driver')}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('rides.status')}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('rides.fare')}</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('rides.date')}</th>
          </tr></thead>
          <tbody>
            {filtered.map((ride) => (
              <tr key={ride.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{ride.rider?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ride.driver?.full_name ?? '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={ride.status} /></td>
                <td className="px-4 py-3 text-sm text-gray-900">${Number(ride.final_fare ?? ride.estimated_fare ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{format(new Date(ride.created_at), 'dd MMM HH:mm', { locale: i18n.language === 'en' ? enUS : es })}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('rides.noRides')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
