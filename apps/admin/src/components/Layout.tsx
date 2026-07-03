import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { signOut } from '../lib/queries'

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const navigate = useNavigate()

  const showFull = !sidebarCollapsed || sidebarHovered

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <div onMouseEnter={() => setSidebarHovered(true)} onMouseLeave={() => setSidebarHovered(false)}>
        <Sidebar
          collapsed={sidebarCollapsed}
          full={showFull}
          onClose={() => setSidebarCollapsed(true)}
          onSignOut={handleSignOut}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} onSignOut={handleSignOut} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
