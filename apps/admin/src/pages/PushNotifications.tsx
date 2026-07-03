import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function PushNotificationsPage() {
  const { t, i18n } = useTranslation()
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['admin-push-tokens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_tokens')
        .select('*, user:user_id(full_name, role)')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('pushNotifications.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('pushNotifications.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'user', label: t('pushNotifications.user'), render: (t: any) => (
            <div><p className="font-medium text-sm">{t.user?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{t.user?.role}</p></div>
          )},
          { key: 'platform', label: t('pushNotifications.platform'), sortable: true, render: (t: any) => (
            <span className={`uppercase text-xs ${t.platform === 'ios' ? 'text-blue-600' : t.platform === 'android' ? 'text-green-600' : 'text-gray-600'}`}>{t.platform}</span>
          )},
          { key: 'is_active', label: t('pushNotifications.active'), render: (t: any) => <span className={t.is_active ? 'text-green-600' : 'text-red-500'}>{t.is_active ? t('pushNotifications.yes') : t('pushNotifications.no')}</span> },
          { key: 'created_at', label: t('pushNotifications.registered'), sortable: true, render: (t: any) => new Date(t.created_at).toLocaleDateString(i18n.language) },
        ]}
        data={tokens ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
