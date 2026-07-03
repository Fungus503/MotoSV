import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
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
      const { data: admin } = await supabase.auth.getUser()
      const { error } = await supabase.from('vehicle_approvals').insert({
        driver_vehicle_id: id,
        status,
        review_notes: review_notes ?? null,
        reviewed_by: admin.user?.id,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-approvals'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vehicleApproval.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('vehicleApproval.description')}</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'driver_vehicle', label: t('vehicleApproval.driver'), sortable: true, render: (r: any) => r.driver_vehicle?.driver?.full_name ?? '—' },
          { key: 'vehicle', label: t('vehicleApproval.vehicle'), render: (r: any) => r.driver_vehicle?.vehicle?.name ?? '—' },
          { key: 'plate', label: t('vehicleApproval.plate'), render: (r: any) => r.driver_vehicle?.plate_number ?? '—' },
          { key: 'status', label: t('vehicleApproval.status'), render: (r: any) => {
            const colors: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }
            return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[r.status] ?? 'bg-gray-100 text-gray-800'}`}>{t('vehicleApproval.' + r.status)}</span>
          }},
          { key: 'created_at', label: t('vehicleApproval.date'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleString() },
          { key: '', label: '', width: 'w-24', render: (r: any) => r.status === 'pending' ? (
            <div className="flex gap-1">
              <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('vehicleApproval.approveConfirm'))) await reviewMutation.mutateAsync({ id: r.driver_vehicle_id, status: 'approved' }) } catch (e) { alert(handleError(e)) } }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={16} /></button>
              <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('vehicleApproval.rejectConfirm'))) await reviewMutation.mutateAsync({ id: r.driver_vehicle_id, status: 'rejected' }) } catch (e) { alert(handleError(e)) } }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"><XCircle size={16} /></button>
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
