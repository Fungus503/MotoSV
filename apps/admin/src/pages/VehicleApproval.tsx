import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { CheckCircle, XCircle } from 'lucide-react'

export function VehicleApprovalPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { data: approvals, isLoading } = useQuery({
    queryKey: ['vehicle-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_approvals')
        .select('*, driver_vehicle:driver_vehicle_id(*, driver:driver_id(full_name), vehicle:vehicle_type_id(name))')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error; return data ?? []
    },
    refetchInterval: 10000,
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, review_notes }: { id: string; status: string; review_notes?: string }) => {
      const [{ data: admin }, { data: pending }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('vehicle_approvals').select('id').eq('driver_vehicle_id', id).eq('status', 'pending').limit(1).maybeSingle(),
      ])

      if (pending) {
        const { error } = await supabase
          .from('vehicle_approvals')
          .update({ status, review_notes: review_notes ?? null, reviewed_by: admin.user?.id })
          .eq('id', pending.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('vehicle_approvals').insert({
          driver_vehicle_id: id,
          status,
          review_notes: review_notes ?? null,
          reviewed_by: admin.user?.id,
        })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-approvals'] }),
    onError: (e) => handleError(e),
  })

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vehicleApproval.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('vehicleApproval.description')}</p>
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
          { key: 'driver_name', label: t('vehicleApproval.driver'), sortable: true, render: (r: any) => r.driver_vehicle?.driver?.full_name ?? '—' },
          { key: 'vehicle_name', label: t('vehicleApproval.vehicle'), render: (r: any) => r.driver_vehicle?.vehicle?.name ?? '—' },
          { key: 'plate', label: t('vehicleApproval.plate'), render: (r: any) => r.driver_vehicle?.plate_number ?? '—' },
          { key: 'status', label: t('vehicleApproval.status'), render: (r: any) => {
            const colors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }
            return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[r.status] ?? 'bg-gray-100 text-gray-800'}`}>{t('vehicleApproval.' + r.status)}</span>
          }},
          { key: 'created_at', label: t('vehicleApproval.date'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleString() },
          { key: 'actions', label: '', width: 'w-24', render: (r: any) => r.status === 'pending' ? (
            <div className="flex gap-1">
              <button type="button" onClick={async (e) => { e.stopPropagation(); try { await reviewMutation.mutateAsync({ id: r.driver_vehicle_id, status: 'approved' }); setToast({ message: t('vehicleApproval.approvedToast'), type: 'success' }) } catch (e) { setToast({ message: handleError(e), type: 'error' }) } }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50" disabled={reviewMutation.isPending}><CheckCircle size={16} /></button>
              <button type="button" onClick={async (e) => { e.stopPropagation(); try { await reviewMutation.mutateAsync({ id: r.driver_vehicle_id, status: 'rejected' }); setToast({ message: t('vehicleApproval.rejectedToast'), type: 'success' }) } catch (e) { setToast({ message: handleError(e), type: 'error' }) } }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50" disabled={reviewMutation.isPending}><XCircle size={16} /></button>
            </div>
          ) : null},
        ]}
        data={approvals ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}

