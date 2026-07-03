import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function ChatsAdminPage() {
  const { t, i18n } = useTranslation()
  const { data: msgs, isLoading } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, role), ride:ride_id(pickup_address)')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
    refetchInterval: 10000,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('chats.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('chats.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'sender', label: t('chats.from'), render: (m: any) => (
            <div><p className="font-medium text-sm">{m.sender?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{m.sender?.role}</p></div>
          )},
          { key: 'content', label: t('chats.message'), render: (m: any) => <span className="text-sm truncate max-w-[300px] block">{m.content}</span> },
          { key: 'ride', label: t('chats.ride'), render: (m: any) => <span className="text-xs text-gray-500 truncate max-w-[150px] block">{m.ride?.pickup_address ?? '—'}</span> },
          { key: 'created_at', label: t('chats.time'), sortable: true, render: (m: any) => new Date(m.created_at).toLocaleString(i18n.language) },
        ]}
        data={msgs ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
