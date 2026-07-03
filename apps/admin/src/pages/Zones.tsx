import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { DataTable } from '../components'
import { useZones, useCreateZone, useDeleteZone } from '../lib/queries'
import { handleError } from '../lib/errors'

export function ZonesPage() {
  const { t } = useTranslation()
  const { data: zones, isLoading } = useZones()
  const createZone = useCreateZone()
  const deleteZone = useDeleteZone()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', description: '', lat: 13.6989, lng: -89.2185 })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await createZone.mutateAsync(form)
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('zones.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('zones.description')}</p>
        </div>
        <button onClick={() => { setForm({ name: '', slug: '', description: '', lat: 13.6989, lng: -89.2185 }); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'name', label: t('zones.name'), sortable: true },
          { key: 'slug', label: t('zones.slug') },
          { key: 'description', label: t('zones.descriptionLabel') },
          { key: 'center', label: t('zones.center'), render: (z: any) => {
            if (!z.center?.coordinates) return '—'
            return `${z.center.coordinates[1].toFixed(4)}, ${z.center.coordinates[0].toFixed(4)}`
          }},
          { key: 'is_active', label: t('zones.status'), render: (z: any) => <span className={`text-sm ${z.is_active ? 'text-green-600' : 'text-red-500'}`}>{z.is_active ? t('zones.active') : t('zones.inactive')}</span> },
          { key: 'actions', label: '', width: 'w-16', render: (z: any) => (
            <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteZone.mutateAsync(z.id) } catch (e) { alert(handleError(e)) } }}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
          )},
        ]}
        data={zones ?? []}
        loading={isLoading}
        searchable
        searchPlaceholder={t('zones.search')}
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('zones.addTitle')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.name')}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.slug')}</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.descriptionLabel')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.latitude')}</label>
                  <input type="number" step="0.0001" value={form.lat} onChange={(e) => setForm({ ...form, lat: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.longitude')}</label>
                  <input type="number" step="0.0001" value={form.lng} onChange={(e) => setForm({ ...form, lng: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createZone.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
