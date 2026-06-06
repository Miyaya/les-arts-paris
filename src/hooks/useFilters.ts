import { useState, useCallback } from 'react'
import { FilterKey, SortKey } from '../types/event'
import { FILTER_GROUP1, FILTER_GROUP2 } from '../utils/filterGroups'

const ALL_INDIVIDUAL = new Set<FilterKey>([...FILTER_GROUP1, ...FILTER_GROUP2])

export function useFilters() {
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set(['all']))
  const [searchQuery, setSearchQuery]     = useState('')
  const [sortKey, setSortKey]             = useState<SortKey>('popularity')

  const toggleFilter = useCallback((f: FilterKey) => {
    setActiveFilters(prev => {
      if (f === 'all') return new Set(['all'])

      const next = new Set(prev)
      next.delete('all')

      if (next.has(f)) {
        next.delete(f)
        if (next.size === 0) next.add('all')
      } else {
        // Clicking a group1 filter deselects other group1 filters only when
        // starting fresh (current set is 'all') — otherwise just adds to selection
        next.add(f)
        // If all individual filters are selected, collapse back to 'all'
        if ([...ALL_INDIVIDUAL].every(k => next.has(k))) {
          return new Set(['all'])
        }
      }
      return next
    })
  }, [])

  const setSearch  = useCallback((q: string) => setSearchQuery(q), [])
  const toggleSort = useCallback(() => setSortKey(k => k === 'date' ? 'popularity' : 'date'), [])

  return { activeFilters, searchQuery, sortKey, toggleFilter, setSearch, toggleSort }
}
