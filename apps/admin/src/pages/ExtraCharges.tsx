import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function ExtraChargesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-extra-charges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('extra_charges').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => {
      const { error } = await supabase.from('extra_charges').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-extra-charges'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('extra_charges').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-extra-charges'] }),
  })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', charge_type: 'fixed', amount: 0, is_active: true })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) { await updateMutation.mutateAsync({ id: editing.id, ...form }) }
      else {
        const { error } = await supabase.from('extra_charges').insert(form)
        if (error) throw error
      }
      setShowForm(false); setEditing(null)
      setForm({ name: '', slug: '', charge_type: 'fixed', amount: 0, is_active: true })
    } catch (e) { alert(handleError(e)) }
  }

  function handleEdit(item: any) {
    setEditing(item)
    setForm({ name: item.name, slug: item.slug, charge_type: item.charge_type, amount: item.amount, is_active: item.is_active })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('extraCharges.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('extraCharges.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('extraCharges.name'), sortable: true },
        { key: 'charge_type', label: t('extraCharges.type'), render: (e: any) => <span className="uppercase text-xs">{e.charge_type === 'fixed' ? t('extraCharges.fixed') : t('extraCharges.percentage')}</span> },
        { key: 'amount', label: t('extraCharges.amount'), sortable: true, render: (e: any) => e.charge_type === 'fixed' ? `$${Number(e.amount).toFixed(2)}` : `${e.amount}%` },
        { key: 'is_active', label: t('extraCharges.active'), render: (e: any) => <span className={e.is_active ? 'text-green-600' : 'text-red-500'}>{e.is_active ? t('extraCharges.yes') : t('extraCharges.no')}</span> },
        { key: '', label: '', width: 'w-24', render: (e: any) => (
          <div className="flex gap-1">
            <button type="button" onClick={(ev) => { ev.stopPropagation(); handleEdit(e) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
            <button type="button" onClick={async (ev) => { ev.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(e.id) } catch (ex) { alert(handleError(ex)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          </div>
        )},
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => { setShowForm(false); setEditing(null) }} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowForm(false); setEditing(null) } }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{(editing ? t('common.edit') : t('common.add')) + ' ' + t('extraCharges.title')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="ec-name" className="block text-sm font-medium text-gray-700 mb-1">{t('extraCharges.name')}</label><input id="ec-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="ec-type" className="block text-sm font-medium text-gray-700 mb-1">{t('extraCharges.type')}</label>
                <select id="ec-type" value={form.charge_type} onChange={(e) => setForm({ ...form, charge_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="fixed">{t('extraCharges.fixed')}</option><option value="percentage">{t('extraCharges.percentage')}</option>
                </select></div>
              <div><label htmlFor="ec-amount" className="block text-sm font-medium text-gray-700 mb-1">{t('extraCharges.amount')}</label>
                <input id="ec-amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="ec_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <label htmlFor="ec_active" className="text-sm">{t('extraCharges.active')}</label></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{editing ? t('common.save') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


