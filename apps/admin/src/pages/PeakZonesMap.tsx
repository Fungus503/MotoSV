import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const defaultIcon = L.divIcon({
  className: '',
  html: '<div style="background:#199675;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">P</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function surgeIcon(multiplier: number) {
  const intensity = Math.min(multiplier / 2.5, 1)
  const r = Math.round(255 * intensity)
  const g = Math.round(255 * (1 - intensity))
  return L.divIcon({
    className: '',
    html: `<div style="background:rgb(${r},${g},0);width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px;">×${multiplier}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export function PeakZonesMapPage() {
  const { t } = useTranslation()
  const { data: zones, isLoading: zLoading } = useQuery({
    queryKey: ['zones-with-coords'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_zones_with_coords')
      if (error) throw error; return (data as { id: string; name: string; lat: number; lng: number }[]) ?? []
    },
  })

  const { data: peakZones } = useQuery({
    queryKey: ['admin-peak-zones-map'],
    queryFn: async () => {
      const { data, error } = await supabase.from('peak_zones').select('*, zone:zone_id(name)').eq('is_active', true).order('surge_multiplier', { ascending: false })
      if (error) throw error; return data ?? []
    },
  })

  const hasSurge = peakZones && peakZones.length > 0
  const hasZones = zones && zones.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('peakZones.mapTitle')}</h1><p className="text-sm text-gray-400 mt-0.5">{t('peakZones.mapDescription')}</p></div>
        {hasSurge && (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#199675] border border-white shadow" /> Zone</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 border border-white shadow" /> Surge</span>
          </div>
        )}
      </div>
      {zLoading ? (
        <div className="h-[600px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">{t('peakZones.loadingMap')}</div>
      ) : !hasZones ? (
        <div className="h-[600px] bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 text-sm">{t('peakZones.noZones')}</div>
      ) : (
        <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
          <MapContainer center={[13.6989, -89.2185]} zoom={12} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {zones.map((z) => (
              <Marker key={z.id} position={[z.lat, z.lng]} icon={defaultIcon}>
                <Popup>
                  <div className="text-sm"><strong>{z.name}</strong></div>
                </Popup>
              </Marker>
            ))}
            {peakZones?.map((pz: any) => {
              const zone = zones?.find((z) => z.id === pz.zone_id)
              if (!zone) return null
              return (
                <Marker key={pz.id} position={[zone.lat, zone.lng]} icon={surgeIcon(pz.surge_multiplier)}>
                  <Popup>
                    <div className="text-sm space-y-1">
                      <div><strong>{pz.name}</strong></div>
                      <div>{t('peakZones.zoneLabel')}: {pz.zone?.name ?? t('peakZones.allZones')}</div>
                      <div>{t('peakZones.surge')}: <strong className="text-orange-600">×{pz.surge_multiplier}</strong></div>
                      <div>{t('peakZones.time')}: {pz.start_time?.substring(0, 5)} - {pz.end_time?.substring(0, 5)}</div>
                      <div>{t('peakZones.days')}: {pz.days_of_week?.length ? pz.days_of_week.map((d: number) => [t('peakZones.dom'),t('peakZones.lun'),t('peakZones.mar'),t('peakZones.mie'),t('peakZones.jue'),t('peakZones.vie'),t('peakZones.sab')][d]).join(' ') : t('peakZones.defaultDays')}</div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
