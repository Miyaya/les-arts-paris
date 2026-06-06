import { useTranslation } from 'react-i18next'

interface Props {
  eventCount: number
  totalCount: number
}

export function Masthead({ eventCount, totalCount }: Props) {
  const { t } = useTranslation()

  return (
    <div className="masthead">
      <div className="masthead-left">
        <h1 className="masthead-logo">
          <span className="logo-serif">Les Arts</span>
          <span className="logo-italic"> Paris.</span>
        </h1>
        <div className="masthead-rule" />
        <p className="masthead-tagline">{t('site.tagline')}</p>
      </div>
      <div className="masthead-right">
        <span className="masthead-count">
          {String(eventCount).padStart(2, '0')}
          <span className="masthead-count-total">/{totalCount}</span>
        </span>
        <span className="masthead-count-label">{t('list.active_events')}</span>
      </div>
    </div>
  )
}
