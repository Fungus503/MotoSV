import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function AppSettingsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*').order('key')
      if (error) throw error; return data ?? []
    },
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: string }) => {
      const { error } = await supabase.from('app_settings').update({ value }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-settings'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('settings.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'key', label: t('settings.key'), sortable: true, render: (s: any) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{s.key}</span> },
          { key: 'value', label: t('settings.value'), render: (s: any) => {
            if (s.type === 'boolean') return <span className={`text-sm font-medium ${s.value === 'true' ? 'text-green-600' : 'text-red-500'}`}>{s.value}</span>
            return <span className="text-sm font-medium">{s.value}</span>
          }},
          { key: 'type', label: t('settings.type'), render: (s: any) => <span className="text-xs text-gray-400 uppercase">{s.type}</span> },
          { key: 'description', label: t('settings.descriptionLabel'), render: (s: any) => <span className="text-xs text-gray-400">{s.description ?? '—'}</span> },
          { key: '', label: '', width: 'w-24', render: (s: any) => (
            <button onClick={() => {
              const v = prompt(t('settings.newValue'), s.value)
              if (v !== null) updateMutation.mutateAsync({ id: s.id, value: v })
            }} className="text-xs text-primary hover:underline">{t('settings.edit')}</button>
          )},
        ]}
        data={settings ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}
