import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewMode } from '../../types/event'

interface Props {
  searchQuery: string
  onSearch: (q: string) => void
  viewMode: ViewMode
  onViewChange: (v: ViewMode) => void
}

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: 'list', label: 'view.list' },
  { key: 'map', label: 'view.map' },
]

export function SearchBar({ searchQuery, onSearch, viewMode, onViewChange }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="search-bar">
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="search-input"
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => onSearch('')}>✕</button>
        )}
      </div>
      <div className="view-toggle">
        {VIEWS.map(v => (
          <button
            key={v.key}
            onClick={() => onViewChange(v.key)}
            className={`view-btn${viewMode === v.key ? ' active' : ''}`}
          >
            {t(v.label)}
          </button>
        ))}
      </div>
    </div>
  )
}
