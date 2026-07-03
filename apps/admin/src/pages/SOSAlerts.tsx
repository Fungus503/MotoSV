import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'

export function SOSPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin-sos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('panic_alerts')
        .select('*, reporter:reporter_id(full_name, phone), ride:ride_id(id, status)')
        .order('created_at', { ascending: false }).limit(100)
      if (error) throw error; return data ?? []
    },
    refetchInterval: 15000,
  })

  const resolveMutation = useMutation({
    mutationFn: async ({ id, resolved }: { id: string; resolved: boolean }) => {
      const { error } = await supabase.from('panic_alerts').update({
        status: resolved ? 'resolved' : 'false_alarm'
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sos'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('sos.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('sos.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'reporter', label: t('sos.reporter'), render: (a: any) => (
            <div><p className="font-medium text-sm">{a.reporter?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{a.reporter?.phone ?? ''}</p></div>
          )},
          { key: 'alert_type', label: t('sos.type'), sortable: true, render: (a: any) => {
            const icons: Record<string, string> = { emergency: '🚨', accident: '💥', harassment: '⚠️', other: '❓' }
            return <span>{icons[a.alert_type] ?? '❓'} {a.alert_type}</span>
          }},
          { key: 'status', label: t('sos.status'), render: (a: any) => {
            const colors: Record<string, string> = { active: 'bg-red-100 text-red-800', resolved: 'bg-green-100 text-green-800', false_alarm: 'bg-gray-100 text-gray-600' }
            return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[a.status] ?? ''}`}>{a.status}</span>
          }},
          { key: 'notes', label: t('sos.notes'), render: (a: any) => <span className="text-xs text-gray-500 truncate max-w-[200px] block">{a.notes ?? '—'}</span> },
          { key: 'created_at', label: t('sos.date'), sortable: true, render: (a: any) => new Date(a.created_at).toLocaleString(i18n.language) },
          { key: 'actions', label: '', width: 'w-32', render: (a: any) => a.status === 'active' ? (
            <div className="flex gap-1">
              <button onClick={async (e) => { e.stopPropagation(); try { await resolveMutation.mutateAsync({ id: a.id, resolved: true }) } catch (e) { alert(handleError(e)) } }}
                className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100">{t('sos.resolve')}</button>
              <button onClick={async (e) => { e.stopPropagation(); try { await resolveMutation.mutateAsync({ id: a.id, resolved: false }) } catch (e) { alert(handleError(e)) } }}
                className="px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100">{t('sos.false')}</button>
            </div>
          ) : null },
        ]}
        data={alerts ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
