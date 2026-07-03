import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function ReferralsPage() {
  const { t, i18n } = useTranslation()
  const { data: referrals, isLoading } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*, referrer:referrer_id(full_name, phone), referred:referred_id(full_name, phone)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('referrals.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('referrals.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'referrer', label: t('referrals.referrer'), sortable: true, render: (r: any) => r.referrer?.full_name ?? '—' },
          { key: 'referred', label: t('referrals.referred'), render: (r: any) => r.referred?.full_name ?? '—' },
          { key: 'status', label: t('referrals.status'), render: (r: any) => {
            const colors: Record<string, string> = { pending: 'text-yellow-600', completed: 'text-green-600', rewarded: 'text-blue-600' }
            return <span className={`text-sm font-medium ${colors[r.status] ?? ''}`}>{r.status}</span>
          }},
          { key: 'reward_amount', label: t('referrals.reward'), render: (r: any) => r.reward_amount ? `$${Number(r.reward_amount).toFixed(2)}` : '—' },
          { key: 'created_at', label: t('referrals.date'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleDateString(i18n.language) },
        ]}
        data={referrals ?? []}
        loading={isLoading}
        searchable
        emptyMessage={t('referrals.noReferrals')}
      />
    </div>
  )
}
