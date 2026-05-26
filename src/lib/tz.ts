const NY_TZ = 'America/New_York'

function nyParts(d: Date): Record<string, string> {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: NY_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
      hour12: false,
    }).formatToParts(d).map(p => [p.type, p.value])
  )
}

function nyHour(parts: Record<string, string>): number {
  // hour12:false can return "24" for midnight in some implementations
  const h = parseInt(parts.hour)
  return h === 24 ? 0 : h
}

export function isInReleaseWindow(): boolean {
  const parts = nyParts(new Date())
  if (parts.weekday !== 'Wed') return false
  const totalMin = nyHour(parts) * 60 + parseInt(parts.minute)
  // 10:30 to 10:44 NY
  return totalMin >= 630 && totalMin < 645
}

export function getNextWpsrRelease(): Date {
  const now = new Date()
  const parts = nyParts(now)

  const nyYear = parseInt(parts.year)
  const nyMonth = parseInt(parts.month) - 1 // 0-indexed
  const nyDay = parseInt(parts.day)
  const hour = nyHour(parts)
  const minute = parseInt(parts.minute)
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const nyDow = weekdays.indexOf(parts.weekday)

  let daysAhead = (3 - nyDow + 7) % 7
  if (daysAhead === 0 && (hour > 10 || (hour === 10 && minute >= 30))) {
    daysAhead = 7 // already past this week's 10:30, go to next
  }

  // Target Wednesday in NY
  const targetNY = new Date(nyYear, nyMonth, nyDay + daysAhead)
  const tY = targetNY.getFullYear()
  const tM = String(targetNY.getMonth() + 1).padStart(2, '0')
  const tD = String(targetNY.getDate()).padStart(2, '0')

  // Probe 15:30 UTC on the target day to compute the NY UTC offset
  // 15:30 UTC is always 10:30–11:30 NY regardless of DST
  const probe = new Date(`${tY}-${tM}-${tD}T15:30:00Z`)
  const probeParts = nyParts(probe)
  const probeNYMin = nyHour(probeParts) * 60 + parseInt(probeParts.minute)
  const probeUTCMin = probe.getUTCHours() * 60 + probe.getUTCMinutes()

  // NY offset = NY_time - UTC_time (negative for ET since NY is behind UTC)
  const nyOffsetMin = probeNYMin - probeUTCMin

  // 10:30 AM NY → UTC: UTC = NY_time - offset
  const targetUTCMin = 10 * 60 + 30 - nyOffsetMin
  const targetUTCH = Math.floor(targetUTCMin / 60)
  const targetUTCM = targetUTCMin % 60

  return new Date(Date.UTC(tY, parseInt(tM) - 1, parseInt(tD), targetUTCH, targetUTCM, 0))
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00:00'
  const s = Math.floor(ms / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(s / 86400))}:${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}
