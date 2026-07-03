import { useTranslation } from 'react-i18next'
import { DataTable, StatusBadge } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { ShieldOff, ShieldCheck } from 'lucide-react'

export function BlockedUsersPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [showBlock, setShowBlock] = useState(false)
  const [blockForm, setBlockForm] = useState({ user_id: '', reason: '' })

  const { data: blocked, isLoading } = useQuery({
    queryKey: ['blocked-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, is_blocked, blocked_at, block_reason, blocked_by, blocked:blocked_by(full_name)')
        .eq('is_blocked', true)
        .order('blocked_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  const { data: allUsers } = useQuery({
    queryKey: ['blocked-users-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .is('is_blocked', false)
        .order('full_name')
      if (error) throw error; return data ?? []
    },
    enabled: showBlock,
  })

  const blockMutation = useMutation({
    mutationFn: async ({ user_id, reason }: { user_id: string; reason: string }) => {
      const { data: admin } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_by: admin.user?.id,
        block_reason: reason,
      }).eq('id', user_id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blocked-users'] }); qc.invalidateQueries({ queryKey: ['blocked-users-all'] }) },
  })

  const unblockMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').update({
        is_blocked: false,
        block_reason: null,
        unblocked_at: new Date().toISOString(),
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocked-users'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('blockedUsers.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('blockedUsers.description')}</p>
        </div>
        <button onClick={() => setShowBlock(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700">
          <ShieldOff size={16} /> {t('blockedUsers.blockBtn')}
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'full_name', label: t('blockedUsers.name'), sortable: true, render: (r: any) => <span className="font-medium">{r.full_name ?? '—'}</span> },
          { key: 'email', label: t('blockedUsers.email') },
          { key: 'role', label: t('blockedUsers.role'), render: (r: any) => <StatusBadge status={r.role === 'admin' ? 'approved' : r.role === 'driver' ? 'assigned' : 'pending'} /> },
          { key: 'block_reason', label: t('blockedUsers.blockReason'), render: (r: any) => r.block_reason ?? '—' },
          { key: 'blocked_at', label: t('blockedUsers.blockedAt'), sortable: true, render: (r: any) => r.blocked_at ? new Date(r.blocked_at).toLocaleString() : '—' },
          { key: 'blocked', label: t('blockedUsers.blockedBy'), render: (r: any) => r.blocked?.full_name ?? '—' },
          { key: '', label: '', width: 'w-16', render: (r: any) => (
            <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('blockedUsers.unblockBtn') + '?')) await unblockMutation.mutateAsync(r.id) } catch (e) { alert(handleError(e)) } }}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded" title={t('blockedUsers.unblockBtn')}>
              <ShieldCheck size={14} />
            </button>
          )},
        ]}
        data={blocked ?? []}
        loading={isLoading}
        searchable
      />
      {showBlock && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowBlock(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('blockedUsers.blockTitle')}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!blockForm.user_id) { alert(t('blockedUsers.reasonRequired')); return }
              await blockMutation.mutateAsync(blockForm)
              setShowBlock(false); setBlockForm({ user_id: '', reason: '' })
            }} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('blockedUsers.name')}</label>
                <select value={blockForm.user_id} onChange={(e) => setBlockForm({ ...blockForm, user_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                  <option value="">—</option>
                  {(allUsers ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.full_name ?? u.email} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('blockedUsers.reasonLabel')}</label>
                <textarea value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBlock(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={blockMutation.isPending} className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">{t('blockedUsers.blockBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
