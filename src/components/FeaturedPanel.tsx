import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../types/event'
import { daysLeft, formatDate } from '../utils/dateUtils'

interface Props {
  event: ArtEvent
}

const SOURCE_LABELS: Record<ArtEvent['source'], string> = {
  'paris-opendata': 'Paris Open Data',
  'curated':        'Sélection éditoriale',
}

export function FeaturedPanel({ event }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const title = event.title[lang as 'fr' | 'en' | 'zh'] ?? event.title.fr
  const desc = event.description[lang as 'zh' | 'fr' | 'en'] ?? event.description.fr
  const days = daysLeft(event)
  const ending = event.tags.includes('ending-soon')

  return (
    <div className="featured-panel">
      <div className="featured-header">
        <span className="featured-label">{t('featured.label')}</span>
        <span className="featured-num">No.01</span>
      </div>
      {event.imageUrl && (
        <div className="featured-img-wrap">
          <img src={event.imageUrl} alt={title} className="featured-img" />
        </div>
      )}
      <div className="featured-body">
        <h2 className="featured-title">{title}</h2>
        <p className="featured-venue">{event.venue}</p>
        <span className="featured-source">{SOURCE_LABELS[event.source]}</span>
        <p className="featured-desc">{desc.slice(0, 160)}{desc.length > 160 ? '…' : ''}</p>
        <div className="featured-footer">
          <div className="featured-dates">
            {!event.isPermanent && (
              <span className="featured-date">
                {formatDate(event.dateStart, lang)} – {event.dateEnd ? formatDate(event.dateEnd, lang) : '—'}
              </span>
            )}
            {ending && days !== null && (
              <span className="featured-ending">J–{days}</span>
            )}
          </div>
          <span className="featured-price">{event.price}</span>
        </div>
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="featured-cta"
          >
            {t('featured.cta')}
          </a>
        )}
      </div>
    </div>
  )
}
