import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { Loader2, UserPlus } from 'lucide-react'

export function DriverAddPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!form.full_name.trim()) throw new Error('nameRequired')
      if (!form.phone.trim()) throw new Error('phoneRequired')
      if (!form.email.trim()) throw new Error('emailRequired')
      if (!form.password || form.password.length < 6) throw new Error('passwordMin')

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.full_name.trim(),
            phone: form.phone.trim(),
            role: 'driver',
          },
        },
      })

      if (signUpError) throw signUpError
      if (!data.user) throw new Error('signupFailed')

      setSuccess(true)
      setTimeout(() => navigate('/app/drivers/unverified'), 2000)
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('driverAdd.successTitle')}</h2>
          <p className="text-gray-500">{t('driverAdd.successMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('driverAdd.title')}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t('driverAdd.description')}</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label htmlFor="da-name" className="block text-sm font-medium text-gray-700 mb-1">{t('driverAdd.fullName')} *</label>
          <input id="da-name" value={form.full_name} onChange={handleChange('full_name')} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder={t('driverAdd.fullNamePlaceholder')} />
        </div>

        <div>
          <label htmlFor="da-phone" className="block text-sm font-medium text-gray-700 mb-1">{t('driverAdd.phone')} *</label>
          <input id="da-phone" value={form.phone} onChange={handleChange('phone')} required type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="+503 7000 0000" />
        </div>

        <div>
          <label htmlFor="da-email" className="block text-sm font-medium text-gray-700 mb-1">{t('driverAdd.email')} *</label>
          <input id="da-email" value={form.email} onChange={handleChange('email')} required type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="conductor@email.com" />
        </div>

        <div>
          <label htmlFor="da-password" className="block text-sm font-medium text-gray-700 mb-1">{t('driverAdd.password')} *</label>
          <input id="da-password" value={form.password} onChange={handleChange('password')} required type="password" minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder={t('driverAdd.passwordPlaceholder')} />
          <p className="text-xs text-gray-400 mt-1">{t('driverAdd.passwordHint')}</p>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? <><Loader2 size={16} className="inline animate-spin mr-2" />{t('driverAdd.creating')}</> : t('driverAdd.create')}
          </button>
        </div>
      </form>
    </div>
  )
}
