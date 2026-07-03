import { useTranslation } from 'react-i18next'
import { DataTable } from '../components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { handleError } from '../lib/errors'
import { useState } from 'react'
import { Plus, Pencil, ShieldOff, ShieldCheck, Gavel, Eye, Trash2 } from 'lucide-react'

export function RidersPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()

  const { data: riders, isLoading } = useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, wallet:wallets(*)')
        .eq('role', 'rider')
        .order('created_at', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (vals: { email: string; password: string; full_name: string; phone: string }) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: vals.email, password: vals.password,
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('No user returned')
      const { error } = await supabase.from('profiles').insert({
        id: authData.user.id, full_name: vals.full_name, phone: vals.phone, email: vals.email, role: 'rider', is_verified: true,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-riders'] }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...vals }: { id: string; full_name?: string; phone?: string; email?: string }) => {
      const { error } = await supabase.from('profiles').update(vals).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-riders'] }),
  })

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ id, is_blocked }: { id: string; is_blocked: boolean }) => {
      const payload: any = { is_blocked }
      if (is_blocked) {
        payload.blocked_at = new Date().toISOString()
        const { data: admin } = await supabase.auth.getUser()
        payload.blocked_by = admin.user?.id
      } else {
        payload.block_reason = null
        payload.unblocked_at = new Date().toISOString()
      }
      const { error } = await supabase.from('profiles').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-riders'] }),
  })

  const sanctionMutation = useMutation({
    mutationFn: async (vals: { rider_id: string; type: string; reason: string; duration_days: number }) => {
      const { data: admin } = await supabase.auth.getUser()
      const expires_at = vals.duration_days > 0
        ? new Date(Date.now() + vals.duration_days * 86400000).toISOString()
        : null
      const { error } = await supabase.from('rider_sanctions').insert({
        rider_id: vals.rider_id, type: vals.type, reason: vals.reason,
        duration_days: vals.duration_days, issued_by: admin.user?.id, expires_at,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-riders'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: admin } = await supabase.auth.getUser()
      const { error } = await supabase.from('profiles').update({
        is_blocked: true, blocked_at: new Date().toISOString(),
        blocked_by: admin.user?.id, block_reason: 'Eliminado por administrador',
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-riders'] }),
  })

  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any>(null)
  const [showSanction, setShowSanction] = useState<any>(null)
  const [showRides, setShowRides] = useState<any>(null)
  const [addForm, setAddForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', email: '' })
  const [sanctionForm, setSanctionForm] = useState({ type: 'warning', reason: '', duration_days: 0 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('riders.title')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('riders.description')}</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={16} /> {t('riders.addBtn')}</button>
      </div>
      <DataTable
        columns={[
          { key: 'full_name', label: t('riders.name'), sortable: true, render: (r: any) => (
            <span className={`font-medium ${r.is_blocked ? 'text-red-400 line-through' : 'text-gray-900'}`}>{r.full_name ?? '—'}</span>
          )},
          { key: 'phone', label: t('riders.phone') },
          { key: 'email', label: t('riders.email') },
          { key: 'wallet', label: t('riders.balance'), sortable: true, render: (r: any) => {
            const bal = r.wallet?.[0]?.balance ?? 0
            return <span className="font-medium">${Number(bal).toFixed(2)}</span>
          }},
          { key: 'is_verified', label: t('riders.verified'), render: (r: any) => <span className={r.is_verified ? 'text-green-600' : 'text-gray-400'}>{r.is_verified ? t('riders.yes') : t('riders.no')}</span> },
          { key: 'is_blocked', label: t('riders.block'), render: (r: any) => r.is_blocked ? <span className="text-red-600 text-xs font-medium">{t('riders.block')}</span> : <span className="text-green-600 text-xs">{t('riders.unblock')}</span> },
          { key: 'created_at', label: t('riders.registered'), sortable: true, render: (r: any) => new Date(r.created_at).toLocaleDateString(i18n.language) },
          { key: '', label: '', width: 'w-36', render: (r: any) => (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setShowEdit(r); setEditForm({ full_name: r.full_name ?? '', phone: r.phone ?? '', email: r.email ?? '' }) }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title={t('riders.editTitle')}><Pencil size={14} /></button>
              <button onClick={async (e) => { e.stopPropagation(); try { await toggleBlockMutation.mutateAsync({ id: r.id, is_blocked: !r.is_blocked }) } catch (e) { alert(handleError(e)) } }}
                className={`p-1.5 rounded ${r.is_blocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                title={r.is_blocked ? t('riders.unblock') : t('riders.block')}>
                {r.is_blocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowSanction(r); setSanctionForm({ type: 'warning', reason: '', duration_days: 0 }) }}
                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" title={t('riders.sanction')}><Gavel size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); setShowRides(r) }}
                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded" title={t('riders.rideHistory')}><Eye size={14} /></button>
              <button onClick={async (e) => { e.stopPropagation(); try { if (confirm(t('common.confirmDelete'))) await deleteMutation.mutateAsync(r.id) } catch (e) { alert(handleError(e)) } }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded" title={t('common.delete')}><Trash2 size={14} /></button>
            </div>
          )},
        ]}
        data={riders ?? []}
        loading={isLoading}
        searchable
      />

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('riders.addTitle')}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault(); await createMutation.mutateAsync(addForm); setShowAdd(false)
              setAddForm({ full_name: '', email: '', phone: '', password: '' })
            }} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.name')}</label><input value={addForm.full_name} onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.email')}</label><input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.phone')}</label><input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.password')}</label><input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowEdit(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('riders.editTitle')}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault(); await updateMutation.mutateAsync({ id: showEdit.id, ...editForm }); setShowEdit(null)
            }} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.name')}</label><input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.email')}</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.phone')}</label><input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">{t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSanction && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowSanction(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('riders.sanctionTitle')}: {showSanction.full_name}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault(); await sanctionMutation.mutateAsync({ rider_id: showSanction.id, ...sanctionForm }); setShowSanction(null)
            }} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.sanctionType')}</label>
                <select value={sanctionForm.type} onChange={(e) => setSanctionForm({ ...sanctionForm, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="warning">{t('riders.warning')}</option>
                  <option value="suspension">{t('riders.suspension')}</option>
                  <option value="permanent_ban">{t('riders.permanentBan')}</option>
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.sanctionReason')}</label><textarea value={sanctionForm.reason} onChange={(e) => setSanctionForm({ ...sanctionForm, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={3} required /></div>
              {sanctionForm.type !== 'permanent_ban' && (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">{t('riders.sanctionDuration')}</label><input type="number" value={sanctionForm.duration_days} onChange={(e) => setSanctionForm({ ...sanctionForm, duration_days: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSanction(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={sanctionMutation.isPending} className="flex-1 bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">{t('riders.sanction')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRides && (
        <RiderRidesModal rider={showRides} onClose={() => setShowRides(null)} t={t} i18n={i18n} />
      )}
    </div>
  )
}

function RiderRidesModal({ rider, onClose, t, i18n }: { rider: any; onClose: () => void; t: any; i18n: any }) {
  const { data: rides } = useQuery({
    queryKey: ['rider-rides', rider?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('id, status, estimated_fare, final_fare, created_at, driver:driver_id(full_name)')
        .eq('rider_id', rider.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error; return data ?? []
    },
    enabled: !!rider,
  })

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{t('riders.rideHistory')}: {rider.full_name}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
        </div>
        {rides && rides.length > 0 ? (
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">{t('rides.driver')}</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">{t('rides.status')}</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">{t('rides.fare')}</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">{t('rides.date')}</th>
            </tr></thead>
            <tbody>
              {rides.map((r: any) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">{r.driver?.full_name ?? '—'}</td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'completed' ? 'bg-green-100 text-green-800' : r.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{t('status.' + r.status, r.status)}</span></td>
                  <td className="px-3 py-2 text-sm">${Number(r.final_fare ?? r.estimated_fare ?? 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-sm text-gray-400">{new Date(r.created_at).toLocaleDateString(i18n.language)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-8 text-gray-400">{t('riders.noRides')}</p>
        )}
      </div>
    </div>
  )
}
