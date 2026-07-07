import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, FileText } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'

export function DriverDocumentsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { data: docs, isLoading } = useQuery({
    queryKey: ['all-pending-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_documents')
        .select('*, driver:driver_id(id, full_name, phone)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data ?? []
    },
    refetchInterval: 15000,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: user } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('driver_documents')
        .update({ status, reviewed_by: user.user?.id })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-pending-documents'] })
      qc.invalidateQueries({ queryKey: ['driver-documents'] })
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('driverDocuments.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('driverDocuments.description')}</p>
        </div>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.message}
          <button type="button" onClick={() => setToast(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      <DataTable
        columns={[
          { key: 'driver', label: t('driverDocuments.driver'), sortable: true, render: (r: Record<string, unknown>) => {
            const driver = r.driver as Record<string, unknown> ?? {}
            return (
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-gray-400" />
                <span className="font-medium">{driver.full_name as string ?? '—'}</span>
              </div>
            )
          }},
          { key: 'phone', label: t('driverDocuments.phone'), render: (r: Record<string, unknown>) => {
            const driver = r.driver as Record<string, unknown> ?? {}
            return <span className="text-gray-600">{driver.phone as string ?? '—'}</span>
          }},
          { key: 'document_type', label: t('driverDocuments.type'), sortable: true, render: (r: Record<string, unknown>) => (
            <span className="capitalize">{(r.document_type as string)?.replace(/_/g, ' ')}</span>
          )},
          { key: 'status', label: t('driverDocuments.status'), render: (r: Record<string, unknown>) => <StatusBadge status={r.status as string} /> },
          { key: 'created_at', label: t('driverDocuments.date'), sortable: true, render: (r: Record<string, unknown>) => new Date(r.created_at as string).toLocaleDateString() },
          { key: 'actions', label: '', width: 'w-24', render: (r: Record<string, unknown>) =>
            r.status === 'pending' ? (
              <div className="flex gap-1">
                <button type="button" onClick={async (e) => { e.stopPropagation(); try { await updateMutation.mutateAsync({ id: r.id as string, status: 'approved' }); setToast({ message: t('driverDocuments.approvedToast'), type: 'success' }) } catch (e) { setToast({ message: handleError(e), type: 'error' }) } }}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50" disabled={updateMutation.isPending}><CheckCircle size={16} /></button>
                <button type="button" onClick={async (e) => { e.stopPropagation(); try { await updateMutation.mutateAsync({ id: r.id as string, status: 'rejected' }); setToast({ message: t('driverDocuments.rejectedToast'), type: 'success' }) } catch (e) { setToast({ message: handleError(e), type: 'error' }) } }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" disabled={updateMutation.isPending}><XCircle size={16} /></button>
              </div>
            ) : <StatusBadge status={r.status as string} />,
          },
        ]}
        data={docs ?? []}
        loading={isLoading}
        searchable
        emptyMessage={t('driverDocuments.noDocuments')}
      />
    </div>
  )
}

