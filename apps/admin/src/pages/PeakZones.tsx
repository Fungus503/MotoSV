import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useZones } from '../lib/queries'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'

const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const dayShort = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

export function PeakZonesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-peak-zones'],
    queryFn: async () => {
      const { data, error } = await supabase.from('peak_zones').select('*, zone:zone_id(name)').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const { data: zones } = useZones()
  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('peak_zones').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-peak-zones'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('peak_zones').delete().eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-peak-zones'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', zone_id: null as string | null, start_time: '07:00', end_time: '09:00', surge_multiplier: 1.5, days_of_week: [1,2,3,4,5] as number[] })
  async function handleSave(e: React.FormEvent) { e.preventDefault(); await createMutation.mutateAsync({ ...form, zone_id: form.zone_id || null }); setShowForm(false); setForm({ name: '', zone_id: null, start_time: '07:00', end_time: '09:00', surge_multiplier: 1.5, days_of_week: [1,2,3,4,5] }) }

  function toggleDay(d: number) {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(d) ? prev.days_of_week.filter((x) => x !== d) : [...prev.days_of_week, d].sort(),
    }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('peakZones.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('peakZones.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('peakZones.addBtn')}</button>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('peakZones.name'), sortable: true },
        { key: 'zone', label: t('peakZones.zone'), render: (p: any) => p.zone?.name ?? t('peakZones.allZones') },
        { key: 'days_of_week', label: t('peakZones.days'), render: (p: any) => p.days_of_week ? p.days_of_week.map((d: number) => dayShort[d]).join(' ') : t('peakZones.defaultDays') },
        { key: 'start_time', label: t('peakZones.from'), render: (p: any) => p.start_time?.substring(0, 5) },
        { key: 'end_time', label: t('peakZones.to'), render: (p: any) => p.end_time?.substring(0, 5) },
        { key: 'surge_multiplier', label: t('peakZones.surge'), sortable: true, render: (p: any) => <span className="font-bold text-primary">×{p.surge_multiplier}</span> },
        { key: 'is_active', label: t('peakZones.active'), render: (p: any) => <span className={p.is_active ? 'text-green-600' : 'text-red-500'}>{p.is_active ? t('common.yes') : t('common.no')}</span> },
        { key: '', label: '', width: 'w-16', render: (p: any) => (
          <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(p.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
        )},
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('peakZones.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="pz-name" className="block text-sm font-medium text-gray-700 mb-1">{t('peakZones.name')}</label><input id="pz-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="pz-zone" className="block text-sm font-medium text-gray-700 mb-1">{t('peakZones.zone')}</label>
                <select id="pz-zone" value={form.zone_id ?? ''} onChange={(e) => setForm({ ...form, zone_id: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">{t('peakZones.allZones')}</option>
                  {(zones ?? []).map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="pz-start" className="block text-sm font-medium text-gray-700 mb-1">{t('peakZones.startTime')}</label><input id="pz-start" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label htmlFor="pz-end" className="block text-sm font-medium text-gray-700 mb-1">{t('peakZones.endTime')}</label><input id="pz-end" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{t('peakZones.daysOfWeek')}</label>
                <div className="flex gap-1.5">
                  {dayLabels.map((_, i) => (
                    <button key={i} type="button" onClick={() => toggleDay(i)} aria-label={dayLabels[i]}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${form.days_of_week.includes(i) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {dayShort[i]}
                    </button>
                  ))}
                </div></div>
              <div><label htmlFor="pz-surge" className="block text-sm font-medium text-gray-700 mb-1">{t('peakZones.surgeMultiplier')}</label><input id="pz-surge" type="number" step="0.1" value={form.surge_multiplier} onChange={(e) => setForm({ ...form, surge_multiplier: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


