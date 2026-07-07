import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { useServiceCategories, useServiceTypes, useCreateServiceType, useDeleteServiceType } from '../lib/queries'
import { handleError } from '../lib/errors'

export function ServiceTypesPage() {
  const { t } = useTranslation()
  const { data: cats } = useServiceCategories()
  const [catFilter, setCatFilter] = useState('')
  const { data: types, isLoading } = useServiceTypes(catFilter || undefined)
  const createType = useCreateServiceType()
  const deleteType = useDeleteServiceType()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category_id: '', name: '', slug: '', base_fare: 2, per_km: 0.5, per_min: 0.1, min_fare: 3 })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await createType.mutateAsync({ ...form, base_fare: Number(form.base_fare), per_km: Number(form.per_km), per_min: Number(form.per_min), min_fare: Number(form.min_fare) })
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('serviceTypes.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('serviceTypes.description')}</p>
        </div>
        <button type="button" onClick={() => { setForm({ category_id: cats?.[0]?.id ?? '', name: '', slug: '', base_fare: 2, per_km: 0.5, per_min: 0.1, min_fare: 3 }); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button type="button" onClick={() => setCatFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!catFilter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{t('serviceTypes.all')}</button>
        {cats?.map((c: any) => (
          <button type="button" key={c.id} onClick={() => setCatFilter(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${catFilter === c.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: 'name', label: t('serviceTypes.name'), sortable: true },
          { key: 'category', label: t('serviceTypes.category'), render: (t) => t.category?.name ?? '—' },
          { key: 'base_fare', label: t('serviceTypes.baseFare'), sortable: true, render: (t) => `$${Number(t.base_fare).toFixed(2)}` },
          { key: 'per_km', label: t('serviceTypes.perKm'), render: (t) => `$${Number(t.per_km).toFixed(2)}` },
          { key: 'per_min', label: t('serviceTypes.perMin'), render: (t) => `$${Number(t.per_min).toFixed(2)}` },
          { key: 'min_fare', label: t('serviceTypes.minFare'), render: (t) => `$${Number(t.min_fare).toFixed(2)}` },
          { key: 'capacity', label: t('serviceTypes.capacity'), sortable: true },
          { key: 'actions', label: '', width: 'w-16', render: (t) => (
            <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteType.mutateAsync(t.id) } catch (e) { alert(handleError(e)) } }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          )},
        ]}
        data={types ?? []}
        loading={isLoading}
        searchable
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowForm(false) }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('serviceTypes.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label htmlFor="st-category" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.category')}</label>
                <select id="st-category" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                  {cats?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="st-name" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.name')}</label>
                  <input id="st-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
                <div>
                  <label htmlFor="st-slug" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.slug')}</label>
                  <input id="st-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="st-base-fare" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.baseFareLabel')}</label>
                  <input id="st-base-fare" type="number" step="0.01" value={form.base_fare} onChange={(e) => setForm({ ...form, base_fare: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label htmlFor="st-per-km" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.perKmLabel')}</label>
                  <input id="st-per-km" type="number" step="0.01" value={form.per_km} onChange={(e) => setForm({ ...form, per_km: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label htmlFor="st-per-min" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.perMinLabel')}</label>
                  <input id="st-per-min" type="number" step="0.01" value={form.per_min} onChange={(e) => setForm({ ...form, per_min: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label htmlFor="st-min-fare" className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTypes.minFareLabel')}</label>
                  <input id="st-min-fare" type="number" step="0.01" value={form.min_fare} onChange={(e) => setForm({ ...form, min_fare: +e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createType.isPending}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


