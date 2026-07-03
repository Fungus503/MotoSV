import Chart from 'react-apexcharts'
import { Car, Users, DollarSign, Activity } from 'lucide-react'
import { StatCard, StatusBadge } from '../components'
import { useDashboardMetrics, useWeeklyEarnings, useAllRides } from '../lib/queries'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { data: metrics, isLoading: mLoading, isError: mMetricsError } = useDashboardMetrics()
  const { data: weekly, isError: mWeeklyError } = useWeeklyEarnings()
  const { data: recentRides, isLoading: mRidesLoading } = useAllRides()

  const categories = weekly?.map((w) => {
    const d = new Date(w.day)
    return format(d, 'EEE', { locale: i18n.language === 'en' ? enUS : es })
  }) ?? []

  const seriesData = weekly?.map((w) => Number(w.amount)) ?? []

  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
    colors: ['#199675'],
    plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
    xaxis: { categories, labels: { style: { colors: '#9ca3af', fontSize: '12px' } } },
    yaxis: { labels: { style: { colors: '#9ca3af', fontSize: '12px' }, formatter: (v) => `$${v}` } },
    grid: { borderColor: '#f0f0f0' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => `$${v.toFixed(2)}` } },
  }

  const chartSeries = [{ name: t('dashboard.earnings'), data: seriesData }]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{format(new Date(), "EEEE, d 'de' MMMM", { locale: i18n.language === 'en' ? enUS : es })}</span>
        </div>
      </div>
      {(mMetricsError || mWeeklyError) && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {t('dashboard.errorLoading')}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title={t('dashboard.ridesToday')} value={metrics?.rides_today ?? 0} icon={<Car size={18} className="text-primary" />} loading={mLoading} accentColor="bg-primary/10" />
        <StatCard title={t('dashboard.revenueToday')} value={`$${Number(metrics?.revenue_today ?? 0).toFixed(2)}`} icon={<DollarSign size={18} className="text-green-600" />} loading={mLoading} accentColor="bg-green-50" />
        <StatCard title={t('dashboard.driversOnline')} value={metrics?.drivers_online ?? 0} icon={<Users size={18} className="text-blue-600" />} loading={mLoading} accentColor="bg-blue-50" />
        <StatCard title={t('dashboard.activeRides')} value={metrics?.active_rides ?? 0} icon={<Activity size={18} className="text-purple-600" />} loading={mLoading} accentColor="bg-purple-50" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('dashboard.weeklyEarnings')}</h2>
          {seriesData.length > 0 ? (
            <Chart options={chartOptions} series={chartSeries} type="bar" height={280} />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">{t('dashboard.noWeeklyData')}</div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">{t('dashboard.recentRides')}</h2>
            <span className="text-xs text-gray-400">{t('dashboard.live')}</span>
          </div>
          <div className="space-y-3">
            {(recentRides ?? []).slice(0, 6).map((ride) => (
              <div key={ride.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                    {ride.rider?.full_name ?? t('dashboard.passenger')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(ride.created_at), 'HH:mm', { locale: i18n.language === 'en' ? enUS : es })}
                  </p>
                </div>
                <StatusBadge status={ride.status} />
              </div>
            ))}
            {mRidesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-28 bg-gray-200 animate-pulse rounded" />
                    <div className="h-2.5 w-14 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-full" />
                </div>
              ))
            ) : (!recentRides || recentRides.length === 0) ? (
              <p className="text-gray-400 text-sm py-8 text-center">{t('dashboard.noRecentRides')}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
