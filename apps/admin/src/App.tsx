import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { supabase } from './lib/supabase'
import { LoginPage } from './pages/Login'
import { DashboardPage } from './pages/Dashboard'
import { DriversPage } from './pages/Drivers'
import { DriversVerifiedPage } from './pages/DriversVerified'
import { DriversUnverifiedPage } from './pages/DriversUnverified'
import { DriverAddPage } from './pages/DriverAdd'
import { DriverDocumentsPage } from './pages/DriverDocuments'
import { RidesPage } from './pages/Rides'
import { FareConfigPage } from './pages/FareConfig'
import { ReportsPage } from './pages/Reports'
import { ServiceCategoriesPage } from './pages/ServiceCategories'
import { ServiceTypesPage } from './pages/ServiceTypes'
import { VehicleTypesPage } from './pages/VehicleTypes'
import { ZonesPage } from './pages/Zones'
import { RideRequestsPage } from './pages/RideRequests'
import { UsersPage } from './pages/UsersPage'
import { RidersPage } from './pages/RidersPage'
import { FAQsPage } from './pages/FAQs'
import { ReferralsPage } from './pages/Referrals'
import { PromotionsPage } from './pages/Promotions'
import { PaymentsPage } from './pages/Payments'
import { SOSPage } from './pages/SOSAlerts'
import { WalletAdminPage } from './pages/WalletAdmin'
import { BidsPage } from './pages/Bids'
import { ReviewsPage } from './pages/Reviews'
import { RiderReviewsPage } from './pages/RiderReviews'
import { DriverReviewsPage } from './pages/DriverReviews'
import { HeatMapPage } from './pages/HeatMap'
import { ReportTransactionsPage, ReportRidesPage, ReportDriversPage, ReportCouponsPage, ReportZonesPage, ReportIncentivesPage } from './pages/ReportPages'
import { ChatsAdminPage } from './pages/ChatsAdmin'
import { DriverLocationPage } from './pages/DriverLocationPage'
import { PushNotificationsPage } from './pages/PushNotifications'
import { AppSettingsPage } from './pages/AppSettings'
import { CancellationReasonsPage } from './pages/CancellationReasons'
import { TestimonialsPage } from './pages/Testimonials'
import { BannersPage } from './pages/Banners'
import { PagesCMSPage } from './pages/PagesCMS'
import { BlogsPage } from './pages/BlogsPage'
import { DriverRulesPage } from './pages/DriverRules'
import { NoticesPage } from './pages/NoticesPage'
import { CommissionsPage } from './pages/CommissionsPage'
import { WithdrawRequestsPage } from './pages/WithdrawRequests'
import { PeakZonesPage } from './pages/PeakZones'
import { DispatchersPage } from './pages/Dispatchers'
import { FleetManagersPage } from './pages/FleetManagers'
import { FleetVehiclesPage } from './pages/FleetVehicles'
import { PlansPage } from './pages/Plans'
import { SubscriptionsPage } from './pages/Subscriptions'
import { ExtraChargesPage } from './pages/ExtraCharges'
import { SupportTicketsPage, TicketDepartmentsPage, TicketPrioritiesPage, TicketStatusesPage } from './pages/SupportTickets'
import { KnowledgeBasePage } from './pages/KnowledgeBase'
import { OnboardingsPage } from './pages/Onboardings'
import { ProfilePage } from './pages/Profile'
import { RolesPage } from './pages/RolesPage'
import { MediaPage } from './pages/Media'
import { PeakZonesMapPage } from './pages/PeakZonesMap'
import { AdminSessionsPage } from './pages/AdminSessions'
import { BlockedUsersPage } from './pages/BlockedUsers'
import { DriverEarningsPage } from './pages/DriverEarnings'
import { DriverPayoutsPage } from './pages/DriverPayouts'
import { VehicleApprovalPage } from './pages/VehicleApproval'
import { FleetManagersVerifiedPage } from './pages/FleetManagersVerified'
import { FleetManagersUnverifiedPage } from './pages/FleetManagersUnverified'
import { FleetManagersAddPage } from './pages/FleetManagersAdd'
import { FleetVehiclesVerifiedPage } from './pages/FleetVehiclesVerified'
import { FleetVehiclesUnverifiedPage } from './pages/FleetVehiclesUnverified'
import { Layout } from './components/Layout'

