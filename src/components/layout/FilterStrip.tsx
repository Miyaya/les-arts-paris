import { useTranslation } from 'react-i18next'
import { FilterKey, SortKey } from '../../types/event'
import { FILTER_GROUP1, FILTER_GROUP2 } from '../../utils/filterGroups'

const POPULAR_VENUES = [
  'Musée du Louvre',
  'Centre Pompidou',
  'Musée d\'Orsay',
  'Château de Versailles',
  'Philharmonie de Paris',
  'Palais Royal',
  'Grand Palais',
  'Petit Palais',
  'La Villette',
  'Sainte-Chapelle',
  'Les Invalides',
  'Opéra de Paris',
  'Théâtre du Châtelet',
  'Bourse de Commerce',
]

interface Props {
  activeFilters: Set<FilterKey>
  onToggleFilter: (f: FilterKey) => void
  sortKey: SortKey
  onToggleSort: () => void
}

function pillClass(f: FilterKey, active: boolean): string {
  const classes = ['filter-pill']
  if (active)               classes.push('active')
  if (f === 'ending-soon')  classes.push('ending-soon')
  if (f === 'popular')      classes.push('popular')
  if (f === 'permanent')    classes.push('permanent')
  if (f === 'free')         classes.push('attr')
  if (f === 'family')       classes.push('attr')
  if (f === 'ending-soon')  classes.push('attr')
  return classes.join(' ')
}

export function FilterStrip({ activeFilters, onToggleFilter, sortKey, onToggleSort }: Props) {
  const { t } = useTranslation()
  const isAll = activeFilters.has('all')

  return (
    <div className="filter-strip">
      {/* Reset */}
      <button
        onClick={() => onToggleFilter('all')}
        className={`filter-pill filter-all${isAll ? ' active' : ''}`}
      >
        {t('filters.all')}
      </button>

      <span className="filter-group-sep" />

      {/* Group 1 — types (OR) */}
      <div className="filter-group">
        <span className="filter-group-label">{t('filters.group_type')}</span>
        <div className="filter-pills">
          {FILTER_GROUP1.map(f => {
            if (f === 'popular') {
              return (
                <span key={f} className="pill-tooltip-wrap">
                  <button
                    onClick={() => onToggleFilter(f)}
                    className={pillClass(f, activeFilters.has(f))}
                  >
                    {t(`filters.${f}`)}
                  </button>
                  <div className="pill-tooltip">
                    <span className="pill-tooltip-title">{t('filters.popular')}</span>
                    {POPULAR_VENUES.map(v => (
                      <span key={v} className="pill-tooltip-item">{v}</span>
                    ))}
                  </div>
                </span>
              )
            }
            return (
              <button
                key={f}
                onClick={() => onToggleFilter(f)}
                className={pillClass(f, activeFilters.has(f))}
              >
                {t(`filters.${f}`)}
              </button>
            )
          })}
        </div>
      </div>

      <span className="filter-group-sep" />

      {/* Group 2 — attributes (OR within, AND with group1) */}
      <div className="filter-group">
        <span className="filter-group-label">{t('filters.group_attr')}</span>
        <div className="filter-pills">
          {FILTER_GROUP2.map(f => (
            <button
              key={f}
              onClick={() => onToggleFilter(f)}
              className={pillClass(f, activeFilters.has(f))}
            >
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <span className="filter-group-sep" />

      <button className={`sort-btn${sortKey === 'popularity' ? ' active' : ''}`} onClick={onToggleSort}>
        {t(`sort.${sortKey}`)}
      </button>
    </div>
  )
}
