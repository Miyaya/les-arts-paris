import { ArtEvent } from '../types/event'

export const ICONIC_VENUES = [
  'louvre', 'pompidou', 'orsay', 'versailles', 'philharmonie',
  'palais royal', 'grand palais', 'petit palais', 'villette',
  'sainte-chapelle', 'invalides', 'opéra', 'châtelet', 'bourse de commerce',
  'stade de france', 'salle pleyel', 'palais de tokyo',
  'musée rodin', 'musée picasso', 'cité des sciences',

]

export function isIconicVenue(venue: string): boolean {
  const v = venue.toLowerCase()
  return ICONIC_VENUES.some(name => v.includes(name))
}

export function computePopularityScore(event: ArtEvent): number {
  let score = 0

  if (event.isFree)     score += 20
  if (event.imageUrl)   score += 5

  if (event.priceMax && event.priceMax > 60) score += 15

  if (isIconicVenue(event.venue)) score += 25

  if (event.dateStart && event.dateEnd) {
    const days = (new Date(event.dateEnd).getTime() - new Date(event.dateStart).getTime()) / 86_400_000
    if (days > 90)      score += 15
    else if (days > 30) score += 8
  }
  if (event.isPermanent) score += 10

  const categoryBonus: Record<string, number> = {
    exhibition:  5,
    concert:     8,
    interactive: 6,
    theatre:     5,
    landmark:   10,
    other:       0,
  }
  score += categoryBonus[event.category] ?? 0

  if (event.tags.includes('family')) score += 5

  return Math.min(100, Math.round(score))
}

export function scoreToStars(score: number): 1 | 2 | 3 | 4 {
  if (score >= 75) return 4
  if (score >= 50) return 3
  if (score >= 25) return 2
  return 1
}
