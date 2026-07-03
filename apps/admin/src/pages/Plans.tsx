import { useTranslation } from 'react-i18next'
import { DataTable, StatusBadge } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'

export function PlansPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('plans').select('*').order('price')
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('plans').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('plans').delete().eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => { const { error } = await supabase.from('plans').update(vals).eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: 0, duration_days: 30, commission_pct: 15, is_active: true })
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editingPlan) {
      await updateMutation.mutateAsync({ id: editingPlan.id, ...form })
    } else {
      await createMutation.mutateAsync(form)
    }
    setShowForm(false); setEditingPlan(null)
    setForm({ name: '', slug: '', description: '', price: 0, duration_days: 30, commission_pct: 15, is_active: true })
  }
  function handleEdit(plan: any) {
    setEditingPlan(plan)
    setForm({ name: plan.name, slug: plan.slug, description: plan.description ?? '', price: Number(plan.price), duration_days: plan.duration_days, commission_pct: plan.commission_pct, is_active: plan.is_active })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('plans.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('plans.description')}</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('plans.name'), sortable: true, render: (p: any) => <span className="font-medium">{p.name}</span> },
        { key: 'price', label: t('plans.price'), sortable: true, render: (p: any) => <span className="font-bold text-lg">${Number(p.price).toFixed(2)}</span> },
        { key: 'duration_days', label: t('plans.duration'), render: (p: any) => `${p.duration_days}${t('plans.days')}` },
        { key: 'commission_pct', label: t('plans.commission'), render: (p: any) => `${p.commission_pct}%` },
        { key: 'is_active', label: t('plans.active'), render: (p: any) => <StatusBadge status={p.is_active ? 'approved' : 'rejected'} /> },
        { key: '', label: '', width: 'w-24', render: (p: any) => (
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); handleEdit(p) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
            <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(p.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          </div>
        )},
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingPlan ? t('common.edit') : t('common.add')} {t('plans.title')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('plans.name')}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('plans.slug')}</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('plans.descriptionLabel')}</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('plans.priceLabel')}</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('plans.daysLabel')}</label><input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('plans.commLabel')}</label><input type="number" step="0.5" value={form.commission_pct} onChange={(e) => setForm({ ...form, commission_pct: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" /> {t('common.active')}</label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingPlan(null) }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{editingPlan ? t('common.save') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
