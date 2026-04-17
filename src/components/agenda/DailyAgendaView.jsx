import { memo } from 'react'
import { CalendarPlus, Link2, MapPin, Pencil, Trash2 } from 'lucide-react'
import { formatAgendaWindow, formatLongDate } from '../../lib/dateTime'

const AgendaCard = memo(function AgendaCard({
  agenda,
  profile,
  onEditAgenda,
  onDeleteAgenda,
  onExportAgenda,
}) {
  const isDefaultOfficialFor = agenda.officialFor === profile.name

  return (
    <article className="agenda-card">
      <div className="agenda-card__main">
        <div className="agenda-card__meta">
          <span className="agenda-time">
            {formatAgendaWindow(agenda, profile.settings.defaultTimezone)}
          </span>
          {!isDefaultOfficialFor ? <span className="badge">{agenda.officialFor}</span> : null}
          <span className="badge badge--subtle">{agenda.meetingType}</span>
          {agenda.attendeeType ? (
            <span className="badge badge--subtle">{agenda.attendeeType}</span>
          ) : null}
        </div>
        <h3>{agenda.title}</h3>
        {agenda.description ? <p className="pre-line">{agenda.description}</p> : null}
        <div className="agenda-card__details">
          {agenda.location ? (
            <span>
              <MapPin size={14} />
              {agenda.location}
            </span>
          ) : null}
          {agenda.accessDetails ? (
            <span>
              <Link2 size={14} />
              {agenda.accessDetails}
            </span>
          ) : null}
          {agenda.attendeeType && agenda.attendeeNames ? (
            <span>
              {agenda.attendeeType}: {agenda.attendeeNames}
            </span>
          ) : null}
        </div>
      </div>

      <div className="agenda-card__actions">
        <button
          className="icon-button"
          title="Tambah ke Google Calendar"
          type="button"
          onClick={() => onExportAgenda(agenda)}
        >
          <CalendarPlus size={18} />
        </button>
        <button
          className="icon-button"
          title="Edit agenda"
          type="button"
          onClick={() => onEditAgenda(agenda)}
        >
          <Pencil size={18} />
        </button>
        <button
          className="icon-button icon-button--danger"
          title="Hapus agenda"
          type="button"
          onClick={() => onDeleteAgenda(agenda)}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  )
})

function DailyAgendaView({
  profile,
  agendas,
  selectedDateKey,
  onAddAgenda,
  onEditAgenda,
  onDeleteAgenda,
  onExportAgenda,
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Daily Agenda</p>
          <h2>{formatLongDate(selectedDateKey)}</h2>
        </div>
        <button className="button button--primary" type="button" onClick={onAddAgenda}>
          Tambah Agenda
        </button>
      </div>

      {agendas.length === 0 ? (
        <div className="empty-inline">
          <p>Belum ada agenda di tanggal ini.</p>
        </div>
      ) : (
        <div className="agenda-list">
          {agendas.map((agenda) => (
            <AgendaCard
              key={agenda.id}
              agenda={agenda}
              profile={profile}
              onDeleteAgenda={onDeleteAgenda}
              onEditAgenda={onEditAgenda}
              onExportAgenda={onExportAgenda}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default memo(DailyAgendaView)
