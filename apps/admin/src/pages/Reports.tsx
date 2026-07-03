import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'

export function ReportsPage() {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportType, setReportType] = useState('rides')
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    setError('')
    let data: Record<string, string>[] = []
    const from = dateFrom || '1970-01-01'
    const to = dateTo || '2099-12-31'

    try {
      if (reportType === 'rides') {
        const { data: rides, error: err } = await supabase.from('rides').select('*, rider:rider_id(full_name, phone), driver:driver_id(full_name, phone)').gte('created_at', from).lte('created_at', to + 'T23:59:59Z').order('created_at', { ascending: false })
        if (err) throw err
        data = (rides ?? []).map((r: Record<string, any>) => ({
          ID: String(r.id ?? ''), [t('reports.passenger')]: r.rider?.full_name ?? '', [t('reports.driver')]: r.driver?.full_name ?? '',
          [t('reports.status')]: r.status, [t('reports.fare')]: String(r.final_fare ?? r.estimated_fare ?? 0),
          [t('reports.distance')]: r.distance_meters ? (r.distance_meters / 1000).toFixed(2) : '',
          [t('reports.date')]: String(r.created_at ?? ''),
        }))
      } else if (reportType === 'drivers') {
        const { data: drivers, error: err } = await supabase.from('profiles').select('*, driver_documents(*)').eq('role', 'driver')
        if (err) throw err
        data = (drivers ?? []).map((d: Record<string, any>) => ({
          [t('reports.name')]: d.full_name ?? '', [t('reports.phone')]: d.phone ?? '', [t('reports.verified')]: d.is_verified ? t('reports.yes') : t('reports.no'),
          [t('reports.documents')]: String((d.driver_documents ?? []).length), [t('reports.registration')]: String(d.created_at ?? ''),
        }))
      } else if (reportType === 'revenue') {
        const { data: payments, error: err } = await supabase.from('payments').select('*').gte('created_at', from).lte('created_at', to + 'T23:59:59Z')
        if (err) throw err
        data = (payments ?? []).map((p: Record<string, any>) => ({
          ID: String(p.id ?? ''), [t('reports.rideLabel')]: String(p.ride_id ?? ''), [t('reports.amount')]: String(p.amount ?? '0'),
          [t('reports.gateway')]: p.gateway ?? '', [t('reports.status')]: p.status ?? '', [t('reports.commission')]: String(p.gateway_fee ?? '0'),
          [t('reports.net')]: String(p.net_amount ?? p.amount ?? '0'), [t('reports.date')]: String(p.created_at ?? ''),
        }))
      }

    if (data.length === 0) { setError(t('reports.noData')); return }
    const keys = Object.keys(data[0]!)
      const csv = [keys.join(','), ...data.map((r) => keys.map((k) => `"${(r[k] ?? '')}"`).join(','))].join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${reportType}-${dateFrom || 'all'}-${dateTo || 'all'}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('reports.title')}</h1>
      <div className="max-w-lg">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.reportType')}</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="rides">{t('reports.rides')}</option>
              <option value="drivers">{t('reports.drivers')}</option>
              <option value="revenue">{t('reports.revenue')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.from')}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reports.to')}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button onClick={handleExport} disabled={exporting}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            <Download size={16} /> {exporting ? t('reports.exporting') : t('reports.exportCsv')}
          </button>
        </div>
      </div>
    </div>
  )
}
