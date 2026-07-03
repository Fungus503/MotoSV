import { useTranslation } from 'react-i18next'
import { DataTable, StatusBadge } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { handleError } from '../lib/errors'

export function FleetVehiclesUnverifiedPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-fleet-vehicles-unverified'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet_vehicles').select('*, fleet_manager:fleet_manager_id(company_name), type:vehicle_type_id(name)').eq('is_verified', false).order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('fleet_vehicles').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-vehicles-unverified'] }),
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => { const { error } = await supabase.from('fleet_vehicles').update(vals).eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-vehicles-unverified'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('fleet_vehicles').delete().eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-vehicles-unverified'] }),
  })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ make: '', model: '', plate_number: '', capacity: 4, year: new Date().getFullYear(), color: '', is_verified: false })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) { await updateMutation.mutateAsync({ id: editing.id, ...form }) }
      else { await createMutation.mutateAsync(form) }
      setShowForm(false); setEditing(null)
      setForm({ make: '', model: '', plate_number: '', capacity: 4, year: new Date().getFullYear(), color: '', is_verified: false })
    } catch (e) { alert(handleError(e)) }
  }

  function handleEdit(item: any) {
    setEditing(item); setForm({ make: item.make, model: item.model ?? '', plate_number: item.plate_number ?? '', capacity: item.capacity ?? 4, year: item.year ?? new Date().getFullYear(), color: item.color ?? '', is_verified: item.is_verified }); setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('fleetVehicles.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('fleetVehicles.description')}</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('fleetVehicles.addBtn')}</button>
      </div>
      <DataTable columns={[
        { key: 'make', label: t('fleetVehicles.make'), sortable: true, render: (v: any) => <span className="font-medium">{v.make ?? '—'} {v.model ?? ''}</span> },
        { key: 'plate_number', label: t('fleetVehicles.plate') },
        { key: 'capacity', label: t('fleetVehicles.capacity'), render: (v: any) => `${v.capacity} pax` },
        { key: 'fleet_manager', label: t('fleetVehicles.fleet'), render: (v: any) => v.fleet_manager?.company_name ?? '—' },
        { key: 'is_verified', label: t('fleetVehicles.verified'), render: (v: any) => <StatusBadge status={v.is_verified ? 'approved' : 'pending'} /> },
        { key: 'created_at', label: t('fleetVehicles.date'), sortable: true, render: (v: any) => new Date(v.created_at).toLocaleDateString(i18n.language) },
        { key: '', label: '', width: 'w-24', render: (v: any) => (
          <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); handleEdit(v) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
            <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(v.id) } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          </div>
        )},
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => { setShowForm(false); setEditing(null) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{(editing ? t('common.edit') : t('common.add')) + ' ' + t('fleetVehicles.title')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetVehicles.make')}</label><input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetVehicles.plate')}</label><input value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetVehicles.capacity')}</label><input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Año</label><input type="number" min={2000} max={2030} value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{editing ? t('common.save') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
