import { useTranslation } from 'react-i18next'

const colors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  driver_arrived: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  paid: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-green-100 text-green-800',
  arrived: 'bg-indigo-100 text-indigo-800',
  started: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
  payment_pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  finding_driver: 'bg-blue-100 text-blue-800',
  expired: 'bg-gray-200 text-gray-600',
  driver_assigned: 'bg-teal-100 text-teal-800',
  withdrawn: 'bg-gray-100 text-gray-500',
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const cls = colors[status] ?? 'bg-gray-100 text-gray-800'
  const label = t('status.' + status, status)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
