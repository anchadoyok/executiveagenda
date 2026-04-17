import { memo } from 'react'
import { CalendarPlus, Link2, MapPin, Pencil, Trash2 } from 'lucide-react'
import { formatAgendaWindow, formatDateKey, getWeekDates } from '../../lib/dateTime'

function WeeklyAgendaView({
  profile,
  selectedDate,
  agendasByDate,
  onSelectDate,
  onEditAgenda,
  onDeleteAgenda,
  onExportAgenda,
}) {
  const weekDates = getWeekDates(selectedDate, profile.settings.firstDayOfWeek)

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Weekly Agenda</p>
          <h2>
            {weekDates[0].toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            })}{' '}
            -{' '}
            {weekDates[6].toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </h2>
        </div>
      </div>

      <div className="week-grid">
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date)
          const dayAgendas = agendasByDate[dateKey] ?? []

          return (
            <article key={dateKey} className="week-day">
              <button
                className="week-day__title"
                type="button"
                onClick={() => onSelectDate(date)}
              >
                <strong>
                  {date.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </strong>
                <span>{dayAgendas.length} agenda</span>
              </button>

              <div className="week-day__items">
                {dayAgendas.length === 0 ? (
                  <p className="muted-text">Tidak ada agenda.</p>
                ) : (
                  dayAgendas.map((agenda) => (
                    <div key={agenda.id} className="week-agenda-card">
                      <p className="week-agenda-card__time">
                        {formatAgendaWindow(agenda, profile.settings.defaultTimezone)}
                      </p>
                      <strong>{agenda.title}</strong>
                      <div className="agenda-card__details">
                        {agenda.location ? (
                          <span>
                            <MapPin size={13} />
                            {agenda.location}
                          </span>
                        ) : null}
                        {agenda.accessDetails ? (
                          <span>
                            <Link2 size={13} />
                            {agenda.accessDetails}
                          </span>
                        ) : null}
                      </div>
                      <div className="mini-actions">
                        <button
                          className="icon-button"
                          title="Tambah ke Google Calendar"
                          type="button"
                          onClick={() => onExportAgenda(agenda)}
                        >
                          <CalendarPlus size={16} />
                        </button>
                        <button
                          className="icon-button"
                          title="Edit agenda"
                          type="button"
                          onClick={() => onEditAgenda(agenda)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button icon-button--danger"
                          title="Hapus agenda"
                          type="button"
                          onClick={() => onDeleteAgenda(agenda)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default memo(WeeklyAgendaView)
