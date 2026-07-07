import { useTranslation } from 'react-i18next'
import { DataTable } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function SupportTicketsPage() {
  const { t, i18n } = useTranslation()
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tickets').select('*, user:user_id(full_name), department:department_id(name), priority:priority_id(name, color), status:status_id(name, color, is_closed)').order('created_at', { ascending: false }).limit(100)
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('tickets.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('tickets.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'ticket_number', label: t('tickets.ticketNo'), render: (t: any) => <span className="font-mono text-xs font-bold">{t.ticket_number}</span> },
        { key: 'user', label: t('tickets.user'), render: (t: any) => t.user?.full_name ?? '—' },
        { key: 'subject', label: t('tickets.subject'), sortable: true, render: (t: any) => <span className="font-medium">{t.subject}</span> },
        { key: 'department', label: t('tickets.dept'), render: (t: any) => t.department?.name ?? '—' },
        { key: 'priority', label: t('tickets.priority'), render: (t: any) => <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: (t.priority?.color ?? '#6b7280') + '20', color: t.priority?.color ?? '#6b7280' }}>{t.priority?.name ?? '—'}</span> },
        { key: 'status', label: t('tickets.status'), render: (t: any) => <StatusBadge status={t.status?.slug ?? 'pending'} /> },
        { key: 'created_at', label: t('tickets.date'), sortable: true, render: (t: any) => new Date(t.created_at).toLocaleDateString(i18n.language) },
      ]} data={tickets ?? []} loading={isLoading} searchable emptyMessage={t('tickets.noTickets')} />
    </div>
  )
}

export function TicketDepartmentsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket-departments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ticket_departments').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('tickets.departments')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('tickets.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('tickets.name'), sortable: true },
        { key: 'slug', label: t('tickets.slug') },
        { key: 'description', label: t('tickets.descriptionLabel') },
        { key: 'is_active', label: t('tickets.active'), render: (d: any) => <span className={d.is_active ? 'text-green-600' : 'text-red-500'}>{d.is_active ? t('tickets.yes') : t('tickets.no')}</span> },
      ]} data={data ?? []} loading={isLoading} />
    </div>
  )
}

export function TicketPrioritiesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket-priorities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ticket_priorities').select('*').order('sort_order')
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('tickets.priorities')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('tickets.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('tickets.name'), sortable: true, render: (p: any) => <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: p.color + '20', color: p.color }}>{p.name}</span> },
        { key: 'slug', label: t('tickets.slug') },
        { key: 'response_time_hours', label: t('tickets.responseTime'), render: (p: any) => p.response_time_hours ? `${p.response_time_hours}h` : '—' },
      ]} data={data ?? []} loading={isLoading} />
    </div>
  )
}

export function TicketStatusesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ticket_statuses').select('*').order('sort_order')
      if (error) throw error; return data ?? []
    },
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('tickets.statuses')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('tickets.description')}</p></div>
      </div>
      <DataTable columns={[
        { key: 'name', label: t('tickets.name'), sortable: true, render: (s: any) => <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: s.color + '20', color: s.color }}>{s.name}</span> },
        { key: 'is_closed', label: t('tickets.closed'), render: (s: any) => s.is_closed ? '✅' : '❌' },
        { key: 'sort_order', label: t('tickets.order'), sortable: true },
      ]} data={data ?? []} loading={isLoading} />
    </div>
  )
}

