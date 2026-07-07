import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, CheckCircle, XCircle } from 'lucide-react'
import { useDrivers, useDriverDocuments, useUpdateDocumentStatus } from '../lib/queries'
import { StatusBadge } from '../components/StatusBadge'

export function DriversUnverifiedPage() {
  const { t } = useTranslation()
  const { data: drivers } = useDrivers()
  const [search, setSearch] = useState('')

  const unverified = (drivers ?? []).filter((d) => d.is_verified !== true)
  const filtered = unverified.filter(
    (d) => d.full_name?.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search),
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('driversUnverified.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('driversUnverified.description')}</p>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('driversUnverified.search')}
            name="search" autoComplete="off" aria-label={t('driversUnverified.search')}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversUnverified.driver')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversUnverified.phone')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversUnverified.status')}</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('driversUnverified.documents')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((driver) => (
              <DriverUnverifiedRow key={driver.id} driver={driver} />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">{t('driversUnverified.noDrivers')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DriverUnverifiedRow({ driver }: { driver: Record<string, unknown> }) {
  const { t } = useTranslation()
  const { data: docs, isLoading } = useDriverDocuments(driver.id as string)
  const updateDoc = useUpdateDocumentStatus()
  const [expanded, setExpanded] = useState(false)

  const pendingDocs = (docs ?? []).filter((d: Record<string, unknown>) => d.status === 'pending')

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded) }}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm font-bold">{(driver.full_name as string)?.charAt(0) ?? '?'}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">{driver.full_name as string ?? t('driversUnverified.noName')}</span>
              {pendingDocs.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingDocs.length} {t('driversUnverified.pending')}
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{driver.phone as string}</td>
        <td className="px-4 py-3"><StatusBadge status="pending" /></td>
        <td className="px-4 py-3 text-sm text-gray-600">{(docs?.length ?? 0)} {t('driversUnverified.documentsCount')}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4} className="px-4 py-3 bg-gray-50">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-gray-400">{t('common.loading')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(docs ?? []).map((doc: Record<string, unknown>) => (
                  <div key={doc.id as string} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{(doc.document_type as string)?.replace(/_/g, ' ')}</p>
                      <StatusBadge status={doc.status as string} />
                    </div>
                    <div className="flex gap-1">
                      {doc.status !== 'approved' && (
                        <button type="button" onClick={async (e) => { e.stopPropagation(); try { await updateDoc.mutateAsync({ docId: doc.id as string, status: 'approved' }) } catch {} }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded" aria-label="Approve"><CheckCircle size={16} /></button>
                      )}
                      {doc.status !== 'rejected' && (
                        <button type="button" onClick={async (e) => { e.stopPropagation(); try { await updateDoc.mutateAsync({ docId: doc.id as string, status: 'rejected' }) } catch {} }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Reject"><XCircle size={16} /></button>
                      )}
                    </div>
                  </div>
                ))}
                {(!docs || docs.length === 0) && (
                  <p className="text-sm text-gray-400 col-span-3 py-4 text-center">{t('driversUnverified.noDocuments')}</p>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

