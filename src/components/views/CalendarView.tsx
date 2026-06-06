import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArtEvent } from '../../types/event'

interface Props {
  events: ArtEvent[]
}

const CATEGORY_DOT: Record<string, string> = {
  exhibition: '#4A3A90',
  concert: '#2D2060',
  theatre: '#6B1A2A',
  interactive: '#3A6040',
  landmark: '#8B2A3A',
  other: '#C8BFAE',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function CalendarView({ events }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstWd = getFirstWeekday(year, month)
  const blanks = firstWd === 0 ? 6 : firstWd - 1

  function eventsOnDay(day: number): ArtEvent[] {
    const date = new Date(year, month, day)
    return events.filter(e => {
      const start = new Date(e.dateStart)
      const end = e.dateEnd ? new Date(e.dateEnd) : null
      if (!end) return start <= date
      return start <= date && date <= end
    })
  }

  const dayEvents = selectedDay ? eventsOnDay(selectedDay) : []

  const monthLabel = new Intl.DateTimeFormat(
    lang === 'zh' ? 'zh-TW' : lang === 'en' ? 'en-GB' : 'fr-FR',
    { month: 'long', year: 'numeric' }
  ).format(new Date(year, month))

  const WEEKDAYS = lang === 'zh'
    ? ['一', '二', '三', '四', '五', '六', '日']
    : lang === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  return (
    <div className="calendar-view">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{monthLabel.toUpperCase()}</span>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map(d => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`b${i}`} className="cal-blank" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayEvs = eventsOnDay(day)
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
          return (
            <div
              key={day}
              className={`cal-day${isToday ? ' today' : ''}${selectedDay === day ? ' selected' : ''}${dayEvs.length > 0 ? ' has-events' : ''}`}
              onClick={() => setSelectedDay(selectedDay === day ? null : day)}
            >
              <span className="cal-day-num">{day}</span>
              {dayEvs.length > 0 && (
                <div className="cal-dots">
                  {dayEvs.slice(0, 3).map(e => (
                    <span
                      key={e.id}
                      className="cal-dot"
                      style={{ background: CATEGORY_DOT[e.category] ?? '#4A3A90' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {selectedDay && (
        <div className="cal-day-panel">
          <span className="cal-day-panel-title">
            {selectedDay} — {dayEvents.length} événement{dayEvents.length !== 1 ? 's' : ''}
          </span>
          {dayEvents.length === 0 ? (
            <p className="cal-no-events">{t('calendar.no_events')}</p>
          ) : (
            <div className="cal-day-events">
              {dayEvents.map(e => (
                <div key={e.id} className="cal-event-item">
                  <span
                    className="cal-event-dot"
                    style={{ background: CATEGORY_DOT[e.category] ?? '#4A3A90' }}
                  />
                  <span className="cal-event-title">
                    {e.title[lang as 'fr' | 'en' | 'zh'] ?? e.title.fr}
                  </span>
                  <span className="cal-event-venue">{e.venue}</span>
                  <span className="cal-event-price">{e.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
