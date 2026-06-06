import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../../types/event'
import 'leaflet/dist/leaflet.css'

interface Props {
  events: ArtEvent[]
}

const CATEGORY_COLORS: Record<string, string> = {
  exhibition: '#1E4068',
  concert: '#152B44',
  theatre: '#6B1A2A',
  interactive: '#2A5C40',
  landmark: '#8B2A3A',
  other: '#A8B4C2',
}

const SOURCE_LABELS: Record<string, string> = {
  'paris-opendata': 'Paris Open Data',
  'curated': 'Sélection éditoriale',
}

function markerColor(event: ArtEvent): string {
  if (event.tags.includes('ending-soon')) return '#6B1A2A'
  return CATEGORY_COLORS[event.category] ?? '#1E4068'
}

export function MapView({ events }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [selected, setSelected] = useState<ArtEvent | null>(null)
  const validEvents = events.filter(e => e.lat && e.lng)

  return (
    <div className="map-view">
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={12}
        className="map-container"
        scrollWheelZoom
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validEvents.map(e => (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lng]}
            radius={8}
            pathOptions={{
              fillColor: markerColor(e),
              color: '#EEF1F5',
              weight: 1.5,
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => setSelected(e) }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{e.title[lang as 'fr' | 'en' | 'zh'] ?? e.title.fr}</strong>
                <br />
                <span>{e.venue}</span>
                <br />
                <span>{e.price}</span>
                {e.ticketUrl && (
                  <><br /><a href={e.ticketUrl} target="_blank" rel="noopener noreferrer">{t('event.tickets')}</a></>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {selected && (
        <div className="map-detail-panel">
          <button className="map-detail-close" onClick={() => setSelected(null)}>✕</button>
          <span className="map-detail-category">{selected.category.toUpperCase()}</span>
          <h3 className="map-detail-title">{selected.title[lang as 'fr' | 'en' | 'zh'] ?? selected.title.fr}</h3>
          <p className="map-detail-venue">{selected.venue}</p>
          <span className="map-detail-source">{SOURCE_LABELS[selected.source] ?? selected.source}</span>
          <span className="map-detail-price">{selected.price}</span>
          {selected.ticketUrl && (
            <a href={selected.ticketUrl} target="_blank" rel="noopener noreferrer" className="map-detail-cta">
              {t('featured.cta')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
