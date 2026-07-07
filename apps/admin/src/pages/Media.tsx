import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export function MediaPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: media, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: any) => {
      const { error } = await supabase.from('media').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-media'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-media'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ url: '', filename: '', alt_text: '' })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await createMutation.mutateAsync({ ...form, mime_type: '', file_size: 0 })
    setShowForm(false); setForm({ url: '', filename: '', alt_text: '' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('media.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('media.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('media.addBtn')}</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(media ?? []).map((m: any) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group relative">
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-2">
              {m.mime_type?.startsWith('image/') || (!m.mime_type) ? (
                <img src={m.url} alt={m.alt_text || m.filename} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <span className="text-3xl font-bold uppercase">{m.filename?.split('.').pop()}</span>
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-700 truncate font-medium">{m.filename}</p>
              <p className="text-xs text-gray-400">{m.file_size ? `${(m.file_size / 1024).toFixed(1)} ${t('media.kb')}` : ''}</p>
            </div>
            <button type="button" onClick={async () => { try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(m.id); } catch (e) { alert(handleError(e)) } }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow" aria-label={t('common.delete')}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      {(!media || media.length === 0) && !isLoading && (
        <div className="text-center py-12 text-gray-400 text-sm">{t('media.noMedia')}</div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('media.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="media-url" className="block text-sm font-medium text-gray-700 mb-1">{t('media.imageUrl')}</label><input id="media-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required placeholder={t('media.urlPlaceholder')} /></div>
              <div><label htmlFor="media-filename" className="block text-sm font-medium text-gray-700 mb-1">{t('media.filename')}</label><input id="media-filename" value={form.filename} onChange={(e) => setForm({ ...form, filename: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required placeholder={t('media.filePlaceholder')} /></div>
              <div><label htmlFor="media-alt" className="block text-sm font-medium text-gray-700 mb-1">{t('media.altText')}</label><input id="media-alt" value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder={t('media.altPlaceholder')} /></div>
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

