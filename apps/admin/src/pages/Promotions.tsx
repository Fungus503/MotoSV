import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export function PromotionsPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })
  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('promotions').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  })
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: any) => { const { error } = await supabase.from('promotions').update(vals).eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('promotions').delete().eq('id', id); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promotions'] }),
  })
  const [showForm, setShowForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<any>(null)
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: 0, min_fare: 0, max_discount: 0, max_redemptions: 100, starts_at: '', expires_at: '', is_active: true })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      code: form.code,
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_fare: form.min_fare > 0 ? form.min_fare : null,
      max_discount: form.max_discount > 0 ? form.max_discount : null,
      max_redemptions: form.max_redemptions,
      starts_at: form.starts_at || new Date().toISOString(),
      expires_at: form.expires_at,
      is_active: form.is_active,
    }
    if (editingPromo) {
      await updateMutation.mutateAsync({ id: editingPromo.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    setShowForm(false); setEditingPromo(null)
    setForm({ code: '', description: '', discount_type: 'percentage', discount_value: 0, min_fare: 0, max_discount: 0, max_redemptions: 100, starts_at: '', expires_at: '', is_active: true })
  }

  function handleEdit(p: any) {
    setEditingPromo(p)
    setForm({
      code: p.code,
      description: p.description ?? '',
      discount_type: p.discount_type,
      discount_value: Number(p.discount_value),
      min_fare: Number(p.min_fare ?? 0),
      max_discount: Number(p.max_discount ?? 0),
      max_redemptions: p.max_redemptions ?? 100,
      starts_at: p.starts_at?.substring(0, 16) ?? '',
      expires_at: p.expires_at?.substring(0, 16) ?? '',
      is_active: p.is_active,
    })
    setShowForm(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('promotions.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('promotions.description')}</p></div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('promotions.addBtn')}</button>
      </div>
      <DataTable
        columns={[
          { key: 'code', label: t('promotions.code'), sortable: true, render: (r: any) => <span className="font-mono font-bold text-primary">{r.code}</span> },
          { key: 'discount_type', label: t('promotions.type'), render: (r: any) => <span className="capitalize">{r.discount_type === 'percentage' ? t('promotions.percentage') : t('promotions.fixed')}</span> },
          { key: 'discount_value', label: t('promotions.value'), sortable: true, render: (r: any) => r.discount_type === 'percentage' ? `${r.discount_value}%` : `$${Number(r.discount_value).toFixed(2)}` },
          { key: 'min_fare', label: t('promotions.minFare'), render: (r: any) => r.min_fare ? `$${Number(r.min_fare).toFixed(2)}` : '—' },
          { key: 'max_discount', label: t('promotions.maxDiscount'), render: (r: any) => r.max_discount ? `$${Number(r.max_discount).toFixed(2)}` : '—' },
          { key: 'current_redemptions', label: t('promotions.used'), sortable: true, render: (r: any) => `${r.current_redemptions}/${r.max_redemptions ?? '∞'}` },
          { key: 'expires_at', label: t('promotions.expires'), sortable: true, render: (r: any) => new Date(r.expires_at).toLocaleDateString(i18n.language) },
          { key: 'is_active', label: t('promotions.active'), render: (r: any) => <span className={`text-sm ${r.is_active ? 'text-green-600' : 'text-red-500'}`}>{r.is_active ? t('promotions.yes') : t('promotions.no')}</span> },
          { key: '', label: '', width: 'w-24', render: (r: any) => (
            <div className="flex items-center gap-1">
              <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(r) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
              <button type="button" onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(r.id) } catch (e) { alert(handleError(e)) } }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={promotions ?? []}
        loading={isLoading}
        searchable
      />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => { setShowForm(false); setEditingPromo(null) }} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowForm(false); setEditingPromo(null) } }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editingPromo ? t('common.edit') : t('common.add')} {t('promotions.title')}</h2>
            <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.code')} *</label><input id="promo-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                <div><label htmlFor="promo-type" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.discountType')}</label>
                  <select id="promo-type" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="percentage">{t('promotions.percentage')}</option>
                    <option value="fixed">{t('promotions.fixed')}</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="promo-value" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.discountValue')} *</label><input id="promo-value" type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                <div><label htmlFor="promo-redemptions" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.maxRedemptions')}</label><input id="promo-redemptions" type="number" value={form.max_redemptions} onChange={(e) => setForm({ ...form, max_redemptions: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div><label htmlFor="promo-desc" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.descriptionLabel')}</label><textarea id="promo-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="promo-min-fare" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.minFare')}</label><input id="promo-min-fare" type="number" step="0.01" value={form.min_fare} onChange={(e) => setForm({ ...form, min_fare: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label htmlFor="promo-max-discount" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.maxDiscount')}</label><input id="promo-max-discount" type="number" step="0.01" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="promo-starts" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.startsAt')}</label><input id="promo-starts" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                <div><label htmlFor="promo-expires" className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.expiresAt')} *</label><input id="promo-expires" type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" /> {t('common.active')}</label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingPromo(null) }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{editingPromo ? t('common.save') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


