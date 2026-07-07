import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export function DriverRulesPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-driver-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('driver_rules').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('driver_rules').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-driver-rules'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('driver_rules').delete().eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-driver-rules'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '' })
  async function handleSave(e: React.FormEvent) { e.preventDefault(); await createMutation.mutateAsync(form); setShowForm(false); setForm({ title: '', description: '' }) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('driverRules.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('driverRules.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('common.add')}</button>
      </div>
      <DataTable columns={[
        { key: 'title', label: t('driverRules.titleLabel'), sortable: true },
        { key: 'description', label: t('driverRules.descriptionLabel'), render: (r: any) => <span className="text-gray-500 truncate block max-w-xs">{r.description}</span> },
        { key: 'is_active', label: t('driverRules.active'), render: (r: any) => <span className={r.is_active ? 'text-green-600' : 'text-red-500'}>{r.is_active ? t('driverRules.yes') : t('driverRules.no')}</span> },
        { key: '', label: '', width: 'w-16', render: (r: any) => (
          <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(r.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
        )},
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('driverRules.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="dr-title" className="block text-sm font-medium text-gray-700 mb-1">{t('driverRules.titleLabel')}</label><input id="dr-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label htmlFor="dr-desc" className="block text-sm font-medium text-gray-700 mb-1">{t('driverRules.descriptionLabel')}</label><textarea id="dr-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} /></div>
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


