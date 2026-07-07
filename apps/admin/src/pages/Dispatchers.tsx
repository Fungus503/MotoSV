import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { Plus } from 'lucide-react'

export function DispatchersPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dispatchers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('dispatchers').select('*, user:user_id(full_name, phone, email)').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (vals: { user_id: string; is_active: boolean }) => {
      const { error } = await supabase.from('dispatchers').insert(vals)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-dispatchers'] }),
  })

  const [showForm, setShowForm] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles-search', searchUser],
    queryFn: async () => {
      if (!searchUser || searchUser.length < 2) return []
      const { data, error } = await supabase.from('profiles').select('id, full_name, email').or(`full_name.ilike.%${searchUser}%,email.ilike.%${searchUser}%`).limit(10)
      if (error) throw error; return data ?? []
    },
    enabled: searchUser.length >= 2,
  })

  async function handleCreate() {
    if (!selectedUserId) return
    setSaving(true)
    try {
      await createMutation.mutateAsync({ user_id: selectedUserId, is_active: true })
      setShowForm(false); setSelectedUserId(null); setSearchUser('')
    } catch (e) { alert(handleError(e)) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('dispatchers.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('dispatchers.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium"><Plus size={16} /> {t('dispatchers.addBtn')}</button>
      </div>
      <DataTable columns={[
        { key: 'user', label: t('dispatchers.name'), sortable: true, render: (d: any) => <div><p className="font-medium">{d.user?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{d.user?.email}</p></div> },
        { key: 'user', label: t('dispatchers.phone'), render: (d: any) => d.user?.phone ?? '—' },
        { key: 'is_active', label: t('dispatchers.active'), render: (d: any) => <StatusBadge status={d.is_active ? 'approved' : 'rejected'} /> },
        { key: 'created_at', label: t('dispatchers.added'), sortable: true, render: (d: any) => new Date(d.created_at).toLocaleDateString(i18n.language) },
      ]} data={data ?? []} loading={isLoading} searchable />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => { setShowForm(false); setSelectedUserId(null); setSearchUser('') }} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowForm(false); setSelectedUserId(null); setSearchUser('') } }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('dispatchers.addBtn')}</h2>
            <div className="space-y-3">
              <div><label htmlFor="disp-search" className="block text-sm font-medium text-gray-700 mb-1">{t('dispatchers.searchUser')}</label>
                <input id="disp-search" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder={t('dispatchers.searchPlaceholder')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              {profiles && profiles.length > 0 && (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {profiles.map((p: any) => (
                    <div key={p.id} onClick={() => { setSelectedUserId(p.id); setSearchUser(p.full_name ?? p.email) }} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedUserId(p.id); setSearchUser(p.full_name ?? p.email) } }}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedUserId === p.id ? 'bg-primary/10' : ''}`}>
                      {p.full_name ?? '—'} <span className="text-gray-400 text-xs">{p.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedUserId && <p className="text-xs text-green-600">{t('dispatchers.userSelected')}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setSelectedUserId(null); setSearchUser('') }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="button" onClick={handleCreate} disabled={!selectedUserId || saving} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">{saving ? t('common.saving') : t('common.create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


