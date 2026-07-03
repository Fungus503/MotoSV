import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { DataTable } from '../components'
import { useVehicleTypes, useCreateVehicleType, useDeleteVehicleType, useUpdateVehicleType } from '../lib/queries'
import { handleError } from '../lib/errors'

export function VehicleTypesPage() {
  const { t } = useTranslation()
  const { data: types, isLoading } = useVehicleTypes()
  const createType = useCreateVehicleType()
  const deleteType = useDeleteVehicleType()
  const updateType = useUpdateVehicleType()
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', capacity: 2, is_active: true })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editingType) {
      await updateType.mutateAsync({ id: editingType.id, ...form, capacity: Number(form.capacity) })
    } else {
      await createType.mutateAsync({ ...form, capacity: Number(form.capacity) })
    }
    setShowForm(false); setEditingType(null)
    setForm({ name: '', slug: '', description: '', icon: '', capacity: 2, is_active: true })
  }

  function handleEdit(v: any) {
    setEditingType(v)
    setForm({ name: v.name, slug: v.slug, description: v.description ?? '', icon: v.icon ?? '', capacity: v.capacity, is_active: v.is_active })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('vehicleTypes.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('vehicleTypes.description')}</p>
        </div>
        <button onClick={() => { setEditingType(null); setForm({ name: '', slug: '', description: '', icon: '', capacity: 2, is_active: true }); setShowForm(true) }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'icon', label: '', width: 'w-12', render: (v) => <span className="text-xl">{v.icon ?? '🚗'}</span> },
          { key: 'name', label: t('vehicleTypes.name'), sortable: true },
          { key: 'slug', label: t('vehicleTypes.slug') },
          { key: 'capacity', label: t('vehicleTypes.capacity'), sortable: true, render: (v) => `${v.capacity}${t('vehicleTypes.pax')}` },
          { key: 'luggage_capacity', label: t('vehicleTypes.luggage'), render: (v) => `${v.luggage_capacity ?? 0}${t('vehicleTypes.items')}` },
          { key: 'is_active', label: t('vehicleTypes.status'), render: (v: any) => <span className={`text-sm ${v.is_active ? 'text-green-600' : 'text-red-500'}`}>{v.is_active ? t('vehicleTypes.active') : t('vehicleTypes.inactive')}</span> },
          { key: 'actions', label: '', width: 'w-24', render: (v: any) => (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); handleEdit(v) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
              <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteType.mutateAsync(v.id) } catch (e) { alert(handleError(e)) } }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={types ?? []}
        loading={isLoading}
        searchable
      />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingType ? t('common.edit') : t('common.add')} {t('vehicleTypes.title')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicleTypes.name')}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicleTypes.slug')}</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicleTypes.icon')}</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('vehicleTypes.capacityLabel')}</label>
                <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" /> {t('common.active')}</label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingType(null) }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createType.isPending || updateType.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{editingType ? t('common.save') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
