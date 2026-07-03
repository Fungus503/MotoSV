import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  loading?: boolean
  accentColor?: string
}

export function StatCard({ title, value, icon, trend, loading, accentColor = 'bg-primary/10' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 ${accentColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
      ) : (
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {trend !== undefined && (
            <span className={`flex items-center text-xs mb-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
