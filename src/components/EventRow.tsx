import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../types/event'
import { daysLeft, formatDateRange } from '../utils/dateUtils'
import { scoreToStars } from '../utils/popularityScore'

interface Props {
  event: ArtEvent
  index: number
  isSelected: boolean
  onClick: () => void
}

const SOURCE_LABELS: Record<ArtEvent['source'], string> = {
  'paris-opendata': 'ODP',
  'curated':        'Éd.',
}

const SOURCE_CLASS: Record<ArtEvent['source'], string> = {
  'paris-opendata': '',
  'curated':        'source-curated',
}

function Stars({ score }: { score: number }) {
  const count = scoreToStars(score)
  return (
    <span className={`event-stars stars-${count}`} title={`Popularité : ${score}/100`}>
      {'★'.repeat(count)}{'☆'.repeat(4 - count)}
    </span>
  )
}

export function EventRow({ event, index, isSelected, onClick }: Props) {
  const { t, i18n } = useTranslation()
  const lang    = i18n.language
  const title   = event.title[lang as 'fr' | 'en' | 'zh'] ?? event.title.fr
  const ending  = event.tags.includes('ending-soon')
  const days    = daysLeft(event)
  const score   = event.popularityScore ?? 0

  const occCount = event.occurrences?.length ?? 0

  function renderDate() {
    if (event.isPermanent) return <span className="event-date-perm">{t('event.permanent')}</span>
    if (ending && days !== null) {
      if (days === 0) return <span className="event-date-urgent">{t('event.ending_today')}</span>
      return <span className="event-date-urgent">{t('event.ending_in', { days })}</span>
    }
    return (
      <span className="event-date">
        {formatDateRange(event.dateStart, event.dateEnd, lang)}
        {occCount > 1 && <span className="event-occ-count">{occCount}×</span>}
      </span>
    )
  }

  return (
    <div
      className={`event-row${ending ? ' ending-soon' : ''}${isSelected ? ' selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <span className="event-num">{String(index + 1).padStart(2, '0')}</span>
      <div className="event-body">
        <span className="event-title">{title}</span>
        <div className="event-meta">
          <span className="event-venue">{event.venue}</span>
          <span className="event-district">{event.district}</span>
          <span className={`event-source ${SOURCE_CLASS[event.source]}`}>
            {SOURCE_LABELS[event.source]}
          </span>
          <Stars score={score} />
          {event.tags.includes('family') && <span className="tag tag-family">Famille</span>}
          {event.isFree && <span className="tag tag-free">{t('event.free')}</span>}
          {ending && <span className="tag tag-ending">{t('filters.ending-soon')}</span>}
        </div>
      </div>
      {renderDate()}
      <span className="event-price">{event.price}</span>
    </div>
  )
}
