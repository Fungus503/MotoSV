import { Search, Moon, Sun, Bell, MessageSquare, LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface HeaderProps {
  onToggleSidebar: () => void
  onSignOut: () => void
}

export function Header({ onToggleSidebar, onSignOut }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('motosv-dark-mode') === 'true')
  const [showProfile, setShowProfile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: alerts } = useQuery({
    queryKey: ['header-sos-alerts'],
    queryFn: async () => {
      const { data } = await supabase.from('panic_alerts').select('*, reporter:reporter_id(full_name)').eq('status', 'active').order('created_at', { ascending: false }).limit(5)
      return data ?? []
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('motosv-dark-mode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onToggleSidebar} aria-label={t('header.toggleSidebar')} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" style={{ color: 'var(--text-primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
          <input placeholder={t('header.search')} name="search" autoComplete="off" aria-label={t('header.search')} className="pl-9 pr-4 py-2 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: 'var(--text-secondary)' }} title={t(darkMode ? 'header.lightMode' : 'header.darkMode')}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button type="button" onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')} className="p-2 hover:bg-gray-100 rounded-lg text-sm font-medium" style={{ color: 'var(--text-secondary)' }} title={i18n.language === 'es' ? t('header.english') : t('header.spanish')}>
          {i18n.language === 'es' ? t('header.langEn') : t('header.langEs')}
        </button>

        <div className="relative" ref={notifRef}>
          <button type="button" onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-lg relative" style={{ color: 'var(--text-secondary)' }} title={t('header.notifications')}>
            <Bell size={18} />
            {(alerts?.length ?? 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{alerts?.length}</span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg border py-2 z-50" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <h5 className="px-4 py-2 font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{t('header.notifications')}</h5>
              {alerts && alerts.length > 0 ? alerts.slice(0, 4).map((a: any) => (
                <div key={a.id} className="px-4 py-2.5 border-t text-sm" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>🚨 {a.alert_type.toUpperCase()}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{a.reporter?.full_name ?? t('header.user')} · {new Date(a.created_at).toLocaleString(i18n.language)}</div>
                </div>
              )) : (
                <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>{t('header.noNotifications')}</div>
              )}
            </div>
          )}
        </div>

        <button type="button" onClick={() => navigate('/app/chats')} className="p-2 hover:bg-gray-100 rounded-lg" style={{ color: 'var(--text-secondary)' }} title={t('header.chat')}>
          <MessageSquare size={18} />
        </button>

        <div className="relative" ref={profileRef}>
          <button type="button" onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 ml-2 p-1.5 hover:bg-gray-100 rounded-lg">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>A</span>
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{t('header.administrator')}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('header.admin')}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-lg py-2 z-50" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <button type="button" onClick={() => { navigate('/app/profile'); setShowProfile(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50" style={{ color: 'var(--text-primary)' }}>
                <User size={16} /> {t('header.editProfile')}
              </button>
              <button type="button" onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50">
                <LogOut size={16} /> {t('header.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
