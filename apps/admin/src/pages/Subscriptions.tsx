import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function SubscriptionsPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('driver_subscriptions').select('*, driver:driver_id(full_name), plan:plan_id(name, price)').order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('subscriptions.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('subscriptions.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'driver', label: t('subscriptions.driver'), render: (s: any) => s.driver?.full_name ?? '—' },
        { key: 'plan', label: t('subscriptions.plan'), render: (s: any) => s.plan?.name ?? '—' },
        { key: 'starts_at', label: t('subscriptions.start'), render: (s: any) => new Date(s.starts_at).toLocaleDateString(i18n.language) },
        { key: 'expires_at', label: t('subscriptions.expires'), render: (s: any) => new Date(s.expires_at).toLocaleDateString(i18n.language) },
        { key: 'status', label: t('subscriptions.status'), render: (s: any) => <StatusBadge status={s.status} /> },
      ]} data={data ?? []} loading={isLoading} searchable />
    </div>
  )
}

