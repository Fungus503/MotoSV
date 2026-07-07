import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const ZONES = [
  { name: 'San Salvador Centro', coords: [[13.7200, -89.2400], [13.7200, -89.1900], [13.6800, -89.1900], [13.6800, -89.2400]], rides: 1240 },
  { name: 'San Salvador Este', coords: [[13.7200, -89.1900], [13.7200, -89.1400], [13.6800, -89.1400], [13.6800, -89.1900]], rides: 890 },
  { name: 'Santa Tecla', coords: [[13.7000, -89.3000], [13.7000, -89.2600], [13.6500, -89.2600], [13.6500, -89.3000]], rides: 560 },
  { name: 'Antiguo Cuscatlán', coords: [[13.7000, -89.2600], [13.7000, -89.2300], [13.6600, -89.2300], [13.6600, -89.2600]], rides: 420 },
]

function getColor(count: number): string {
  if (count > 1000) return '#dc2626'
  if (count > 700) return '#ea580c'
  if (count > 500) return '#d97706'
  if (count > 300) return '#ca8a04'
  return '#16a34a'
}

export function HeatMapPage() {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('heatMap.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('heatMap.description')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600" /> {t('heatMap.low')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> {t('heatMap.medium')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> {t('heatMap.high')}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600" /> {t('heatMap.critical')}</span>
        </div>
      </div>

      <div className="h-[600px] rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={[13.695, -89.220]} zoom={12} className="h-full w-full" scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {ZONES.map((zone) => (
            <Polygon
              key={zone.name}
              positions={zone.coords as [number, number][]}
              pathOptions={{ color: getColor(zone.rides), fillColor: getColor(zone.rides), fillOpacity: 0.4, weight: 2 }}
            >
              <Tooltip>
                <div className="text-sm">
                  <strong>{zone.name}</strong><br />
                  {t('heatMap.rides')}: {zone.rides.toLocaleString()}
                </div>
              </Tooltip>
            </Polygon>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
