import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function WalletAdminPage() {
  const { t, i18n } = useTranslation()
  const { data: wallets, isLoading } = useQuery({
    queryKey: ['admin-wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*, user:user_id(full_name, phone, role)')
        .order('balance', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('wallet.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('wallet.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'user', label: t('wallet.user'), sortable: true, render: (w: any) => (
            <div><p className="font-medium">{w.user?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{w.user?.role}</p></div>
          )},
          { key: 'balance', label: t('wallet.balance'), sortable: true, render: (w: any) => <span className="font-bold text-lg">${Number(w.balance).toFixed(2)}</span> },
          { key: 'currency', label: t('wallet.currency') },
          { key: 'created_at', label: t('wallet.created'), render: (w: any) => new Date(w.created_at).toLocaleDateString(i18n.language) },
        ]}
        data={wallets ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
