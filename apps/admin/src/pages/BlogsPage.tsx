import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export function BlogsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: { title: string; slug: string; content?: string; category?: string }) => {
      const { error } = await supabase.from('blogs').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blogs'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blogs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blogs'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', slug: '', content: '', category: 'general' })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await createMutation.mutateAsync({ ...form, content: form.content || undefined })
    setShowForm(false); setForm({ title: '', slug: '', content: '', category: 'general' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('blogs.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('blogs.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'title', label: t('blogs.titleLabel'), sortable: true },
        { key: 'category', label: t('blogs.category'), render: (b: any) => <span className="capitalize">{b.category ?? 'general'}</span> },
        { key: 'is_published', label: t('blogs.published'), render: (b: any) => <span className={b.is_published ? 'text-green-600' : 'text-gray-400'}>{b.is_published ? t('blogs.published') : t('blogs.draft')}</span> },
        { key: 'created_at', label: t('blogs.date'), sortable: true, render: (b: any) => new Date(b.created_at).toLocaleDateString(i18n.language) },
        { key: '', label: '', width: 'w-16', render: (b: any) => (
          <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(b.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
        )},
      ]} data={blogs ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('blogs.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="blog-title" className="block text-sm font-medium text-gray-700 mb-1">{t('blogs.titleLabel')}</label><input id="blog-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="blog-slug" className="block text-sm font-medium text-gray-700 mb-1">{t('blogs.slug')}</label><input id="blog-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="blog-category" className="block text-sm font-medium text-gray-700 mb-1">{t('blogs.category')}</label>
                <select id="blog-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="general">{t('blogs.general')}</option><option value="news">{t('blogs.news')}</option><option value="updates">{t('blogs.updates')}</option><option value="guides">{t('blogs.guides')}</option>
                </select></div>
              <div><label htmlFor="blog-content" className="block text-sm font-medium text-gray-700 mb-1">{t('blogs.contentHtml')}</label>
                <textarea id="blog-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" rows={6} /></div>
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


