import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { handleError } from '../lib/errors'

export function FleetManagersAddPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ company_name: '', company_email: '', company_phone: '', tax_id: '', is_verified: true, is_active: true })

  const createMutation = useMutation({
    mutationFn: async (vals: any) => { const { error } = await supabase.from('fleet_managers').insert(vals); if (error) throw error },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-fleet-managers'] }),
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(form)
      setForm({ company_name: '', company_email: '', company_phone: '', tax_id: '', is_verified: true, is_active: true })
      alert(t('common.saved'))
    } catch (e) { alert(handleError(e)) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('common.add')} {t('fleetManagers.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('fleetManagers.description')}</p></div>
      </div>
      <div className="max-w-lg">
        <form onSubmit={handleSave} className="space-y-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.name')}</label><input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.email')}</label><input type="email" value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.phone')}</label><input value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('fleetManagers.taxId')}</label><input value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" /> {t('common.active')}</label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{t('common.create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
