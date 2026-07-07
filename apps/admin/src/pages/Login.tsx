import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../lib/queries'
import { handleError } from '../lib/errors'
import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/app/dashboard')
    } catch (err) {
      setError(handleError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 hidden lg:flex items-center justify-center sidebar-gradient">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">MotoSV</h1>
          <p className="text-white/70">{t('login.title')}</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">MotoSV</h1>
            <p className="text-gray-400 mt-1">{t('login.title')}</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder={t('auth.emailPlaceholder')} required />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="••••••••" required />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
