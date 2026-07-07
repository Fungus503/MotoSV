import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'

export function FAQsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('faqs').select('*').order('sort_order')
      if (error) throw error; return data ?? []
    },
  })
  const createFAQMutation = useMutation({
    mutationFn: async (vals: any) => {
      const { error } = await supabase.from('faqs').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })
  const updateFAQMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => {
      const { error } = await supabase.from('faqs').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })
  const deleteFAQMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ category: 'general', question: '', answer: '', sort_order: 0 })

  function openNew() {
    setEditing(null); setForm({ category: 'general', question: '', answer: '', sort_order: 0 }); setShowForm(true)
  }
  function openEdit(item: any) {
    setEditing(item); setForm({ category: item.category, question: item.question, answer: item.answer, sort_order: item.sort_order ?? 0 }); setShowForm(true)
  }
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editing) await updateFAQMutation.mutateAsync({ id: editing.id, ...form })
    else await createFAQMutation.mutateAsync(form)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('faqs.title')}</h1>          <p className="text-sm text-gray-400 mt-0.5">{t('faqs.description')}</p></div>
        <button type="button" onClick={openNew} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('faqs.addBtn')}</button>
      </div>
      <DataTable
        columns={[
          { key: 'question', label: t('faqs.question'), sortable: true },
          { key: 'category', label: t('faqs.category'), sortable: true, render: (r: any) => <span className="capitalize">{r.category}</span> },
          { key: 'answer', label: t('faqs.answer'), render: (r: any) => <span className="text-gray-500 truncate block max-w-xs">{r.answer?.substring(0, 80)}...</span> },
          { key: 'sort_order', label: t('faqs.sortOrder'), sortable: true },
          { key: 'is_active', label: t('faqs.active'), render: (r: any) => <span className={`text-sm ${r.is_active ? 'text-green-600' : 'text-red-500'}`}>{r.is_active ? t('faqs.active') : t('faqs.inactive')}</span> },
          { key: '', label: '', width: 'w-24', render: (r: any) => (
            <div className="flex gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteFAQMutation.mutateAsync(r.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={faqs ?? []}
        loading={isLoading}
        searchable
      />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? t('faqs.editTitle') : t('faqs.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="faq-category" className="block text-sm font-medium text-gray-700 mb-1">{t('faqs.category')}</label>
                <select id="faq-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="general">{t('faqs.general')}</option><option value="viajes">{t('faqs.rides')}</option><option value="pagos">{t('faqs.payments')}</option><option value="seguridad">{t('faqs.security')}</option><option value="cuenta">{t('faqs.account')}</option>
                </select></div>
              <div><label htmlFor="faq-question" className="block text-sm font-medium text-gray-700 mb-1">{t('faqs.question')}</label>
                <input id="faq-question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="faq-answer" className="block text-sm font-medium text-gray-700 mb-1">{t('faqs.answer')}</label>
                <textarea id="faq-answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={4} required /></div>
              <div><label htmlFor="faq-sort" className="block text-sm font-medium text-gray-700 mb-1">{t('faqs.sortOrder')}</label>
                <input id="faq-sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createFAQMutation.isPending || updateFAQMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{editing ? t('users.update') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


