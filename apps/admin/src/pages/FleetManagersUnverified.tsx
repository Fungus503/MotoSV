import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { handleError } from '../lib/errors'

export function FleetManagersUnverifiedPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-fleet-managers-unverified'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet_managers').select('*, user:user_id(full_name, phone)').eq('is_verified', false).order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('fleet_managers').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-managers-unverified'] }),
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => { const { error } = await supabase.from('fleet_managers').update(vals).eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-managers-unverified'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('fleet_managers').update({ is_active: false }).eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-managers-unverified'] }),
  })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ company_name: '', company_email: '', company_phone: '', tax_id: '', is_verified: false, is_active: true })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editing) { await updateMutation.mutateAsync({ id: editing.id, ...form }) }
    else { await createMutation.mutateAsync(form) }
    setShowForm(false); setEditing(null)
    setForm({ company_name: '', company_email: '', company_phone: '', tax_id: '', is_verified: false, is_active: true })
  }

  function handleEdit(item: any) {
    setEditing(item); setForm({ company_name: item.company_name, company_email: item.company_email ?? '', company_phone: item.company_phone ?? '', tax_id: item.tax_id ?? '', is_verified: item.is_verified, is_active: item.is_active }); setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('fleetManagers.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('fleetManagers.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'company_name', label: t('fleetManagers.name'), sortable: true, render: (f: any) => <span className="font-medium">{f.company_name ?? '—'}</span> },
        { key: 'company_email', label: t('fleetManagers.email') },
        { key: 'company_phone', label: t('fleetManagers.phone') },
        { key: 'tax_id', label: t('fleetManagers.taxId') },
        { key: 'is_active', label: t('fleetManagers.active'), render: (f: any) => <StatusBadge status={f.is_active ? 'approved' : 'rejected'} /> },
        { key: 'created_at', label: t('fleetManagers.date'), sortable: true, render: (f: any) => new Date(f.created_at).toLocaleDateString(i18n.language) },
        { key: '', label: '', width: 'w-24', render: (f: any) => (
          <div className="flex gap-1">
            <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(f) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
            <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(f.id) } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          </div>
        )},
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => { setShowForm(false); setEditing(null) }} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowForm(false); setEditing(null) } }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{(editing ? t('common.edit') : t('common.add')) + ' ' + t('fleetManagers.title')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label htmlFor="fmu-name" className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.name')}</label><input id="fmu-name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="fmu-email" className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.email')}</label><input id="fmu-email" type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label htmlFor="fmu-phone" className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.phone')}</label><input id="fmu-phone" value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div><label htmlFor="fmu-tax" className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.taxId')}</label><input id="fmu-tax" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" /> {t('common.active')}</label>
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


