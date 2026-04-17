import { createEvents } from 'ics'
import { getUtcDateForAgenda, sortAgendasByTime } from './dateTime'

function toUtcStamp(date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

function toUtcParts(date) {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ]
}

function addMinutes(date, amount) {
  return new Date(date.getTime() + amount * 60 * 1000)
}

function resolveAgendaEnd(agenda, start) {
  const usedTentativeEnd = !agenda.endTime && !agenda.isOpenEnded
  const end = agenda.isOpenEnded
    ? addMinutes(start, 180)
    : agenda.endTime
      ? getUtcDateForAgenda(agenda.date, agenda.endTime, agenda.timezone)
      : addMinutes(start, 180)

  return { end, usedTentativeEnd }
}

function buildAgendaDetails(profile, agenda, includeTentativeNote = false) {
  const lines = [
    agenda.description,
    agenda.location ? `Location: ${agenda.location}` : '',
    agenda.accessDetails ? `Link / Detail Akses: ${agenda.accessDetails}` : '',
    agenda.attendeeType && agenda.attendeeNames
      ? `${agenda.attendeeType}: ${agenda.attendeeNames}`
      : '',
    agenda.officialFor && agenda.officialFor !== profile.name
      ? `Agenda Untuk: ${agenda.officialFor}`
      : '',
  ].filter(Boolean)

  if (includeTentativeNote) {
    lines.push('', '(Waktu Selesai: Tentatif)')
  }

  return lines.join('\n')
}

function buildGoogleCalendarUrl(profile, agenda) {
  const start = getUtcDateForAgenda(agenda.date, agenda.startTime, agenda.timezone)
  const { end, usedTentativeEnd } = resolveAgendaEnd(agenda, start)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: agenda.title,
    details: buildAgendaDetails(profile, agenda, usedTentativeEnd),
    location: agenda.location || '',
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    ctz: agenda.timezone,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function openAgendaInGoogleCalendar(profile, agenda) {
  window.open(
    buildGoogleCalendarUrl(profile, agenda),
    '_blank',
    'noopener,noreferrer',
  )
}

export function downloadDayAsIcs(profile, agendas, dateKey) {
  const events = sortAgendasByTime(agendas)
    .filter((agenda) => agenda.date === dateKey)
    .map((agenda) => {
      const start = getUtcDateForAgenda(agenda.date, agenda.startTime, agenda.timezone)
      const { end, usedTentativeEnd } = resolveAgendaEnd(agenda, start)

      return {
        title: agenda.title,
        description: buildAgendaDetails(profile, agenda, usedTentativeEnd),
        location: agenda.location || undefined,
        start: toUtcParts(start),
        end: toUtcParts(end),
        startOutputType: 'utc',
        endOutputType: 'utc',
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
      }
    })

  if (!events.length) {
    return false
  }

  createEvents(events, (error, value) => {
    if (error) {
      console.error('Failed to build ICS file', error)
      return
    }

    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `${profile.name}-${dateKey}.ics`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(href)
  })

  return true
}