const queryClient = new QueryClient()

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthorized(false)
        setChecking(false)
        return
      }
      supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
        setAuthorized(data?.role === 'admin')
        setChecking(false)
      })
    })
  }, [])

  if (checking) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">{t('auth.verifyingSession')}</p></div>
  if (!authorized) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/app" element={<RequireAuth><Layout><DashboardPage /></Layout></RequireAuth>} />
          <Route path="/app/dashboard" element={<RequireAuth><Layout><DashboardPage /></Layout></RequireAuth>} />
          <Route path="/app/drivers" element={<RequireAuth><Layout><DriversPage /></Layout></RequireAuth>} />
          <Route path="/app/drivers/verified" element={<RequireAuth><Layout><DriversVerifiedPage /></Layout></RequireAuth>} />
          <Route path="/app/drivers/unverified" element={<RequireAuth><Layout><DriversUnverifiedPage /></Layout></RequireAuth>} />
          <Route path="/app/drivers/add" element={<RequireAuth><Layout><DriverAddPage /></Layout></RequireAuth>} />
          <Route path="/app/drivers/documents" element={<RequireAuth><Layout><DriverDocumentsPage /></Layout></RequireAuth>} />
          <Route path="/app/rides" element={<RequireAuth><Layout><RidesPage /></Layout></RequireAuth>} />
          <Route path="/app/fare-config" element={<RequireAuth><Layout><FareConfigPage /></Layout></RequireAuth>} />
          <Route path="/app/reports" element={<RequireAuth><Layout><ReportsPage /></Layout></RequireAuth>} />
          <Route path="/app/reports/transactions" element={<RequireAuth><Layout><ReportTransactionsPage /></Layout></RequireAuth>} />
          <Route path="/app/reports/rides" element={<RequireAuth><Layout><ReportRidesPage /></Layout></RequireAuth>} />
          <Route path="/app/reports/drivers" element={<RequireAuth><Layout><ReportDriversPage /></Layout></RequireAuth>} />
          <Route path="/app/reports/coupons" element={<RequireAuth><Layout><ReportCouponsPage /></Layout></RequireAuth>} />
          <Route path="/app/reports/zones" element={<RequireAuth><Layout><ReportZonesPage /></Layout></RequireAuth>} />
          <Route path="/app/reports/incentives" element={<RequireAuth><Layout><ReportIncentivesPage /></Layout></RequireAuth>} />
          <Route path="/app/reviews/rider" element={<RequireAuth><Layout><RiderReviewsPage /></Layout></RequireAuth>} />
          <Route path="/app/reviews/driver" element={<RequireAuth><Layout><DriverReviewsPage /></Layout></RequireAuth>} />
          <Route path="/app/heat-map" element={<RequireAuth><Layout><HeatMapPage /></Layout></RequireAuth>} />
          <Route path="/app/services/categories" element={<RequireAuth><Layout><ServiceCategoriesPage /></Layout></RequireAuth>} />
          <Route path="/app/services/types" element={<RequireAuth><Layout><ServiceTypesPage /></Layout></RequireAuth>} />
          <Route path="/app/vehicle-types" element={<RequireAuth><Layout><VehicleTypesPage /></Layout></RequireAuth>} />
          <Route path="/app/zones" element={<RequireAuth><Layout><ZonesPage /></Layout></RequireAuth>} />
          <Route path="/app/ride-requests" element={<RequireAuth><Layout><RideRequestsPage /></Layout></RequireAuth>} />
          <Route path="/app/faqs" element={<RequireAuth><Layout><FAQsPage /></Layout></RequireAuth>} />
          <Route path="/app/users" element={<RequireAuth><Layout><UsersPage /></Layout></RequireAuth>} />
          <Route path="/app/riders" element={<RequireAuth><Layout><RidersPage /></Layout></RequireAuth>} />
          <Route path="/app/referrals" element={<RequireAuth><Layout><ReferralsPage /></Layout></RequireAuth>} />
          <Route path="/app/promotions" element={<RequireAuth><Layout><PromotionsPage /></Layout></RequireAuth>} />
          <Route path="/app/payments" element={<RequireAuth><Layout><PaymentsPage /></Layout></RequireAuth>} />
          <Route path="/app/sos" element={<RequireAuth><Layout><SOSPage /></Layout></RequireAuth>} />
          <Route path="/app/wallet" element={<RequireAuth><Layout><WalletAdminPage /></Layout></RequireAuth>} />
          <Route path="/app/bids" element={<RequireAuth><Layout><BidsPage /></Layout></RequireAuth>} />
          <Route path="/app/reviews" element={<RequireAuth><Layout><ReviewsPage /></Layout></RequireAuth>} />
          <Route path="/app/chats" element={<RequireAuth><Layout><ChatsAdminPage /></Layout></RequireAuth>} />
          <Route path="/app/driver-location" element={<RequireAuth><Layout><DriverLocationPage /></Layout></RequireAuth>} />
          <Route path="/app/push-notifications" element={<RequireAuth><Layout><PushNotificationsPage /></Layout></RequireAuth>} />
          <Route path="/app/settings" element={<RequireAuth><Layout><AppSettingsPage /></Layout></RequireAuth>} />
          <Route path="/app/cancellation-reasons" element={<RequireAuth><Layout><CancellationReasonsPage /></Layout></RequireAuth>} />
          <Route path="/app/testimonials" element={<RequireAuth><Layout><TestimonialsPage /></Layout></RequireAuth>} />
          <Route path="/app/banners" element={<RequireAuth><Layout><BannersPage /></Layout></RequireAuth>} />
          <Route path="/app/pages" element={<RequireAuth><Layout><PagesCMSPage /></Layout></RequireAuth>} />
          <Route path="/app/blogs" element={<RequireAuth><Layout><BlogsPage /></Layout></RequireAuth>} />
          <Route path="/app/driver-rules" element={<RequireAuth><Layout><DriverRulesPage /></Layout></RequireAuth>} />
          <Route path="/app/notices" element={<RequireAuth><Layout><NoticesPage /></Layout></RequireAuth>} />
          <Route path="/app/commissions" element={<RequireAuth><Layout><CommissionsPage /></Layout></RequireAuth>} />
          <Route path="/app/withdraw-requests" element={<RequireAuth><Layout><WithdrawRequestsPage /></Layout></RequireAuth>} />
          <Route path="/app/peak-zones" element={<RequireAuth><Layout><PeakZonesPage /></Layout></RequireAuth>} />
          <Route path="/app/dispatchers" element={<RequireAuth><Layout><DispatchersPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-managers" element={<RequireAuth><Layout><FleetManagersPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-managers/verified" element={<RequireAuth><Layout><FleetManagersVerifiedPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-managers/unverified" element={<RequireAuth><Layout><FleetManagersUnverifiedPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-managers/add" element={<RequireAuth><Layout><FleetManagersAddPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-vehicles" element={<RequireAuth><Layout><FleetVehiclesPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-vehicles/verified" element={<RequireAuth><Layout><FleetVehiclesVerifiedPage /></Layout></RequireAuth>} />
          <Route path="/app/fleet-vehicles/unverified" element={<RequireAuth><Layout><FleetVehiclesUnverifiedPage /></Layout></RequireAuth>} />
          <Route path="/app/plans" element={<RequireAuth><Layout><PlansPage /></Layout></RequireAuth>} />
          <Route path="/app/subscriptions" element={<RequireAuth><Layout><SubscriptionsPage /></Layout></RequireAuth>} />
          <Route path="/app/extra-charges" element={<RequireAuth><Layout><ExtraChargesPage /></Layout></RequireAuth>} />
          <Route path="/app/tickets" element={<RequireAuth><Layout><SupportTicketsPage /></Layout></RequireAuth>} />
          <Route path="/app/ticket-departments" element={<RequireAuth><Layout><TicketDepartmentsPage /></Layout></RequireAuth>} />
          <Route path="/app/ticket-priorities" element={<RequireAuth><Layout><TicketPrioritiesPage /></Layout></RequireAuth>} />
          <Route path="/app/ticket-statuses" element={<RequireAuth><Layout><TicketStatusesPage /></Layout></RequireAuth>} />
          <Route path="/app/knowledge-base" element={<RequireAuth><Layout><KnowledgeBasePage /></Layout></RequireAuth>} />
          <Route path="/app/onboardings" element={<RequireAuth><Layout><OnboardingsPage /></Layout></RequireAuth>} />
          <Route path="/app/profile" element={<RequireAuth><Layout><ProfilePage /></Layout></RequireAuth>} />
          <Route path="/app/roles" element={<RequireAuth><Layout><RolesPage /></Layout></RequireAuth>} />
          <Route path="/app/media" element={<RequireAuth><Layout><MediaPage /></Layout></RequireAuth>} />
          <Route path="/app/peak-zones/map" element={<RequireAuth><Layout><PeakZonesMapPage /></Layout></RequireAuth>} />
          <Route path="/app/admin-sessions" element={<RequireAuth><Layout><AdminSessionsPage /></Layout></RequireAuth>} />
          <Route path="/app/blocked-users" element={<RequireAuth><Layout><BlockedUsersPage /></Layout></RequireAuth>} />
          <Route path="/app/driver-earnings" element={<RequireAuth><Layout><DriverEarningsPage /></Layout></RequireAuth>} />
          <Route path="/app/driver-payouts" element={<RequireAuth><Layout><DriverPayoutsPage /></Layout></RequireAuth>} />
          <Route path="/app/vehicle-approval" element={<RequireAuth><Layout><VehicleApprovalPage /></Layout></RequireAuth>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
