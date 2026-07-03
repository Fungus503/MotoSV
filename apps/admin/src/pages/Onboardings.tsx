import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function OnboardingsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-onboardings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('banners').select('*').eq('position', 'onboarding').order('sort_order')
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('onboardings.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('onboardings.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'title', label: t('onboardings.titleLabel'), sortable: true },
        { key: 'image_url', label: t('onboardings.imageUrl'), render: (b: any) => <span className="text-xs text-blue-600 truncate block max-w-[200px]">{b.image_url}</span> },
        { key: 'sort_order', label: t('onboardings.order'), sortable: true },
        { key: 'is_active', label: t('onboardings.active'), render: (b: any) => <span className={b.is_active ? 'text-green-600' : 'text-red-500'}>{b.is_active ? t('onboardings.yes') : t('onboardings.no')}</span> },
      ]} data={data ?? []} loading={isLoading} searchable emptyMessage={t('onboardings.noScreens')} />
    </div>
  )
}
