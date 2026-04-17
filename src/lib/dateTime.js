import { DAYS_OF_WEEK } from './constants'

export function pad(value) {
  return String(value).padStart(2, '0')
}

export function formatDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLongDate(value) {
  const date = typeof value === 'string' ? parseDateKey(value) : value
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTimeWithDots(time) {
  return time ? time.replace(':', '.') : ''
}

export function formatMonthLabel(date) {
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

export function moveMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

export function isSameDay(left, right) {
  return formatDateKey(left) === formatDateKey(right)
}

export function getWeekStart(date, firstDayOfWeek = 1) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (next.getDay() - firstDayOfWeek + 7) % 7
  next.setDate(next.getDate() - offset)
  return next
}

export function getWeekDates(anchorDate, firstDayOfWeek = 1) {
  const start = getWeekStart(anchorDate, firstDayOfWeek)
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start)
    next.setDate(start.getDate() + index)
    return next
  })
}

export function getCalendarDays(currentMonth, firstDayOfWeek = 1) {
  const firstOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  )
  const calendarStart = getWeekStart(firstOfMonth, firstDayOfWeek)

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(calendarStart)
    next.setDate(calendarStart.getDate() + index)
    return next
  })
}

export function getWeekdayLabels(firstDayOfWeek = 1) {
  return DAYS_OF_WEEK.map((_, index) => DAYS_OF_WEEK[(index + firstDayOfWeek) % 7])
}

export function getOffsetMinutesForTimezone(timezone, dateLike) {
  const date =
    typeof dateLike === 'string'
      ? parseDateKey(dateLike)
      : new Date(
          dateLike.getFullYear(),
          dateLike.getMonth(),
          dateLike.getDate(),
          12,
          0,
          0,
        )

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  const offsetPart = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')

  if (!offsetPart) {
    return 0
  }

  const match = offsetPart.value.match(/GMT([+-]\d+)(?::(\d+))?/)
  if (!match) {
    return 0
  }

  const sign = match[1].startsWith('-') ? -1 : 1
  const hours = Number(match[1].slice(1))
  const minutes = Number(match[2] ?? 0)
  return sign * (hours * 60 + minutes)
}

export function getTimezoneAbbreviation(timezone) {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone,
    timeZoneName: 'short',
  })
  const part = formatter
    .formatToParts(new Date('2024-07-01T12:00:00Z'))
    .find((entry) => entry.type === 'timeZoneName')

  return part?.value ?? timezone.split('/').at(-1)?.replace(/_/g, ' ') ?? timezone
}

export function getTimezoneCopyLabel(timezone, dateKey) {
  if (timezone === 'Asia/Jakarta') {
    return 'WIB'
  }

  if (timezone === 'Asia/Makassar') {
    return 'WITA'
  }

  if (timezone === 'Asia/Jayapura') {
    return 'WIT'
  }

  const offset = getOffsetMinutesForTimezone(timezone, dateKey)
  const sign = offset >= 0 ? '+' : '-'
  const absolute = Math.abs(offset)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60

  if (minutes === 0) {
    return `GMT${sign}${hours}`
  }

  return `GMT${sign}${hours}.${pad(minutes)}`
}

export function timeToMinutes(time) {
  if (!time) {
    return -1
  }

  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const minutes = normalized % 60
  return `${pad(hours)}:${pad(minutes)}`
}

export function convertTime(time, fromTimezone, toTimezone, dateKey) {
  if (!time) {
    return ''
  }

  const originalMinutes = timeToMinutes(time)
  const fromOffset = getOffsetMinutesForTimezone(fromTimezone, dateKey)
  const toOffset = getOffsetMinutesForTimezone(toTimezone, dateKey)
  const utcMinutes = originalMinutes - fromOffset
  return minutesToTime(utcMinutes + toOffset)
}

export function getUtcDateForAgenda(dateKey, time, timezone) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const minutes = timeToMinutes(time)
  const offset = getOffsetMinutesForTimezone(timezone, dateKey)
  const utcTimestamp =
    Date.UTC(year, month - 1, day, 0, 0, 0) + (minutes - offset) * 60 * 1000
  return new Date(utcTimestamp)
}

