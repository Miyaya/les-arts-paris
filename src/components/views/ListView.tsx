import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../../types/event'
import { EventRow } from '../EventRow'
import { EventModal } from '../EventModal'
import { HeroCarousel } from '../HeroCarousel'
import { SkeletonRow } from '../SkeletonRow'

interface Props {
  events: ArtEvent[]
  loading: boolean
  error: string | null
}

export function ListView({ events, loading, error }: Props) {
  const { t } = useTranslation()
  const [selectedEvent, setSelectedEvent] = useState<ArtEvent | null>(null)

  function handleRowClick(event: ArtEvent) {
    setSelectedEvent(prev => prev?.id === event.id ? null : event)
  }

  if (loading) {
    return (
      <div className="list-view">
        <div className="hero-skeleton" />
        <div className="list-rows">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    )
  }

  if (error)            return <div className="list-error">{t('errors.fetch_failed')}</div>
  if (events.length === 0) return <div className="list-empty">{t('event.no_events')}</div>

  return (
    <>
      <div className="list-view">
        <HeroCarousel events={events} />

        <div className="list-section-header">
          <span className="list-section-label">{t('list.active_events')}</span>
          <span className="list-section-count">{String(events.length).padStart(4, '0')}</span>
        </div>

        <div className="list-rows">
          {events.map((e, i) => (
            <EventRow
              key={e.id}
              event={e}
              index={i}
              isSelected={selectedEvent?.id === e.id}
              onClick={() => handleRowClick(e)}
            />
          ))}
        </div>
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  )
}
