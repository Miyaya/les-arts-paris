import { ArtEvent } from '../types/event'

export function isEndingSoon(event: ArtEvent): boolean {
  if (!event.dateEnd || event.isPermanent) return false
  const end = new Date(event.dateEnd)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= 0 && diffDays < 7
}

export function daysLeft(event: ArtEvent): number | null {
  if (!event.dateEnd) return null
  const end = new Date(event.dateEnd)
  const now = new Date()
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-TW' : locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

export function formatDateShort(dateStr: string | null, locale: string): string {
  if (!dateStr) return 'Perm.'
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  if (locale === 'en') return `${month}/${day}`
  return `${day}.${month}`
}

export function formatDateRange(start: string | null, end: string | null, locale: string): string {
  const s = formatDateShort(start, locale)
  if (!end) return s
  const e = formatDateShort(end, locale)
  if (s === e) return s
  return `${s}–${e}`
}
