import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function RolesPage() {
  const { t } = useTranslation()
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('name')
      if (error) throw error; return data ?? []
    },
  })

  const { data: permissions } = useQuery({
    queryKey: ['admin-role-permissions', selectedRole?.id],
    queryFn: async () => {
      if (!selectedRole) return []
      const { data, error } = await supabase.from('role_permissions').select('permission').eq('role_id', selectedRole.id)
      if (error) throw error; return (data ?? []).map((p: any) => p.permission)
    },
    enabled: !!selectedRole,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('roles.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('roles.description')}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DataTable
            columns={[
              { key: 'name', label: t('roles.role'), sortable: true, render: (r: any) => (
                <button onClick={() => setSelectedRole(r)} className={`font-medium text-left w-full ${selectedRole?.id === r.id ? 'text-[#199675]' : 'text-gray-900'}`}>{r.name}</button>
              )},
              { key: 'description', label: t('roles.descriptionLabel') },
              { key: 'is_active', label: '', render: (r: any) => <span className={r.is_active ? 'text-green-600' : 'text-red-500'}>{r.is_active ? t('roles.active') : t('roles.inactive')}</span> },
            ]}
            data={roles ?? []}
            loading={!roles}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedRole.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{selectedRole.description}</p>
              <h4 className="font-medium text-gray-900 mb-3">{t('roles.permissions')}</h4>
              {permissions && permissions.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((perm: string) => (
                    <div key={perm} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <span className="w-2 h-2 bg-[#199675] rounded-full shrink-0" />
                      {perm}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t('roles.noPermissions')}</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400">{t('roles.selectRole')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
