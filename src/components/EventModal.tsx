import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../types/event'
import { daysLeft, formatDate } from '../utils/dateUtils'
import { scoreToStars } from '../utils/popularityScore'

interface Props {
  event: ArtEvent
  onClose: () => void
}

const CATEGORY_COLOR: Record<string, string> = {
  exhibition:  'var(--indigo-bright)',
  concert:     'var(--indigo-mid)',
  theatre:     'var(--maroon)',
  interactive: 'var(--green-free)',
  landmark:    'var(--maroon-light)',
  other:       'var(--egg-darker)',
}

const SOURCE_LABELS: Record<ArtEvent['source'], string> = {
  'paris-opendata': 'Paris Open Data',
  'curated':        'Sélection éditoriale',
}

const TAG_LABELS: Record<string, string> = {
  'family':      'Famille',
  'free':        'Gratuit',
  'ending-soon': 'Bientôt fini',
  'outdoor':     'Plein air',
}

export function EventModal({ event, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const lang    = i18n.language
  const title   = event.title[lang as 'fr' | 'en' | 'zh'] ?? event.title.fr
  const desc    = event.description[lang as 'zh' | 'fr' | 'en'] ?? event.description.fr
  const days    = daysLeft(event)
  const ending  = event.tags.includes('ending-soon')
  const stars   = scoreToStars(event.popularityScore ?? 0)
  const catColor = CATEGORY_COLOR[event.category] ?? 'var(--indigo-bright)'

  // Close on Escape + lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        {/* ── Close ── */}
        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>

        {/* ── Image ── */}
        {event.imageUrl && (
          <div className="modal-img-wrap">
            <img src={event.imageUrl} alt={title} className="modal-img" />
          </div>
        )}

        <div className="modal-body">

          {/* ── Eyebrow ── */}
          <div className="modal-eyebrow">
            <span className="modal-cat" style={{ background: catColor }}>
              {t(`filters.${event.category}`, { defaultValue: event.category.toUpperCase() }).toUpperCase()}
            </span>
            <span className={`modal-stars stars-${stars}`}>
              {'★'.repeat(stars)}{'☆'.repeat(4 - stars)}
            </span>
            {event.isFree && <span className="modal-badge badge-free">{t('event.free')}</span>}
            {ending && days !== null && (
              <span className="modal-badge badge-ending">
                {days === 0 ? t('event.ending_today') : t('event.ending_in', { days })}
              </span>
            )}
          </div>

          {/* ── Title ── */}
          <h2 className="modal-title">{title}</h2>

          {/* ── Venue ── */}
          <div className="modal-venue-row">
            <span className="modal-venue">{event.venue}</span>
            {event.address && <span className="modal-address">{event.address}</span>}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-map-link"
            >
              ↗ Carte
            </a>
          </div>

          {/* ── Description ── */}
          {desc && <p className="modal-desc">{desc}</p>}

          {/* ── Tags ── */}
          {event.tags.length > 0 && (
            <div className="modal-tags">
              {event.tags.map(tag => (
                <span key={tag} className={`tag tag-${tag === 'ending-soon' ? 'ending' : tag === 'free' ? 'free' : tag === 'family' ? 'family' : 'outdoor'}`}>
                  {TAG_LABELS[tag] ?? tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="modal-footer">
            <div className="modal-meta">
              {event.isPermanent
                ? <span className="modal-dates">{t('event.permanent')}</span>
                : event.occurrences && event.occurrences.length > 1
                  ? <div className="modal-occurrences">
                      {event.occurrences.map((o, i) => (
                        <span key={i} className="modal-occ-item">
                          {formatDate(o.start, lang)}
                          {o.end ? ` – ${formatDate(o.end, lang)}` : ''}
                        </span>
                      ))}
                    </div>
                  : <span className="modal-dates">
                      {formatDate(event.dateStart, lang)}
                      {event.dateEnd ? ` – ${formatDate(event.dateEnd, lang)}` : ''}
                    </span>
              }
              <span className="modal-source">{SOURCE_LABELS[event.source]}</span>
            </div>

            <div className="modal-actions">
              <span className="modal-price">{event.price}</span>
              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-cta"
                >
                  {t('featured.cta')}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
