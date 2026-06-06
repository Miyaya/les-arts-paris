export interface ArtEvent {
  id: string
  title: { fr: string; en?: string; zh?: string }
  description: { fr: string; en?: string; zh?: string }
  venue: string
  address: string
  district: string
  lat: number
  lng: number
  dateStart: string
  dateEnd: string | null
  isPermanent: boolean
  category: 'exhibition' | 'concert' | 'theatre' | 'interactive' | 'landmark' | 'other'
  tags: Array<'family' | 'free' | 'ending-soon' | 'outdoor'>
  isFree: boolean
  price: string
  priceMin?: number
  priceMax?: number
  imageUrl?: string
  ticketUrl?: string
  source: 'paris-opendata' | 'curated'
  fetchedAt: string
  popularityScore?: number
  occurrences?: Array<{ start: string; end: string | null }>
}

export interface EventsMeta {
  generated_at: string
  sources: { paris_opendata: number }
  total: number
}

export type FilterKey = 'all' | 'exhibition' | 'concert' | 'theatre' | 'interactive' | 'family' | 'free' | 'ending-soon' | 'popular' | 'permanent'

export type SortKey = 'date' | 'popularity'

export type ViewMode = 'list' | 'map'
