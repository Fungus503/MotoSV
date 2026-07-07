import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Download } from 'lucide-react'
import { useState } from 'react'

function ReportBase({ queryKey, queryFn, filename, columns }: { queryKey: string[]; queryFn: () => Promise<any[]>; filename: string; columns: Record<string, string> }) {
  const { data } = useQuery({ queryKey, queryFn })
  const [e, setE] = useState('')
  const items: any[] = data ?? []

  function exp() {
    if (!items.length) { setE('No data to export'); return }
    const keys = Object.keys(columns)
    const csv = [keys.join(','), ...items.map((r: any) => keys.map((k: string) => `"${r[k] ?? ''}"`).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv' })); a.download = filename; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{filename.replace('.csv', '').replace(/-/g, ' ')} Report</h1></div>
        <button type="button" onClick={exp} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium"><Download size={16} /> Export CSV</button>
      </div>
      {e && <p className="mb-4 text-sm text-red-600">{e}</p>}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b bg-gray-50">{Object.entries(columns).map(([colKey, label]) => <th key={colKey} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{label}</th>)}</tr></thead>
          <tbody>{items.slice(0, 100).map((r, i) => <tr key={r.id ?? `row-${i}`} className="border-b hover:bg-gray-50">{Object.keys(columns).map((colKey) => <td key={colKey} className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r[colKey] ?? '—'}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

export function ReportTransactionsPage() { return <ReportBase queryKey={['rpt-payments']} queryFn={async () => { const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(500); return data ?? [] }} filename="transactions.csv" columns={{ id: 'ID', ride_id: 'Ride', gateway: 'Gateway', amount: 'Amount', status: 'Status', created_at: 'Date' }} /> }
export function ReportRidesPage() { return <ReportBase queryKey={['rpt-rides']} queryFn={async () => { const { data } = await supabase.from('rides').select('id, status, estimated_fare, final_fare, distance_meters, created_at').order('created_at', { ascending: false }).limit(500); return data ?? [] }} filename="rides.csv" columns={{ id: 'ID', status: 'Status', estimated_fare: 'Estimated', final_fare: 'Final', distance_meters: 'Distance', created_at: 'Date' }} /> }
export function ReportDriversPage() { return <ReportBase queryKey={['rpt-drivers']} queryFn={async () => { const { data } = await supabase.from('profiles').select('id, full_name, phone, email, is_verified, created_at').eq('role', 'driver').order('created_at', { ascending: false }); return data ?? [] }} filename="drivers.csv" columns={{ full_name: 'Name', phone: 'Phone', email: 'Email', is_verified: 'Verified', created_at: 'Registered' }} /> }
export function ReportCouponsPage() { return <ReportBase queryKey={['rpt-coupons']} queryFn={async () => { const { data } = await supabase.from('promotions').select('*, promo_redemptions(count)').order('created_at', { ascending: false }); return (data ?? []).map((p: any) => ({ ...p, redemptions: p.promo_redemptions?.[0]?.count ?? 0 })) }} filename="coupons.csv" columns={{ code: 'Code', discount_type: 'Type', discount_value: 'Value', redemptions: 'Uses', max_redemptions: 'Max', expires_at: 'Expires' }} /> }
export function ReportZonesPage() { return <ReportBase queryKey={['rpt-zones']} queryFn={async () => { const { data } = await supabase.from('zones').select('*').order('name'); return data ?? [] }} filename="zones.csv" columns={{ name: 'Name', slug: 'Slug', is_active: 'Active', created_at: 'Created' }} /> }
export function ReportIncentivesPage() { return <ReportBase queryKey={['rpt-incentives']} queryFn={async () => { const { data } = await supabase.from('commissions').select('*, ride:ride_id(final_fare), driver:driver_id(full_name)').order('created_at', { ascending: false }).limit(500); return (data ?? []).map((c: any) => ({ ...c, driver_name: c.driver?.full_name ?? '', ride_fare: c.ride?.final_fare ?? 0 })) }} filename="incentives.csv" columns={{ driver_name: 'Driver', amount: 'Amount', commission_pct: 'Rate %', commission_amount: 'Commission', ride_fare: 'Ride Fare', created_at: 'Date' }} /> }
