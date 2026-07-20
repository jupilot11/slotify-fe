'use client'

import { useState, useRef, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Autocomplete, Marker } from '@react-google-maps/api'

export type LocationValue = {
  address: string
  city: string
  province: string
  postal_code: string
  lat: number
  lng: number
}

type Props = {
  value: LocationValue | null
  onChange: (v: LocationValue) => void
  disabled?: boolean
}

const LIBRARIES: ('places')[] = ['places']
const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 12.8797, lng: 121.774 }

function extractFromComponents(
  components: google.maps.GeocoderAddressComponent[],
  lat: number,
  lng: number
): LocationValue {
  const get = (...types: string[]) => {
    for (const type of types) {
      const c = components.find((comp) => comp.types.includes(type))
      if (c) return c.long_name
    }
    return ''
  }
  const streetNumber = get('street_number')
  const route = get('route')
  return {
    address: [streetNumber, route].filter(Boolean).join(' '),
    city: get('locality', 'administrative_area_level_3'),
    province: get('administrative_area_level_2'),
    postal_code: get('postal_code'),
    lat,
    lng,
  }
}

export default function LocationPicker({ value, onChange, disabled }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  })

  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  )
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(
    value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER
  )
  const [zoom, setZoom] = useState(value ? 16 : 6)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.geometry?.location) return
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    setMapCenter({ lat, lng })
    setZoom(16)
  }, [])

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (disabled || !e.latLng) return
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]?.address_components) {
          const locationValue = extractFromComponents(results[0].address_components, lat, lng)
          setMarkerPos({ lat, lng })
          onChange(locationValue)
        }
      })
    },
    [disabled, onChange]
  )

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]?.address_components) {
          const locationValue = extractFromComponents(results[0].address_components, lat, lng)
          setMarkerPos({ lat, lng })
          onChange(locationValue)
        }
      })
    },
    [onChange]
  )

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <div className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-64 w-full rounded-xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Autocomplete
        onLoad={(ref) => { autocompleteRef.current = ref }}
        onPlaceChanged={handlePlaceChanged}
      >
        <input
          type="text"
          placeholder="Search for your business location..."
          disabled={disabled}
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </Autocomplete>
      <div className="rounded-xl overflow-hidden border border-slate-200">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '256px' }}
          center={mapCenter}
          zoom={zoom}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onClick={handleMapClick}
        >
          {markerPos && (
            <Marker
              position={markerPos}
              draggable={!disabled}
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>
      {value ? (
        <p className="text-xs text-slate-500">
          {[value.address, value.city, value.province, value.postal_code]
            .filter(Boolean)
            .join(', ')}
        </p>
      ) : (
        <p className="text-xs text-slate-400">
          Search for an area, then click on the map to pin your exact location.
        </p>
      )}
    </div>
  )
}
