import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard, Car, Users, UserCircle, UserCog, Settings, FileText,
  ChevronDown, LogOut, MessageSquare, FolderOpen, Truck, Package,
  UserPlus, Shield, MapPin, Activity,
  BarChart3, Star, BookOpen, HelpCircle, Crown, DollarSign, Zap,
  Bell, Ticket, Tag as TagIcon, Grid3X3
} from 'lucide-react'

function getMenuData(t: (key: string) => string) {
  return [
  {
    section: t('sidebar.home'),
    items: [
      { label: t('sidebar.dashboard'), icon: <LayoutDashboard size={18} />, path: '/app/dashboard' },
    ],
  },
  {
    items: [
      { label: t('sidebar.chats'), icon: <MessageSquare size={18} />, path: '/app/chats' },
      { label: t('sidebar.media'), icon: <FolderOpen size={18} />, path: '/app/media' },
    ],
  },
  {
    items: [
      { label: t('sidebar.cab'), icon: <Car size={18} />, path: '#', children: [
        { label: t('sidebar.serviceCategories'), path: '/app/services/categories' },
        { label: t('sidebar.vehicleTypes'), path: '/app/vehicle-types' },
      ]},
      { label: t('sidebar.rides'), icon: <Car size={18} />, path: '#', children: [
        { label: t('sidebar.rideRequests'), path: '/app/ride-requests' },
        { label: t('sidebar.allRides'), path: '/app/rides' },
        { label: t('sidebar.bids'), path: '/app/bids' },
      ]},
    ],
  },
  {
    section: t('sidebar.userManagement'),
    items: [
      { label: t('sidebar.users'), icon: <Users size={18} />, path: '#', children: [
        { label: t('sidebar.allUsers'), path: '/app/users' },
        { label: t('sidebar.addUser'), path: '/app/users' },
        { label: t('sidebar.rolePermissions'), path: '/app/roles' },
      ]},
      { label: t('sidebar.riders'), icon: <UserCircle size={18} />, path: '#', children: [
        { label: t('sidebar.allRiders'), path: '/app/riders' },
        { label: t('sidebar.addRider'), path: '/app/riders' },
        { label: t('sidebar.wallet'), path: '/app/wallet' },
      ]},
      { label: t('sidebar.drivers'), icon: <UserCog size={18} />, path: '#', children: [
        { label: t('sidebar.verifiedDrivers'), path: '/app/drivers' },
        { label: t('sidebar.unverifiedDrivers'), path: '/app/drivers' },
        { label: t('sidebar.addDriver'), path: '/app/drivers' },
        { label: t('sidebar.driverDocuments'), path: '/app/drivers' },
        { label: t('sidebar.driverRules'), path: '/app/driver-rules' },
        { label: t('sidebar.driverLocation'), path: '/app/driver-location' },
        { label: t('sidebar.withdrawRequests'), path: '/app/withdraw-requests' },
        { label: t('sidebar.commissionHistories'), path: '/app/commissions' },
        { label: t('sidebar.driverEarnings'), path: '/app/driver-earnings' },
        { label: t('sidebar.driverPayouts'), path: '/app/driver-payouts' },
        { label: t('sidebar.wallet'), path: '/app/wallet' },
        { label: t('sidebar.notices'), path: '/app/notices' },
      ]},
      { label: t('sidebar.dispatchers'), icon: <UserPlus size={18} />, path: '#', children: [
        { label: t('sidebar.allDispatchers'), path: '/app/dispatchers' },
        { label: t('sidebar.addDispatcher'), path: '/app/dispatchers' },
      ]},
      { label: t('sidebar.fleetManagers'), icon: <Users size={18} />, path: '#', children: [
        { label: t('sidebar.allFleetManagers'), path: '/app/fleet-managers' },
        { label: t('sidebar.verifiedFleetManagers'), path: '/app/fleet-managers/verified' },
        { label: t('sidebar.unverifiedFleetManagers'), path: '/app/fleet-managers/unverified' },
        { label: t('sidebar.fleetManagerAdd'), path: '/app/fleet-managers/add' },
        { label: t('sidebar.fleetVehicleDocuments'), path: '/app/fleet-vehicles' },
        { label: t('sidebar.fleetDocuments'), path: '/app/fleet-vehicles' },
        { label: t('sidebar.wallet'), path: '/app/wallet' },
        { label: t('sidebar.withdrawRequests'), path: '/app/withdraw-requests' },
      ]},
      { label: t('sidebar.fleetVehicles'), icon: <Truck size={18} />, path: '#', children: [
        { label: t('sidebar.allFleetVehicles'), path: '/app/fleet-vehicles' },
        { label: t('sidebar.verifiedFleetVehicles'), path: '/app/fleet-vehicles/verified' },
        { label: t('sidebar.unverifiedFleetVehicles'), path: '/app/fleet-vehicles/unverified' },
      ]},
      { label: t('sidebar.referrals'), icon: <Shield size={18} />, path: '/app/referrals' },
      { label: t('sidebar.blockedUsers'), icon: <Shield size={18} />, path: '/app/blocked-users' },
    ],
  },
  {
    section: t('sidebar.cabManagement'),
    items: [
      { label: t('sidebar.zones'), icon: <MapPin size={18} />, path: '#', children: [{ label: t('sidebar.zones'), path: '/app/zones' }] },
      { label: t('sidebar.services'), icon: <Package size={18} />, path: '/app/services/categories' },
      { label: t('sidebar.vehicles'), icon: <Car size={18} />, path: '#', children: [
        { label: t('sidebar.vehicleTypes'), path: '/app/vehicle-types' },
        { label: t('sidebar.serviceTypes'), path: '/app/services/types' },
        { label: t('sidebar.vehicleApproval'), path: '/app/vehicle-approval' },
      ]},
      { label: t('sidebar.peakZones'), icon: <Activity size={18} />, path: '#', children: [
        { label: t('sidebar.peakZones'), path: '/app/peak-zones' },
        { label: t('sidebar.peakZoneMap'), path: '/app/peak-zones/map' },
      ]},
      { label: t('sidebar.heatMap'), icon: <Grid3X3 size={18} />, path: '/app/zones' },
      { label: t('sidebar.sos'), icon: <Bell size={18} />, path: '#', children: [
        { label: t('sidebar.sos'), path: '/app/sos' },
        { label: t('sidebar.sosAlerts'), path: '/app/sos' },
      ]},
      { label: t('sidebar.reports'), icon: <BarChart3 size={18} />, path: '#', children: [
        { label: t('sidebar.transactionReports'), path: '/app/reports' },
        { label: t('sidebar.rideReports'), path: '/app/reports' },
        { label: t('sidebar.driverReports'), path: '/app/reports' },
        { label: t('sidebar.couponReports'), path: '/app/reports' },
        { label: t('sidebar.zoneReports'), path: '/app/reports' },
        { label: t('sidebar.incentiveReports'), path: '/app/reports' },
      ]},
      { label: t('sidebar.reviews'), icon: <Star size={18} />, path: '#', children: [
        { label: t('sidebar.riderReviews'), path: '/app/reviews' },
        { label: t('sidebar.driverReviews'), path: '/app/reviews' },
      ]},
      { label: t('sidebar.appSettings'), icon: <Settings size={18} />, path: '#', children: [
        { label: t('sidebar.settings'), path: '/app/settings' },
        { label: t('sidebar.adminSessions'), path: '/app/admin-sessions' },
      ]},
    ],
  },
  {
    section: t('sidebar.contentManagement'),
    items: [
      { label: t('sidebar.blogs'), icon: <BookOpen size={18} />, path: '#', children: [
        { label: t('sidebar.allBlogs'), path: '/app/blogs' },
        { label: t('sidebar.addBlogs'), path: '/app/blogs' },
      ]},
      { label: t('sidebar.pages'), icon: <FileText size={18} />, path: '#', children: [
        { label: t('sidebar.allPages'), path: '/app/pages' },
        { label: t('sidebar.addPage'), path: '/app/pages' },
      ]},
      { label: t('sidebar.faqs'), icon: <HelpCircle size={18} />, path: '/app/faqs' },
      { label: t('sidebar.knowledgeBase'), icon: <BookOpen size={18} />, path: '/app/knowledge-base' },
    ],
  },
  {
    section: t('sidebar.priceManagement'),
    items: [
      { label: t('sidebar.subscriptions'), icon: <Crown size={18} />, path: '#', children: [
        { label: t('sidebar.driverSubscription'), path: '/app/subscriptions' },
        { label: t('sidebar.plans'), path: '/app/plans' },
      ]},
      { label: t('sidebar.fareConfig'), icon: <Settings size={18} />, path: '/app/fare-config' },
      { label: t('sidebar.extraCharges'), icon: <DollarSign size={18} />, path: '/app/extra-charges' },
      { label: t('sidebar.coupons'), icon: <TagIcon size={18} />, path: '/app/promotions' },
      { label: t('sidebar.surgePrices'), icon: <Zap size={18} />, path: '/app/fare-config' },
    ],
  },
  {
    section: t('sidebar.support'),
    items: [
      { label: t('sidebar.supportTickets'), icon: <Ticket size={18} />, path: '#', children: [
        { label: t('sidebar.ticketDashboard'), path: '/app/tickets' },
        { label: t('sidebar.departments'), path: '/app/ticket-departments' },
        { label: t('sidebar.priorities'), path: '/app/ticket-priorities' },
        { label: t('sidebar.statuses'), path: '/app/ticket-statuses' },
      ]},
    ],
  },
]
}

