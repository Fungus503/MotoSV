import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function ReviewsPage() {
  const { t, i18n } = useTranslation()
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ratings')
        .select('*, rater:rater_id(full_name, role), rated:rated_id(full_name, role), ride:ride_id(id, status)')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error; return data ?? []
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('reviews.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('reviews.description')}</p></div>
      </div>
      <DataTable
        columns={[
          { key: 'rater', label: t('reviews.from'), render: (r: any) => (
            <div><p className="font-medium text-sm">{r.rater?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{r.rater?.role}</p></div>
          )},
          { key: 'rated', label: t('reviews.to'), render: (r: any) => (
            <div><p className="font-medium text-sm">{r.rated?.full_name ?? '—'}</p><p className="text-xs text-gray-400">{r.rated?.role}</p></div>
          )},
          { key: 'rating', label: t('reviews.rating'), sortable: true, render: (r: any) => (
            <span className="text-yellow-500 font-bold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
          )},
          { key: 'comment', label: t('reviews.comment'), render: (r: any) => <span className="text-xs text-gray-500">{r.comment || '—'}</span> },
          { key: 'created_at', label: t('reviews.date'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleDateString(i18n.language) },
        ]}
        data={reviews ?? []}
        loading={isLoading}
        searchable
      />
    </div>
  )
}

