import React, { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text, Platform } from 'react-native'
import MapView, { UrlTile, Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps'

const driverMarkerContainer = {
  width: 32, height: 32, borderRadius: 16,
  backgroundColor: '#006e2a', alignItems: 'center',
  justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
}

const mapContainerStyle = { flex: 1, borderRadius: 16, overflow: 'hidden' as const }

const driverEmojiStyle = { color: '#fff', fontSize: 14, fontWeight: 'bold' as const }

interface OSMMapProps {
  pickup?: { latitude: number; longitude: number; title?: string }
  dropoff?: { latitude: number; longitude: number; title?: string }
  drivers?: Array<{ id: string; latitude: number; longitude: number; name?: string; heading?: number }>
  onRegionChange?: (region: Region) => void
  onPickupPress?: () => void
  onDropoffPress?: () => void
  showUserLocation?: boolean
  height?: number | string
  className?: string
  initialRegion?: Region
}

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const DEFAULT_REGION: Region = {
  latitude: 13.6989,
  longitude: -89.2185,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export function OSMMap({
  pickup, dropoff, drivers, onRegionChange,
  showUserLocation = false, height, className,
  initialRegion = DEFAULT_REGION,
}: OSMMapProps) {
  const mapRef = useRef<MapView>(null)
  const [mapReady, setMapReady] = useState(false)
  const [tileError, setTileError] = useState(false)

  useEffect(() => {
    if (pickup && dropoff && mapRef.current && mapReady) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: dropoff.latitude, longitude: dropoff.longitude },
        ],
        { edgePadding: { top: 80, right: 80, bottom: 80, left: 80 }, animated: true }
      )
    } else if (pickup && mapRef.current && mapReady) {
      mapRef.current.animateToRegion(
        { ...DEFAULT_REGION, latitude: pickup.latitude, longitude: pickup.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        500
      )
    }
  }, [pickup, dropoff, mapReady])

  return (
    <View style={mapContainerStyle} className={className}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={onRegionChange}
        style={{ flex: 1 }}
        mapType="none"
      >
        {!tileError && (
          <UrlTile
            urlTemplate={OSM_TILE_URL}
            maximumZ={19}
            flipY={false}
            tileSize={256}
            shouldReplaceMapContent={true}
            offlineMode={false}
          />
        )}

        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title={pickup.title ?? 'Origen'}
            pinColor="#006e2a"
          />
        )}

        {dropoff && (
          <Marker
            coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
            title={dropoff.title ?? 'Destino'}
            pinColor="#ba1a1a"
          />
        )}

        {drivers?.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            title={driver.name ?? 'Conductor'}
            image={require('@/assets/driver-marker.png') ? undefined : undefined}
            rotation={driver.heading ?? 0}
          >
            <View style={driverMarkerContainer}>
              <Text style={driverEmojiStyle}>🛵</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {!mapReady && (
        <View className="absolute inset-0 items-center justify-center bg-gray-100">
          <ActivityIndicator size="large" color="#006e2a" />
          <Text className="text-gray-500 text-sm mt-2">Cargando mapa...</Text>
        </View>
      )}
    </View>
  )
}
