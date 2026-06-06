import { ArtEvent } from '../../src/types/event'

const BASE_URL = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records'

function mapCategory(tagsStr: string): ArtEvent['category'] {
  const t = tagsStr.toLowerCase()
  if (t.includes('expo') || t.includes('art contemporain') || t.includes('peinture') || t.includes('photo')) return 'exhibition'
  if (t.includes('concert') || t.includes('spectacle musical') || t.includes('musique')) return 'concert'
  if (t.includes('théâtre') || t.includes('danse') || t.includes('cirque') || t.includes('humour')) return 'theatre'
  if (t.includes('atelier') || t.includes('innovation') || t.includes('jeux')) return 'interactive'
  if (t.includes('balade urbaine') || t.includes('histoire') || t.includes('patrimoine')) return 'landmark'
  return 'other'
}

interface RawRecord {
  id?: string
  url?: string
  title?: string
  lead_text?: string
  date_start?: string
  date_end?: string
  address_name?: string
  address_street?: string
  address_zipcode?: string
  lat_lon?: { lat: number; lon: number }
  qfap_tags?: string
  price_type?: string
  price_detail?: string
  cover_url?: string
  contact_url?: string
  audience?: string
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizePrice(priceType: string | undefined, priceDetail: string | undefined): string {
  if (priceType === 'gratuit') return 'Gratuit'
  if (priceType === 'gratuit sous condition') return 'Gratuit*'
  if (!priceDetail) return '—'
  const clean = stripHtml(priceDetail)
  // Extract first price mention: "12 €", "12,50 €", "12.50€", "12 euros"
  const m = clean.match(/(\d+(?:[,\.]\d+)?)\s*(?:€|euros?)/i)
  if (m) {
    const val = parseFloat(m[1].replace(',', '.'))
    // Check for a second price (range)
    const remaining = clean.slice(clean.indexOf(m[0]) + m[0].length)
    const m2 = remaining.match(/(\d+(?:[,\.]\d+)?)\s*(?:€|euros?)/i)
    if (m2) {
      const val2 = parseFloat(m2[1].replace(',', '.'))
      if (val2 !== val) {
        const [lo, hi] = val < val2 ? [val, val2] : [val2, val]
        return `€${lo}–${hi}`
      }
    }
    return `€${val}`
  }
  return '—'
}

function mapRecord(r: RawRecord, fetchedAt: string): ArtEvent | null {
  if (!r.title || !r.date_start) return null

  const tagsStr = r.qfap_tags ?? ''
  const tagsLower = tagsStr.toLowerCase()
  const audience = (r.audience ?? '').toLowerCase()

  const isFree = r.price_type === 'gratuit'
  const eventTags: ArtEvent['tags'] = []

  const isFamily =
    tagsLower.includes('enfants') ||
    audience.includes('enfant') ||
    audience.includes('jeune')
  if (isFamily) eventTags.push('family')
  if (isFree) eventTags.push('free')
  if (tagsLower.includes('nature') || tagsLower.includes('balade')) eventTags.push('outdoor')

  const lat = r.lat_lon?.lat ?? 48.8566
  const lng = r.lat_lon?.lon ?? 2.3522
  const zipcode = r.address_zipcode ?? '75000'
  const isPermanent = !r.date_end

  const desc = r.lead_text ? stripHtml(r.lead_text) : ''
  const priceStr = normalizePrice(r.price_type, r.price_detail)

  return {
    id: `paris-${r.id ?? Math.random().toString(36).slice(2)}`,
    title: { fr: r.title },
    description: { fr: desc },
    venue: r.address_name ?? 'Paris',
    address: [r.address_street, zipcode].filter(Boolean).join(', '),
    district: zipcode,
    lat,
    lng,
    dateStart: r.date_start,
    dateEnd: r.date_end ?? null,
    isPermanent,
    category: mapCategory(tagsStr),
    tags: eventTags,
    isFree,
    price: priceStr,
    imageUrl: r.cover_url ?? undefined,
    ticketUrl: r.contact_url ?? r.url ?? undefined,
    source: 'paris-opendata',
    fetchedAt,
  }
}

export async function fetchParisOpenData(): Promise<ArtEvent[]> {
  const fetchedAt = new Date().toISOString()
  const events: ArtEvent[] = []
  const pageSize = 100
  let offset = 0
  let total = Infinity

  while (offset < total) {
    const params = new URLSearchParams({
      limit: String(pageSize),
      offset: String(offset),
      where: 'date_end >= now()',
      order_by: 'date_start ASC',
      select: [
        'id', 'url', 'title', 'lead_text',
        'date_start', 'date_end',
        'address_name', 'address_street', 'address_zipcode',
        'lat_lon', 'qfap_tags', 'price_type', 'price_detail',
        'cover_url', 'contact_url', 'audience',
      ].join(','),
    })

    const res = await fetch(`${BASE_URL}?${params}`)
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Paris Open Data error ${res.status}: ${body}`)
    }
    const data = await res.json() as { total_count: number; results: RawRecord[] }
    total = data.total_count

    for (const r of data.results) {
      const mapped = mapRecord(r, fetchedAt)
      if (mapped) events.push(mapped)
    }

    offset += data.results.length
    if (data.results.length < pageSize) break
  }

  console.log(`[paris-opendata] fetched ${events.length} / ${total} events`)
  return events
}
