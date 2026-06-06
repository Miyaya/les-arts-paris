import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  exhibitions: number
  concerts: number
  free: number
  endingSoon: number
}

export function BottomStatsBar({ exhibitions, concerts, free, endingSoon }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/events-meta.json')
      .then(r => r.json())
      .then(d => setUpdatedAt(d.generated_at ?? null))
      .catch(() => {})
  }, [])

  const timestamp = updatedAt
    ? new Intl.DateTimeFormat(
        lang === 'zh' ? 'zh-TW' : lang === 'en' ? 'en-GB' : 'fr-FR',
        { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }
      ).format(new Date(updatedAt))
    : '—'

  return (
    <div className="bottom-stats-bar">
      <span className="stat-item">
        <span className="stat-label">{t('stats.expositions')}</span>
        <span className="stat-value">{String(exhibitions).padStart(2, '0')}</span>
      </span>
      <span className="stat-sep">│</span>
      <span className="stat-item">
        <span className="stat-label">{t('stats.concerts')}</span>
        <span className="stat-value">{String(concerts).padStart(2, '0')}</span>
      </span>
      <span className="stat-sep">│</span>
      <span className="stat-item">
        <span className="stat-label">{t('stats.gratuits')}</span>
        <span className="stat-value">{String(free).padStart(2, '0')}</span>
      </span>
      <span className="stat-sep">│</span>
      <span className="stat-item ending">
        <span className="stat-label">{t('stats.ending_soon')}</span>
        <span className="stat-value">{String(endingSoon).padStart(2, '0')}</span>
      </span>
      <span className="stat-sep">│</span>
      <span className="stat-item">
        <span className="stat-label">{t('stats.updated')}</span>
        <span className="stat-value stat-timestamp">{timestamp}</span>
      </span>
    </div>
  )
}
