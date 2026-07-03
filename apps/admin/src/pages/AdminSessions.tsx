import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { LogOut } from 'lucide-react'

export function AdminSessionsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*, admin:admin_id(full_name, email)')
        .order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
    refetchInterval: 15000,
  })

  const terminateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_sessions').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sessions'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('adminSessions.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('adminSessions.description')}</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'admin', label: t('adminSessions.admin'), sortable: true, render: (r: any) => r.admin?.full_name ?? '—' },
          { key: 'ip_address', label: t('adminSessions.ipAddress'), render: (r: any) => <span className="font-mono text-xs">{r.ip_address ?? '—'}</span> },
          { key: 'user_agent', label: t('adminSessions.userAgent'), render: (r: any) => {
            const ua = r.user_agent ?? ''
            const short = ua.length > 40 ? ua.substring(0, 40) + '…' : ua
            return <span className="text-xs text-gray-500" title={ua}>{short || '—'}</span>
          }},
          { key: 'auth_method', label: t('adminSessions.authMethod'), render: (r: any) => <span className="capitalize">{r.auth_method}</span> },
          { key: 'last_active_at', label: t('adminSessions.lastActive'), sortable: true, render: (r: any) => r.last_active_at ? new Date(r.last_active_at).toLocaleString() : '—' },
          { key: 'expires_at', label: t('adminSessions.expires'), render: (r: any) => r.expires_at ? new Date(r.expires_at).toLocaleString() : '—' },
          { key: 'is_active', label: t('adminSessions.active'), render: (r: any) => (
            <span className={`text-sm ${r.is_active ? 'text-green-600' : 'text-red-500'}`}>
              {r.is_active ? t('adminSessions.active') : t('adminSessions.inactive')}
            </span>
          )},
          { key: '', label: '', width: 'w-16', render: (r: any) => r.is_active ? (
            <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('adminSessions.terminateConfirm'))) await terminateMutation.mutateAsync(r.id) } catch (e) { alert(handleError(e)) } }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded" title={t('adminSessions.terminate')}>
              <LogOut size={14} />
            </button>
          ) : null},
        ]}
        data={sessions ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
