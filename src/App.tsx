import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RuleTopBar } from './components/layout/RuleTopBar'
import { Masthead } from './components/layout/Masthead'
import { SearchBar } from './components/layout/SearchBar'
import { FilterStrip } from './components/layout/FilterStrip'
import { BottomStatsBar } from './components/layout/BottomStatsBar'
import { ListView } from './components/views/ListView'
import { MapView } from './components/views/MapView'
import { FeedbackButton } from './components/FeedbackButton'
import { useEvents } from './hooks/useEvents'
import { useFilters } from './hooks/useFilters'
import { ViewMode } from './types/event'

export default function App() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { activeFilters, searchQuery, sortKey, toggleFilter, setSearch, toggleSort } = useFilters()
  const { events, total, loading, error, stats } = useEvents(activeFilters, searchQuery, sortKey)

  return (
    <div className="page-outer">
      <div className="page-wrapper">
        <RuleTopBar />
        <Masthead eventCount={events.length} totalCount={total} />
        {error && <div className="error-banner">{t('errors.fetch_failed')}</div>}
        <div className="sticky-controls">
          <SearchBar
            searchQuery={searchQuery}
            onSearch={setSearch}
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
          <FilterStrip activeFilters={activeFilters} onToggleFilter={toggleFilter} sortKey={sortKey} onToggleSort={toggleSort} />
        </div>

        <main className="page-main">
          {viewMode === 'list' && (
            <ListView events={events} loading={loading} error={error} />
          )}
          {viewMode === 'map' && (
            <MapView events={events} />
          )}
        </main>

        <BottomStatsBar
          exhibitions={stats.exhibitions}
          concerts={stats.concerts}
          free={stats.free}
          endingSoon={stats.endingSoon}
        />
      </div>
      <FeedbackButton />
    </div>
  )
}
