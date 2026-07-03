import React, { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import MapView, { UrlTile, Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps'

interface OSMMapProps {
  pickup?: { latitude: number; longitude: number; title?: string }
  dropoff?: { latitude: number; longitude: number; title?: string }
  rider?: { latitude: number; longitude: number; name?: string }
  showUserLocation?: boolean
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
  pickup, dropoff, rider, showUserLocation = false, initialRegion = DEFAULT_REGION,
}: OSMMapProps) {
  const mapRef = useRef<MapView>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (pickup && mapRef.current && mapReady) {
      mapRef.current.animateToRegion(
        { ...DEFAULT_REGION, latitude: pickup.latitude, longitude: pickup.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        500
      )
    }
  }, [pickup, mapReady])

  return (
    <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onMapReady={() => setMapReady(true)}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        showsCompass={true}
        style={{ flex: 1 }}
        mapType="none"
      >
        <UrlTile urlTemplate={OSM_TILE_URL} maximumZ={19} flipY={false} tileSize={256} shouldReplaceMapContent={true} />

        {pickup && (
          <Marker coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }} title="Origen" pinColor="#006e2a" />
        )}

        {dropoff && (
          <Marker coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }} title="Destino" pinColor="#ba1a1a" />
        )}

        {rider && (
          <Marker coordinate={{ latitude: rider.latitude, longitude: rider.longitude }} title={rider.name ?? 'Pasajero'}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ba1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>👤</Text>
            </View>
          </Marker>
        )}
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
