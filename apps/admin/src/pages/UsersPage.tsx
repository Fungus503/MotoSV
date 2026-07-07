import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function UsersPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', role: 'rider' })
  const [errorMsg, setErrorMsg] = useState('')
  const [creating, setCreating] = useState(false)

  const updateUser = useMutation({
    mutationFn: async ({ id, ...vals }: any) => {
      const { error } = await supabase.from('profiles').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  function openEdit(user: any) {
    setEditing(user); setErrorMsg('')
    setForm({ full_name: user.full_name ?? '', phone: user.phone ?? '', email: user.email ?? '', password: '', role: user.role })
    setShowForm(true)
  }

  function openCreate() {
    setEditing(null); setErrorMsg('')
    setForm({ full_name: '', phone: '', email: '', password: '', role: 'rider' })
    setShowForm(true)
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data.session?.user
      if (sessionUser?.id === id) throw new Error('cannotDeleteSelf')

      const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ''}`, 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to delete user')
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  async function handleDelete(userId: string) {
    const confirmed = confirm(t('users.confirmDelete'))
    if (!confirmed) return
    setDeletingId(userId)
    try { await deleteUser.mutateAsync(userId); alert(t('users.deleted')) }
    catch (e) { alert(t('users.deleteError') + ': ' + (e as Error).message) }
    finally { setDeletingId(null) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (editing) {
      await updateUser.mutateAsync({ id: editing.id, full_name: form.full_name, phone: form.phone, role: form.role })
      setShowForm(false)
      return
    }

    if (!form.email || !form.password) { setErrorMsg(t('users.passwordRequired')); return }
    if (form.password.length < 6) { setErrorMsg(t('users.passwordMinLength')); return }
    setCreating(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { role: form.role } },
      })
      if (authError) throw authError
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').update({
          full_name: form.full_name || null,
          phone: form.phone || null,
        }).eq('id', authData.user.id)
        if (profileError) throw profileError
      }
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setShowForm(false)
    } catch (err) {
      setErrorMsg((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('users.description')}</p></div>
        <button type="button" onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> {t('users.addBtn')}
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'full_name', label: t('users.name'), sortable: true },
          { key: 'phone', label: t('users.phone') },
          { key: 'email', label: t('users.email') },
          { key: 'role', label: t('users.role'), sortable: true, render: (r: any) => <StatusBadge status={r.role === 'admin' ? 'approved' : r.role === 'driver' ? 'assigned' : 'pending'} /> },
          { key: 'is_verified', label: t('users.verified'), render: (r: any) => <span className={`text-sm ${r.is_verified ? 'text-green-600' : 'text-gray-400'}`}>{r.is_verified ? t('common.yes') : t('common.no')}</span> },
          { key: 'created_at', label: t('users.createdAt'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleDateString(i18n.language) },
          { key: '', label: '', width: 'w-24', render: (r: any) => (
            <div className="flex gap-1">
              <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(r) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} disabled={deletingId === r.id}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={users ?? []}
        loading={isLoading}
        searchable
      />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? t('users.editTitle') : t('users.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">{t('users.name')}</label>
                <input id="user-name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label htmlFor="user-phone" className="block text-sm font-medium text-gray-700 mb-1">{t('users.phone')}</label>
                <input id="user-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              {!editing && (
                <>
                  <div><label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">{t('users.email')} *</label>
                    <input id="user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                  <div><label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">{t('users.passwordLabel')}</label>
                    <input id="user-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                </>
              )}
              <div><label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">{t('users.role')}</label>
                <select id="user-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="rider">{t('users.rider')}</option><option value="driver">{t('users.driver')}</option><option value="admin">{t('users.admin')}</option>
                </select></div>
              {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={updateUser.isPending || creating} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
                  {creating ? t('common.loading') : editing ? t('users.update') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


