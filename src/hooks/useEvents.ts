import { useState, useEffect, useMemo } from 'react'
import { ArtEvent, FilterKey, SortKey } from '../types/event'
import { isEndingSoon } from '../utils/dateUtils'
import { computePopularityScore, isIconicVenue } from '../utils/popularityScore'
import { FILTER_GROUP1, FILTER_GROUP2 } from '../utils/filterGroups'

function decorateEvents(arr: ArtEvent[]): ArtEvent[] {
  return arr.map(e => ({
    ...e,
    tags: [
      ...(e.tags ?? []).filter((t: string) => t !== 'ending-soon'),
      ...(isEndingSoon(e) ? ['ending-soon' as const] : []),
    ],
    popularityScore: computePopularityScore(e),
  }))
}

function matchesFilter(e: ArtEvent, f: FilterKey): boolean {
  switch (f) {
    case 'ending-soon': return e.tags.includes('ending-soon')
    case 'free':        return e.isFree
    case 'family':      return e.tags.includes('family')
    case 'exhibition':  return e.category === 'exhibition'
    case 'concert':     return e.category === 'concert'
    case 'theatre':     return e.category === 'theatre'
    case 'interactive': return e.category === 'interactive'
    case 'popular':     return isIconicVenue(e.venue)
    case 'permanent':   return e.isPermanent
    default:            return true
  }
}

export function useEvents(activeFilters: Set<FilterKey>, searchQuery: string, sortKey: SortKey = 'date') {
  const [events, setEvents] = useState<ArtEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [eventsRes, permRes] = await Promise.all([
          fetch('/data/events.json'),
          fetch('/data/permanent-exhibitions.json'),
        ])
        if (!eventsRes.ok) throw new Error('events.json not found')
        const data = await eventsRes.json()
        const arr: ArtEvent[] = Array.isArray(data) ? data : data.events ?? []
        const permArr: ArtEvent[] = permRes.ok ? await permRes.json() : []
        setEvents(decorateEvents([...arr, ...permArr]))
      } catch (e) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let result = events

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        e =>
          e.title.fr.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.title.en ?? '').toLowerCase().includes(q)
      )
    }

    if (!activeFilters.has('all')) {
      const g1 = FILTER_GROUP1.filter(f => activeFilters.has(f))
      const g2 = FILTER_GROUP2.filter(f => activeFilters.has(f))

      // Group1: OR — event must match at least one selected type
      if (g1.length > 0) {
        result = result.filter(e => g1.some(f => matchesFilter(e, f)))
      }

      // Group2: OR within group, AND with group1 result
      if (g2.length > 0) {
        result = result.filter(e => g2.some(f => matchesFilter(e, f)))
      }
    }

    if (sortKey === 'popularity') {
      return [...result].sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
    }
    return [...result].sort((a, b) =>
      new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()
    )
  }, [events, activeFilters, searchQuery, sortKey])

  const stats = useMemo(() => ({
    exhibitions: events.filter(e => e.category === 'exhibition').length,
    concerts:    events.filter(e => e.category === 'concert').length,
    free:        events.filter(e => e.isFree).length,
    endingSoon:  events.filter(e => e.tags.includes('ending-soon')).length,
    total:       events.length,
  }), [events])

  return { events: filtered, total: events.length, loading, error, stats }
}
