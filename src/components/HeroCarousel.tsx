import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../types/event'
import { daysLeft, formatDate } from '../utils/dateUtils'
import { scoreToStars } from '../utils/popularityScore'

interface Props {
  events: ArtEvent[]
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

export function HeroCarousel({ events }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const featured = events.slice(0, 6)
  const [idx, setIdx] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const go = useCallback((next: number) => {
    setIdx((next + featured.length) % featured.length)
    setAnimKey(k => k + 1)
  }, [featured.length])

  const prev = () => go(idx - 1)
  const next = () => go(idx + 1)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, featured.length])

  if (!featured.length) return null

  const ev     = featured[idx]
  const stars  = scoreToStars(ev.popularityScore ?? 0)
  const title = ev.title[lang as 'fr' | 'en' | 'zh'] ?? ev.title.fr
  const desc  = ev.description[lang as 'zh' | 'fr' | 'en'] ?? ev.description.fr
  const days  = daysLeft(ev)
  const ending = ev.tags.includes('ending-soon')
  const catColor = CATEGORY_COLOR[ev.category] ?? 'var(--indigo-bright)'

  return (
    <div className="hero-carousel">

      {/* ── top nav bar ── */}
      <div className="hero-topbar">
        <span className="hero-pos">
          {String(idx + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
        </span>
        <div className="hero-dots">
          {featured.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              className={`hero-dot${i === idx ? ' active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div className="hero-arrows">
          <button className="hero-arrow" onClick={prev} aria-label="Précédent">←</button>
          <button className="hero-arrow" onClick={next} aria-label="Suivant">→</button>
        </div>
      </div>

      {/* ── slide content ── */}
      <div key={animKey} className={`hero-slide${ev.imageUrl ? ' has-image' : ''}`}>

        {ev.imageUrl && (
          <div className="hero-img-col">
            <img src={ev.imageUrl} alt={title} className="hero-img" />
          </div>
        )}

        <div className="hero-info-col">
          <div className="hero-eyebrow">
            <span className="hero-cat" style={{ background: catColor }}>
              {t(`filters.${ev.category}`, { defaultValue: ev.category.toUpperCase() }).toUpperCase()}
            </span>
            <span className={`hero-stars stars-${stars}`} title={`${ev.popularityScore ?? 0}/100`}>
              {'★'.repeat(stars)}{'☆'.repeat(4 - stars)}
            </span>
            {ev.isFree && <span className="hero-free-badge">{t('event.free')}</span>}
            {ending && days !== null && (
              <span className="hero-ending-badge">J–{days}</span>
            )}
          </div>

          <h2 className="hero-title">{title}</h2>
          <p  className="hero-venue">{ev.venue}<span className="hero-district"> · {ev.district}</span></p>

          {desc && (
            <p className="hero-desc">{desc.slice(0, 200)}{desc.length > 200 ? '…' : ''}</p>
          )}

          <div className="hero-footer">
            <div className="hero-meta-row">
              {!ev.isPermanent && (
                <span className="hero-date">
                  {formatDate(ev.dateStart, lang)}
                  {ev.dateEnd ? ` – ${formatDate(ev.dateEnd, lang)}` : ''}
                </span>
              )}
              {ev.isPermanent && <span className="hero-date">{t('event.permanent')}</span>}
              <span className="hero-source-tag">{SOURCE_LABELS[ev.source]}</span>
            </div>

            <div className="hero-action-row">
              <span className="hero-price">{ev.price}</span>
              {ev.ticketUrl && (
                <a
                  href={ev.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta"
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
