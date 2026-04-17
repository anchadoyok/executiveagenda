import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatDateKey,
  formatMonthLabel,
  getCalendarDays,
  getWeekdayLabels,
  isSameDay,
} from '../../lib/dateTime'

export default function AgendaCalendar({
  currentMonth,
  selectedDate,
  counts,
  settings,
  onMonthChange,
  onSelectDate,
}) {
  const days = getCalendarDays(currentMonth, settings.firstDayOfWeek)
  const today = new Date()
  const labels = getWeekdayLabels(settings.firstDayOfWeek)

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Kalender</p>
          <h2>{formatMonthLabel(currentMonth)}</h2>
        </div>
        <div className="panel-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => onMonthChange(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onMonthChange(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-grid calendar-grid--labels">
        {labels.map((label) => (
          <span key={label} className="calendar-label">
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date) => {
          const dateKey = formatDateKey(date)
          const count = counts[dateKey] ?? 0
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today)

          return (
            <button
              key={dateKey}
              className={`calendar-day ${isCurrentMonth ? '' : 'calendar-day--dim'} ${
                isSelected ? 'calendar-day--selected' : ''
              } ${isToday ? 'calendar-day--today' : ''}`}
              type="button"
              onClick={() => onSelectDate(date)}
            >
              <span className="calendar-day__number">{date.getDate()}</span>
              {settings.showCalendarCounts && count > 0 ? (
                <strong className="calendar-badge">{count}</strong>
              ) : null}
            </button>
          )
        })}
      </div>
    </section>
  )
}
