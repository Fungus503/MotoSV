import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Download } from 'lucide-react'
import { useState } from 'react'

export function ReportTransactionsPage() {
  const { t } = useTranslation()
  const { data } = useQuery({ queryKey: ['rpt-payments'], queryFn: async () => { const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(1000); return data ?? [] } })
  const [e, setE] = useState('')
  function exp() {
    if (!data?.length) { setE(t('reports.noData')); return }
    const csv = ['ID,Ride,Gateway,Amount,Status,Commission,Net,Date', ...data.map((p: any) => `"${p.id}","${p.ride_id}","${p.gateway}",${p.amount},"${p.status}",${p.gateway_fee ?? 0},${p.net_amount ?? p.amount},"${p.created_at}"`)].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' })); a.download = 'transactions.csv'; a.click()
  }
  return (<div><div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-gray-900">{t('reports.transactions')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('reports.transactionsDesc')}</p></div><button type="button" onClick={exp} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium"><Download size={16} /> {t('reports.exportCsv')}</button></div>{e && <p className="mb-4 text-sm text-red-600">{e}</p>}<div className="bg-white rounded-xl border border-gray-200 overflow-hidden"><table className="w-full"><thead><tr className="border-b bg-gray-50"><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('reports.rideLabel')}</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('reports.gateway')}</th><th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('reports.amount')}</th><th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{t('reports.status')}</th></tr></thead><tbody>{(data ?? []).slice(0, 50).map((p: any) => <tr key={p.id} className="border-b hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-600">{p.ride_id?.substring(0, 8)}</td><td className="px-4 py-3 text-sm">{p.gateway}</td><td className="px-4 py-3 text-sm text-right font-medium">${Number(p.amount).toFixed(2)}</td><td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-800' : p.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span></td></tr>)}</tbody></table></div></div>)
}