interface SidebarProps {
  collapsed: boolean
  full: boolean
  onClose: () => void
  onSignOut: () => void
}

export function Sidebar({ collapsed, full, onClose, onSignOut }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const menuData = getMenuData(t)

  const toggleMenu = (label: string) => setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))

  const isActive = (path: string) => {
    if (path === '#' || path === '') return false
    const [basePath, queryString] = path.split('?')
    if (queryString) {
      const statusParam = new URLSearchParams(queryString).get('status')
      const currentStatus = searchParams.get('status')
      return location.pathname === basePath && currentStatus === statusParam
    }
    return location.pathname === path
  }

  return (
    <>
      {!collapsed && !full && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 sidebar-gradient flex flex-col h-screen transition-all duration-300 ease-in-out ${
        collapsed ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${full ? 'w-64' : 'lg:w-16 w-64'}`}>
        <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${full ? 'gap-2 px-4' : 'justify-center px-2'}`}>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {full && <span className="text-white font-semibold text-lg truncate">MotoSV</span>}
          <button onClick={onClose} className={`lg:hidden text-white/60 hover:text-white ${full ? 'ml-auto' : 'hidden'}`}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 sidebar-scroll">
          {full ? (
            // === MODO COMPLETO ===
            menuData.map((section) => (
              <div key={section.section ?? Math.random()}>
                {section.section && (
                  <div className="text-xs text-white/40 uppercase tracking-wider px-3 pt-3 pb-1 font-semibold">{section.section}</div>
                )}
                {section.items.map((item: any) => {
                  const hasChildren = item.children && item.children.length > 0
                  const open = openMenus[item.label] ?? false
                  const anyChildActive = item.children?.some((c: any) => isActive(c.path)) ?? false
                  const isOpen = openMenus[item.label] !== undefined ? open : anyChildActive

                  if (hasChildren) {
                    return (
                      <div key={item.label} className={`sidebar-menu-list ${isOpen ? 'open' : ''}`}>
                        <button onClick={() => toggleMenu(item.label)}
                          className="sidebar-header flex items-center gap-3 w-full px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          {item.icon}
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="sidebar-submenu">
                          {item.children?.map((child: any) => (
                            <Link key={child.label} to={child.path} onClick={onClose}
                              className={`${isActive(child.path) ? '!text-white !bg-white/10' : ''}`}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link key={item.label} to={item.path} onClick={onClose}
                      className={`flex items-center gap-3 mx-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive(item.path) ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}>
                      {item.icon} {item.label}
                    </Link>
                  )
                })}
              </div>
            ))
          ) : (
            // === MODO ICONOS ===
            <div className="flex flex-col items-center gap-1 px-1">
              {menuData.map((section) => (
                section.items.map((item: any) => {
                  const hasChildren = item.children && item.children.length > 0
                  if (hasChildren) {
                    return (
                      <div key={item.label} className="relative group">
                        <div className="p-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer transition-colors" title={item.label}>
                          {item.icon}
                        </div>
                        <div className="absolute left-full top-0 ml-2 bg-[#212121] rounded-lg py-1 px-0 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px] z-50">
                          {item.children.map((child: any) => (
                            <Link key={child.label} to={child.path} onClick={onClose}
                              className={`block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 ${isActive(child.path) ? '!text-white !bg-white/10' : ''}`}>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <Link key={item.label} to={item.path} onClick={onClose}
                      className={`p-2.5 rounded-lg transition-colors ${isActive(item.path) ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                      title={item.label}>
                      {item.icon}
                    </Link>
                  )
                })
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className={`p-3 border-t border-white/10 shrink-0 ${full ? '' : 'flex justify-center'}`}>
          <button onClick={onSignOut}
            className={`flex items-center text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors ${
              full ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-2.5'
            }`}
            title={!full ? t('sidebar.logout') : undefined}>
            <LogOut size={full ? 18 : 20} />
            {full && <span>{t('sidebar.logout')}</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
