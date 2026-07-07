import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useSession, useProfileStats } from '../lib/queries'
import { handleError } from '../lib/errors'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Mail, Calendar, Shield, Users, Car, Activity, CheckCircle, X, Camera } from 'lucide-react'

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

function UrlModal({ title, currentUrl, onSave, onDelete, onClose }: {
  title: string; currentUrl: string; onSave: (url: string) => void; onDelete?: () => void; onClose: () => void
}) {
  const { t } = useTranslation()
  const [url, setUrl] = useState(currentUrl || '')
  const [preview, setPreview] = useState(currentUrl || '')
  const [error, setError] = useState('')

  function handleUrlChange(v: string) {
    setUrl(v)
    if (v && !v.match(/^https?:\/\/.+/)) setError(t('profile.urlMustStart'))
    else setError('')
    setPreview(v)
  }

  function handleSave() {
    if (!url.trim()) { onSave(''); return }
    if (!url.match(/^https?:\/\/.+/)) { setError(t('profile.invalidUrl')); return }
    onSave(url.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose} role="presentation" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose() }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label htmlFor="profile-url" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.imageUrl')}</label>
            <input id="profile-url" value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#199675]/20 focus:border-[#199675]" />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          {preview && !error && (
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-40 flex items-center justify-center">
              <img src={preview} alt="preview" className="max-w-full max-h-full object-contain"
                onError={() => setError(t('profile.imageFailed'))} />
            </div>
          )}
          <div className="text-xs text-gray-400">{t('profile.urlOnlySaved')}</div>
          <div className="flex gap-3 pt-1">
            {currentUrl && onDelete && (
              <button type="button" onClick={onDelete} className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">{t('common.delete')}</button>
            )}
            <div className="flex-1" />
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
            <button type="button" onClick={handleSave} className="px-6 py-2.5 bg-[#199675] text-white rounded-lg text-sm font-medium hover:bg-[#157a5e]">{t('profile.save')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [loading, setLoading] = useState(false)
  const [lastSignIn, setLastSignIn] = useState('')
  const [editField, setEditField] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const { data: session } = useSession()
  const { data: stats, isLoading: statsLoading } = useProfileStats()
  const { data: profile } = useQuery({
    queryKey: ['admin-profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (error) throw error; return data
    },
    enabled: !!session?.user?.id,
  })

  useEffect(() => { return () => { mountedRef.current = false } }, [])
  useEffect(() => {
    if (profile) { setName(profile.full_name ?? ''); setPhone(profile.phone ?? '') }
  }, [profile])
  useEffect(() => {
    if (session?.user?.email) setEmail(session.user.email)
    if (session?.user?.last_sign_in_at) setLastSignIn(new Date(session.user.last_sign_in_at).toLocaleString(i18n.language))
  }, [session, i18n.language])

  async function saveImageUrl(field: 'avatar_url' | 'cover_url', url: string) {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return
    await supabase.from('profiles').update({ [field]: url || null }).eq('id', user.user.id)
    qc.invalidateQueries({ queryKey: ['admin-profile'] })
    setEditField(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!mountedRef.current) return
    setLoading(true); setMessage('')
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')
      if (email && email !== session?.user?.email && !validateEmail(email)) throw new Error(t('profile.invalidEmail'))
      if (password) {
        if (password !== confirmPassword) throw new Error(t('profile.passwordsNoMatch'))
        if (password.length < 6) throw new Error(t('profile.passwordMinLength'))
      }
      const profileUpdates: Record<string, string> = {}
      if (name && name !== profile?.full_name) profileUpdates.full_name = name
      if (phone && phone !== profile?.phone) profileUpdates.phone = phone
      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.user.id)
        if (error) throw error
      }
      if ((email && email !== session?.user?.email) || password) {
        const authUpdates: Record<string, string> = {}
        if (email && email !== session?.user?.email) authUpdates.email = email
        if (password) authUpdates.password = password
        const { error } = await supabase.auth.updateUser(authUpdates)
        if (error) throw error; setPassword(''); setConfirmPassword('')
      }
      if (Object.keys(profileUpdates).length > 0 || (email && email !== session?.user?.email) || password) {
        setMessageType('success'); setMessage(t('profile.profileUpdated'))
      } else { setMessageType('error'); setMessage(t('profile.noChanges')) }
    } catch (err) { setMessageType('error'); setMessage(handleError(err)) }
    finally { if (mountedRef.current) setLoading(false) }
  }

  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'AD'

  return (
    <div>
      {/* Cover */}
      <div className="rounded-2xl h-64 relative mb-36 group">
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {profile?.cover_url ? (
            <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#199675] via-[#157a5e] to-[#212121]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        <button type="button" onClick={() => setEditField('cover')}
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 z-10">
          <Camera size={18} className="text-gray-700" />
        </button>

        {/* Avatar */}
        <div className="absolute -bottom-20 left-12">
          <div className="relative group/avatar">
            <button type="button" onClick={() => setEditField('avatar')}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/30 rounded-full transition-all">
              <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/avatar:opacity-100 transition-all scale-0 group-hover/avatar:scale-100">
                <Camera size={18} className="text-gray-700" />
              </div>
            </button>
            <div className={`w-36 h-36 rounded-full ${profile?.avatar_url ? '' : 'bg-white'} flex items-center justify-center shadow-2xl overflow-hidden`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl font-bold text-[#199675]">{initials}</span>
              )}
            </div>
            {profile?.is_verified && (
              <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-[3px] border-white flex items-center justify-center shadow-md">
                <CheckCircle size={16} className="text-white" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 pl-3">
        <h1 className="text-4xl font-bold text-gray-900">{name || t('profile.admin')}</h1>
        <div className="flex items-center gap-6 mt-2 text-gray-500 text-base flex-wrap">
          <span className="flex items-center gap-1.5"><Shield size={16} /> {t('profile.admin')}</span>
          <span className="flex items-center gap-1.5"><Calendar size={16} /> {t('profile.memberSince')} {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short' }) : '—'}</span>
          {lastSignIn && <span className="flex items-center gap-1.5"><Activity size={16} /> {t('profile.lastAccess')} {lastSignIn}</span>}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 px-1 mb-6">
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-3 min-w-[140px]">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><Car size={18} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-400">{t('profile.totalRides')}</p><p className="text-lg font-bold text-gray-900">{statsLoading ? '...' : stats?.totalRides ?? 0}</p></div>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-3 min-w-[140px]">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><Users size={18} className="text-green-600" /></div>
          <div><p className="text-xs text-gray-400">{t('profile.totalDrivers')}</p><p className="text-lg font-bold text-gray-900">{statsLoading ? '...' : stats?.totalDrivers ?? 0}</p></div>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-5 py-3 min-w-[140px]">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Activity size={18} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-400">{t('profile.driversOnline')}</p><p className="text-lg font-bold text-gray-900">{statsLoading ? '...' : stats?.driversOnline ?? 0}</p></div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[{ id: 'overview', label: t('profile.overview') }, { id: 'settings', label: t('profile.settings') }].map((tab) => (
          <button type="button" key={tab.id} onClick={() => { setActiveTab(tab.id); setMessage('') }}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-[#199675] text-[#199675]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t('profile.bio')}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{t('profile.bioText')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('profile.recentActivity')}</h3>
              {stats?.recentRides && stats.recentRides.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentRides.slice(0, 5).map((ride: any) => (
                    <div key={ride.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <Car size={14} className="mt-0.5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{t('profile.ride')} {ride.status}</p>
                        <p className="text-xs text-gray-400">{new Date(ride.created_at).toLocaleString(i18n.language)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t('profile.noRecentActivity')}</p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Shield size={16} /> {t('profile.role')}</h3>
              <p className="text-sm font-medium text-gray-900">{t('profile.admin')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('profile.fullAccess')}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Mail size={16} /> {t('profile.contact')}</h3>
              <p className="text-sm text-gray-600">{session?.user?.email ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-1">{phone || '—'}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Calendar size={16} /> {t('profile.memberSince')}</h3>
              <p className="text-sm text-gray-600">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSave} className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.fullName')}</label>
                <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#199675]/20 focus:border-[#199675]" />
              </div>
              <div>
                <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
                <input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+503 7000 0000"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#199675]/20 focus:border-[#199675]" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">{t('profile.email')}</label>
                <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#199675]/20 focus:border-[#199675]" />
              </div>
            </div>
            <hr className="border-gray-100" />
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('profile.changePassword')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-new-password" className="block text-xs text-gray-500 mb-1">{t('profile.newPassword')}</label>
                  <input id="profile-new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#199675]/20 focus:border-[#199675]" />
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="block text-xs text-gray-500 mb-1">{t('profile.confirmPassword')}</label>
                  <input id="profile-confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#199675]/20 focus:border-[#199675]" />
                </div>
              </div>
            </div>
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                messageType === 'error'
                  ? message === t('profile.noChanges')
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>{message}</div>
            )}
            <button type="submit" disabled={loading}
              className="bg-[#199675] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#157a5e] transition-colors disabled:opacity-50">
              {loading ? t('common.saving') : t('profile.saveChanges')}
            </button>
          </div>
        </form>
      )}

      {editField === 'cover' && (
        <UrlModal title={t('profile.coverPhoto')} currentUrl={profile?.cover_url || ''}
          onSave={(url) => saveImageUrl('cover_url', url)}
          onDelete={profile?.cover_url ? () => saveImageUrl('cover_url', '') : undefined}
          onClose={() => setEditField(null)} />
      )}
      {editField === 'avatar' && (
        <UrlModal title={t('profile.profilePhoto')} currentUrl={profile?.avatar_url || ''}
          onSave={(url) => saveImageUrl('avatar_url', url)}
          onDelete={profile?.avatar_url ? () => saveImageUrl('avatar_url', '') : undefined}
          onClose={() => setEditField(null)} />
      )}
    </div>
  )
}

