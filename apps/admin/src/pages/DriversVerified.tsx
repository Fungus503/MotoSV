import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CheckCircle } from 'lucide-react'
import { useDrivers } from '../lib/queries'

export function DriversVerifiedPage() {
  const { t } = useTranslation()
  const { data: drivers } = useDrivers()
  const [search, setSearch] = useState('')

  const verified = (drivers ?? []).filter((d) => d.is_verified === true)
  const filtered = verified.filter(
    (d) => d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('driversVerified.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('driversVerified.description')}</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('driversVerified.search')}
            name="search" autoComplete="off" aria-label={t('driversVerified.search')}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversVerified.driver')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversVerified.phone')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversVerified.vehicle')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversVerified.online')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversVerified.documents')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((driver) => (
              <DriverVerifiedRow key={driver.id} driver={driver} />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('driversVerified.noDrivers')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DriverVerifiedRow({ driver }: { driver: Record<string, unknown> }) {
  const { t } = useTranslation()
  const loc = driver.driver_locations as Record<string, unknown> | null
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary text-sm font-bold">{(driver.full_name as string)?.charAt(0) ?? '?'}</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{driver.full_name as string ?? t('driversVerified.noName')}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{driver.phone as string}</td>
      <td className="px-4 py-3 text-sm text-gray-600">—</td>
      <td className="px-4 py-3">
        <span className={`text-sm ${loc?.is_online ? 'text-green-600' : 'text-gray-400'}`}>
          {loc?.is_online ? t('driversVerified.online_s') : t('driversVerified.offline')}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <CheckCircle size={16} className="text-green-500 inline mr-1" />
        {t('driversVerified.verified')}
      </td>
    </tr>
  )
}
