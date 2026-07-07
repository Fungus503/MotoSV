import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Save } from 'lucide-react'
import { useFareConfig, useUpdateFareConfig } from '../lib/queries'

export function FareConfigPage() {
  const { t } = useTranslation()
  const { data: config } = useFareConfig()
  const updateConfig = useUpdateFareConfig()
  const [form, setForm] = useState({ base_fare: 1.5, per_km: 0.75, per_min: 0.15, min_fare: 3.0, surge_enabled: false, surge_multiplier: 1.5 })

  useEffect(() => {
    if (config) setForm({
      base_fare: Number(config.base_fare),
      per_km: Number(config.per_km),
      per_min: Number(config.per_min),
      min_fare: Number(config.min_fare),
      surge_enabled: config.surge_enabled ?? false,
      surge_multiplier: config.surge_multiplier ?? 1.5,
    })
  }, [config])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateConfig.mutateAsync(form)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('fareConfig.title')}</h1>
      <div className="max-w-lg">
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fare-base" className="block text-sm font-medium text-gray-700 mb-1">{t('fareConfig.baseFare')}</label>
              <input id="fare-base" type="number" step="0.01" value={form.base_fare}
                onChange={(e) => setForm({ ...form, base_fare: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="fare-per-km" className="block text-sm font-medium text-gray-700 mb-1">{t('fareConfig.perKm')}</label>
              <input id="fare-per-km" type="number" step="0.01" value={form.per_km}
                onChange={(e) => setForm({ ...form, per_km: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="fare-per-min" className="block text-sm font-medium text-gray-700 mb-1">{t('fareConfig.perMin')}</label>
              <input id="fare-per-min" type="number" step="0.01" value={form.per_min}
                onChange={(e) => setForm({ ...form, per_min: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label htmlFor="fare-min" className="block text-sm font-medium text-gray-700 mb-1">{t('fareConfig.minFare')}</label>
              <input id="fare-min" type="number" step="0.01" value={form.min_fare}
                onChange={(e) => setForm({ ...form, min_fare: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="surge" checked={form.surge_enabled}
              onChange={(e) => setForm({ ...form, surge_enabled: e.target.checked })}
              className="rounded border-gray-300 text-primary focus:ring-primary" />
            <label htmlFor="surge" className="text-sm font-medium text-gray-700">{t('fareConfig.surgeEnabled')}</label>
          </div>
          {form.surge_enabled && (
            <div>
              <label htmlFor="fare-surge" className="block text-sm font-medium text-gray-700 mb-1">{t('fareConfig.surgeMultiplier')}</label>
              <input id="fare-surge" type="number" step="0.1" value={form.surge_multiplier}
                onChange={(e) => setForm({ ...form, surge_multiplier: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          )}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>{t('fareConfig.example')}</strong> {t('fareConfig.exampleTrip')}
              {(form.base_fare + form.per_km * 5 + form.per_min * 15).toFixed(2)}
              {form.surge_enabled && ` (con surge ×${form.surge_multiplier} = $${((form.base_fare + form.per_km * 5 + form.per_min * 15) * form.surge_multiplier).toFixed(2)})`}
            </p>
          </div>
          <button type="submit" disabled={updateConfig.isPending}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Save size={16} /> {updateConfig.isPending ? t('common.saving') : t('fareConfig.saveConfig')}
          </button>
        </form>
      </div>
    </div>
  )
}
