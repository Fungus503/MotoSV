import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export function TestimonialsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: { name: string; role: string; content: string; rating: number }) => {
      const { error } = await supabase.from('testimonials').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('testimonials').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-testimonials'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: 'rider', content: '', rating: 5 })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await createMutation.mutateAsync(form)
    setShowForm(false); setForm({ name: '', role: 'rider', content: '', rating: 5 })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('testimonials.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('testimonials.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('testimonials.name'), sortable: true },
        { key: 'role', label: t('testimonials.role'), render: (r: any) => <span className="capitalize">{r.role}</span> },
        { key: 'content', label: t('testimonials.content'), render: (r: any) => <span className="text-gray-500 truncate block max-w-xs">{r.content?.substring(0, 80)}...</span> },
        { key: 'rating', label: t('testimonials.rating'), sortable: true, render: (r: any) => <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span> },
        { key: 'is_active', label: t('testimonials.active'), render: (r: any) => <span className={r.is_active ? 'text-green-600' : 'text-red-500'}>{r.is_active ? t('testimonials.yes') : t('testimonials.no')}</span> },
        { key: '', label: '', width: 'w-16', render: (r: any) => (
          <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(r.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
        )},
      ]} data={testimonials ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('testimonials.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="test-name" className="block text-sm font-medium text-gray-700 mb-1">{t('testimonials.name')}</label><input id="test-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="test-role" className="block text-sm font-medium text-gray-700 mb-1">{t('testimonials.role')}</label>
                <select id="test-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="rider">{t('testimonials.rider')}</option><option value="driver">{t('testimonials.driver')}</option>
                </select></div>
              <div><label htmlFor="test-content" className="block text-sm font-medium text-gray-700 mb-1">{t('testimonials.content')}</label>
                <textarea id="test-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} required /></div>
              <div><label htmlFor="test-rating" className="block text-sm font-medium text-gray-700 mb-1">{t('testimonials.ratingLabel')}</label>
                <select id="test-rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</option>)}
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


