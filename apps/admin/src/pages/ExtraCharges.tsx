import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function ExtraChargesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-extra-charges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('extra_charges').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('extraCharges.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('extraCharges.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('extraCharges.name'), sortable: true },
        { key: 'charge_type', label: t('extraCharges.type'), render: (e: any) => <span className="uppercase text-xs">{e.charge_type === 'fixed' ? t('extraCharges.fixed') : t('extraCharges.percentage')}</span> },
        { key: 'amount', label: t('extraCharges.amount'), sortable: true, render: (e: any) => e.charge_type === 'fixed' ? `$${Number(e.amount).toFixed(2)}` : `${e.amount}%` },
        { key: 'is_active', label: t('extraCharges.active'), render: (e: any) => <span className={e.is_active ? 'text-green-600' : 'text-red-500'}>{e.is_active ? t('extraCharges.yes') : t('extraCharges.no')}</span> },
      ]} data={data ?? []} loading={isLoading} searchable />
    </div>
  )
}