export function sortAgendasByTime(agendas) {
  return [...agendas].sort((left, right) => {
    const leftDate = getUtcDateForAgenda(
      left.date,
      left.startTime,
      left.timezone || 'Asia/Jakarta',
    ).getTime()
    const rightDate = getUtcDateForAgenda(
      right.date,
      right.startTime,
      right.timezone || 'Asia/Jakarta',
    ).getTime()
    return leftDate - rightDate
  })
}

export function groupAgendasByDate(agendas) {
  return agendas.reduce((groups, agenda) => {
    if (!groups[agenda.date]) {
      groups[agenda.date] = []
    }

    groups[agenda.date].push(agenda)
    return groups
  }, {})
}

export function buildAgendaCounts(agendas) {
  return agendas.reduce((counts, agenda) => {
    counts[agenda.date] = (counts[agenda.date] ?? 0) + 1
    return counts
  }, {})
}

export function formatAgendaWindow(agenda, displayTimezone) {
  const primaryTimezone = agenda.timezone || displayTimezone
  const primaryAbbr = getTimezoneAbbreviation(primaryTimezone)
  const endPrimary = agenda.isOpenEnded
    ? 'Selesai'
    : agenda.endTime
      ? formatTimeWithDots(agenda.endTime)
      : 'Tentatif'

  if (!displayTimezone || displayTimezone === primaryTimezone) {
    return `${formatTimeWithDots(agenda.startTime)} - ${endPrimary} ${primaryAbbr}`
  }

  const displayAbbr = getTimezoneAbbreviation(displayTimezone)
  const displayStart = convertTime(
    agenda.startTime,
    primaryTimezone,
    displayTimezone,
    agenda.date,
  )
  const displayEnd = agenda.isOpenEnded
    ? 'Selesai'
    : agenda.endTime
      ? formatTimeWithDots(
          convertTime(agenda.endTime, primaryTimezone, displayTimezone, agenda.date),
        )
      : 'Tentatif'

  return `${formatTimeWithDots(displayStart)} - ${displayEnd} ${displayAbbr} • ${formatTimeWithDots(agenda.startTime)} - ${endPrimary} ${primaryAbbr}`
}

export function createAgendaSummary(profile, agendas, dateKey) {
  const header = [
    `*Agenda ${profile.name}*`,
    formatLongDate(dateKey),
    '=========================',
  ].join('\n')

  const body = sortAgendasByTime(agendas)
    .map((agenda, index) => {
      const agendaTimezone = agenda.timezone || profile.settings.defaultTimezone
      const endTime = agenda.endTime ? formatTimeWithDots(agenda.endTime) : 'Selesai'
      const originalLabel = getTimezoneCopyLabel(agendaTimezone, agenda.date)
      const wibStart =
        agendaTimezone === 'Asia/Jakarta'
          ? formatTimeWithDots(agenda.startTime)
          : formatTimeWithDots(
              convertTime(agenda.startTime, agendaTimezone, 'Asia/Jakarta', agenda.date),
            )
      const wibEnd = agenda.endTime
        ? formatTimeWithDots(
            convertTime(agenda.endTime, agendaTimezone, 'Asia/Jakarta', agenda.date),
          )
        : 'Selesai'

      const timeLine =
        agendaTimezone === 'Asia/Jakarta'
          ? `> ${index + 1}. ${formatTimeWithDots(agenda.startTime)} - ${endTime} WIB`
          : agenda.endTime
            ? `> ${index + 1}. ${formatTimeWithDots(agenda.startTime)} - ${endTime} | ${originalLabel} | ${wibStart} - ${wibEnd} WIB`
            : `> ${index + 1}. ${formatTimeWithDots(agenda.startTime)} - Selesai | ${originalLabel} | ${wibStart} WIB`

      const lines = [timeLine]

      if (agenda.officialFor && agenda.officialFor !== profile.name) {
        lines.push(`*[Agenda ${agenda.officialFor}]*`)
      }

      lines.push(`*${agenda.title}*`)

      if (agenda.description) {
        lines.push(agenda.description)
      }

      if (agenda.location) {
        lines.push(`📍 Loc: ${agenda.location}`)
      }

      if (agenda.accessDetails) {
        lines.push(`📹 ${agenda.accessDetails}`)
      }

      if (agenda.attendeeType && agenda.attendeeNames) {
        lines.push(`_*${agenda.attendeeType}: ${agenda.attendeeNames}*_`)
      }

      return lines.join('\n')
    })
    .join('\n\n')

  return `${header}\n\n${body}`.trim()
}
