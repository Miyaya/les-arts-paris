import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { fetchAllEvents } from './adapters/index'
import { EventsMeta } from '../src/types/event'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isDryRun = process.argv.includes('--dry-run')
const DATA_DIR = resolve(__dirname, '../public/data')

async function main() {
  console.log(`[fetch-events] Starting${isDryRun ? ' (dry run)' : ''}…`)
  const startedAt = Date.now()

  let events: Awaited<ReturnType<typeof fetchAllEvents>>['events'] = []
  let counts = { paris_opendata: 0 }

  try {
    const result = await fetchAllEvents()
    const now = new Date()

    // 1. Remove ended events
    const afterDateFilter = result.events.filter(e =>
      e.isPermanent || !e.dateEnd || new Date(e.dateEnd) >= now
    )

    // 2. Remove sports / non-cultural events via tag blacklist
    const SPORT_BLACKLIST = [
      'sport', 'sportif', 'sportive', 'sportives',
      'piscine', 'natation', 'aquatique',
      'foot', 'football', 'basket', 'basketball', 'rugby', 'handball',
      'tennis', 'volleyball', 'boxe', 'judo', 'karaté', 'yoga',
      'fitness', 'gym', 'gymnastique', 'musculation',
      'vélo', 'cyclisme', 'course à pied', 'marathon', 'running',
      'senior', 'sénior', 'seniors', 'séniors', 'retraite',
      'marché', 'brocante', 'vide-grenier', 'braderie',
    ]
    const sportRe = new RegExp(SPORT_BLACKLIST.map(w => `\\b${w}`).join('|'), 'i')

    const afterBlacklist = afterDateFilter.filter(e => {
      if (e.source !== 'paris-opendata') return true
      if (e.category !== 'other') return true
      const haystack = [e.title.fr, e.description.fr ?? '', e.venue].join(' ')
      return !sportRe.test(haystack)
    })

    // 3. Keep only events from culturally significant venues
    const VENUE_QUALITY_KEYWORDS = [
      'musée', 'musee', 'museum',
      'fondation', 'foundation',
      'galerie', 'gallery',
      'philharmonie', 'opéra', 'opera',
      'théâtre', 'theatre', 'théatre',
      'châtelet', 'chatelet',
      'palais', 'grand palais', 'petit palais',
      'louvre', 'orsay', 'pompidou', 'versailles',
      'villette', 'sainte-chapelle', 'invalides',
      'mémorial', 'memorial',
      'institut', 'institute',
      'cité', 'cite des sciences',
      'bourse de commerce',
      'comédie', 'comedie',
      'cinémathèque', 'cinematheque',
      'salle pleyel', 'salle gaveau',
      'forum des images',
    ]
    const venueQualityRe = new RegExp(VENUE_QUALITY_KEYWORDS.join('|'), 'i')

    // Venues that match quality keywords but are not art/culture (community hubs, research)
    const VENUE_EXCLUDE = [
      'conservatoire', 'académie du climat', 'fondation maison des sciences',
    ]
    const venueExcludeRe = new RegExp(VENUE_EXCLUDE.join('|'), 'i')

    const afterVenueFilter = afterBlacklist.filter(e => {
      if (e.source !== 'paris-opendata') return true
      if (venueExcludeRe.test(e.venue)) return false
      return venueQualityRe.test(e.venue)
    })

    // 4. Remove 'other' category and events with very short descriptions
    const afterQualityFilter = afterVenueFilter.filter(e =>
      e.category !== 'other' && (e.description?.fr?.length ?? 0) >= 70
    )

    // 5. Merge recurring events (same title + venue → one entry with all dates)
    const groups = new Map<string, typeof afterQualityFilter>()
    for (const e of afterQualityFilter) {
      const key = `${e.title.fr.trim().toLowerCase()}|${e.venue.trim().toLowerCase()}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(e)
    }

    const afterMerge: typeof afterQualityFilter = []
    let mergedCount = 0
    for (const group of groups.values()) {
      if (group.length === 1) {
        afterMerge.push(group[0])
        continue
      }
      // Sort by start date, pick the one with the earliest upcoming start as the base
      group.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime())
      const base = { ...group[0] }
      base.occurrences = group.map(e => ({ start: e.dateStart, end: e.dateEnd }))
      // dateEnd = latest end across all occurrences
      const ends = group.map(e => e.dateEnd).filter(Boolean) as string[]
      base.dateEnd = ends.length ? ends.sort().at(-1)! : null
      afterMerge.push(base)
      mergedCount += group.length - 1
    }

    events = afterMerge
    counts = result.counts
    const removedDate    = result.events.length - afterDateFilter.length
    const removedSport   = afterDateFilter.length - afterBlacklist.length
    const removedVenue   = afterBlacklist.length - afterVenueFilter.length
    const removedQuality = afterVenueFilter.length - afterQualityFilter.length
    console.log(`[fetch-events] Fetched ${result.events.length} → -${removedDate} ended → -${removedSport} sports → -${removedVenue} low-quality venues → -${removedQuality} low-quality events → -${mergedCount} merged duplicates → ${events.length} final (paris=${counts.paris_opendata})`)
  } catch (err) {
    console.error('[fetch-events] Fatal error:', err)
    process.exit(1)
  }

  const meta: EventsMeta = {
    generated_at: new Date().toISOString(),
    sources: counts,
    total: events.length,
  }

  console.log(`[fetch-events] Done in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`)

  if (isDryRun) {
    console.log('[fetch-events] Dry run — not writing files')
    console.log('meta:', JSON.stringify(meta, null, 2))
    return
  }

  mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(resolve(DATA_DIR, 'events.json'), JSON.stringify(events, null, 2))
  writeFileSync(resolve(DATA_DIR, 'events-meta.json'), JSON.stringify(meta, null, 2))
  console.log('[fetch-events] Written public/data/events.json and events-meta.json')
}

main()
