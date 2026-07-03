import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CheckCircle, XCircle } from 'lucide-react'
import { useDrivers, useDriverDocuments, useUpdateDocumentStatus } from '../lib/queries'
import { StatusBadge } from '../components'

export function DriversPage() {
  const { t } = useTranslation()
  const { data: drivers } = useDrivers()
  const updateDoc = useUpdateDocumentStatus()
  const [search, setSearch] = useState('')

  const filtered = (drivers ?? []).filter(
    (d) => d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('drivers.title')}</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('drivers.search')} name="search" autoComplete="off"
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('drivers.driver')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('drivers.phone')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('drivers.status')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('drivers.online')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('drivers.documents')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((driver) => (
              <DriverRow key={driver.id} driver={driver} onUpdateDoc={updateDoc.mutateAsync} />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">{t('drivers.noDrivers')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DriverRow({ driver, onUpdateDoc }: { driver: any; onUpdateDoc: (p: any) => Promise<any> }) {
  const { t } = useTranslation()
  const { data: docs } = useDriverDocuments(driver.id)
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm font-bold">{driver.full_name?.charAt(0) ?? '?'}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{driver.full_name ?? t('drivers.noName')}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{driver.phone}</td>
        <td className="px-4 py-3"><StatusBadge status={driver.is_verified ? 'approved' : 'pending'} /></td>
        <td className="px-4 py-3">
          <span className={`text-sm ${driver.driver_locations?.is_online ? 'text-green-600' : 'text-gray-400'}`}>
            {driver.driver_locations?.is_online ? t('drivers.online_s') : t('drivers.offline')}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{docs?.length ?? 0} {t('drivers.documentsCount')}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="px-4 py-3 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(docs ?? []).map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{doc.document_type.replace(/_/g, ' ')}</p>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex gap-1">
                    {doc.status !== 'approved' && (
                      <button onClick={() => onUpdateDoc({ docId: doc.id, status: 'approved' })}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {doc.status !== 'rejected' && (
                      <button onClick={() => onUpdateDoc({ docId: doc.id, status: 'rejected' })}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!docs || docs.length === 0) && (
                <p className="text-sm text-gray-400 col-span-3 py-4 text-center">{t('drivers.noDocuments')}</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
