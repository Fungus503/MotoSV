import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { DataTable, StatusBadge } from '../components'
import { useServiceCategories, useCreateServiceCategory, useUpdateServiceCategory, useDeleteServiceCategory } from '../lib/queries'
import { handleError } from '../lib/errors'

export function ServiceCategoriesPage() {
  const { t } = useTranslation()
  const { data: cats, isLoading } = useServiceCategories()
  const createCat = useCreateServiceCategory()
  const updateCat = useUpdateServiceCategory()
  const deleteCat = useDeleteServiceCategory()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', sort_order: 0 })

  function openNew() {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', icon: '', sort_order: 0 })
    setShowForm(true)
  }

  function openEdit(cat: any) {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', icon: cat.icon ?? '', sort_order: cat.sort_order ?? 0 })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (editing) {
      await updateCat.mutateAsync({ id: editing.id, name: form.name, description: form.description, icon: form.icon })
    } else {
      await createCat.mutateAsync({ name: form.name, slug: form.slug, description: form.description, icon: form.icon, sort_order: form.sort_order })
    }
    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('serviceCategories.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('serviceCategories.description')}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>

      <DataTable
        columns={[
          { key: 'icon', label: '', width: 'w-12', render: (c) => <span className="text-xl">{c.icon ?? '📁'}</span> },
          { key: 'name', label: t('serviceCategories.name'), sortable: true },
          { key: 'slug', label: t('serviceCategories.slug'), sortable: true },
          { key: 'description', label: t('serviceCategories.descriptionLabel') },
          { key: 'sort_order', label: t('serviceCategories.order'), sortable: true },
          { key: 'is_active', label: t('serviceCategories.status'), render: (c) => <StatusBadge status={c.is_active ? 'approved' : 'rejected'} /> },
          { key: 'actions', label: '', width: 'w-24', render: (c) => (
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); openEdit(c) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
              <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteCat.mutateAsync(c.id); } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={cats ?? []}
        loading={isLoading}
        searchable
      />

      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? t('serviceCategories.edit') : t('common.add')} {t('serviceCategories.categoryLabel')}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceCategories.name')}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceCategories.slug')}</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceCategories.descriptionLabel')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceCategories.icon')}</label>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createCat.isPending || updateCat.isPending}
                  className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
                  {editing ? t('serviceCategories.update') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
