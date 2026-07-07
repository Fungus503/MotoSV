import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export function CancellationReasonsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: reasons, isLoading } = useQuery({
    queryKey: ['admin-cancel-reasons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cancellation_reasons').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: { reason: string; applies_to: string }) => {
      const { error } = await supabase.from('cancellation_reasons').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cancel-reasons'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cancellation_reasons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cancel-reasons'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ reason: '', applies_to: 'both' })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await createMutation.mutateAsync(form)
    setShowForm(false); setForm({ reason: '', applies_to: 'both' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('cancellationReasons.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('cancellationReasons.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'reason', label: t('cancellationReasons.reason'), sortable: true },
        { key: 'applies_to', label: t('cancellationReasons.appliesTo'), sortable: true, render: (r: any) => <span className="capitalize">{r.applies_to}</span> },
        { key: 'is_active', label: t('cancellationReasons.active'), render: (r: any) => <StatusBadge status={r.is_active ? 'approved' : 'rejected'} /> },
        { key: '', label: '', width: 'w-16', render: (r: any) => (
          <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(r.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
        )},
      ]} data={reasons ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('cancellationReasons.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="cr-reason" className="block text-sm font-medium text-gray-700 mb-1">{t('cancellationReasons.reason')}</label>
                <textarea id="cr-reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} required /></div>
              <div><label htmlFor="cr-applies" className="block text-sm font-medium text-gray-700 mb-1">{t('cancellationReasons.appliesTo')}</label>
                <select id="cr-applies" value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="both">{t('cancellationReasons.both')}</option><option value="rider">{t('cancellationReasons.rider')}</option><option value="driver">{t('cancellationReasons.driver')}</option>
                </select></div>
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


