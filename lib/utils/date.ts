/**
 * Date formatting utilities
 */

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatWeekDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getWeekStartDate(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Calculate days to subtract to get to Monday (start of week)
  // Monday (1) -> 0 days back, Tuesday (2) -> 1 day back, ..., Sunday (0) -> 6 days back
  const daysToSubtract = day === 0 ? 6 : day - 1
  const diff = d.getDate() - daysToSubtract
  const result = new Date(d.setDate(diff))
  result.setHours(0, 0, 0, 0) // Set to midnight to avoid timezone issues
  return result
}

export function getDayName(dayOfWeek: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[dayOfWeek] || ''
}

export function getDayAbbreviation(dayOfWeek: number): string {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days[dayOfWeek] || ''
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC midnight off-by-one). */
export function parseLocalDateString(isoDate: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim())
  if (m) {
    const y = Number(m[1])
    const mo = Number(m[2]) - 1
    const day = Number(m[3])
    const d = new Date(y, mo, day)
    d.setHours(0, 0, 0, 0)
    return d
  }
  const d = new Date(isoDate)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Scheduled calendar day for a plan row (Mon=0 … Sun=6). Null day = not on a weekday yet. */
export function scheduledDateFromWeekAndDay(
  weekStartDate: Date,
  dayOfWeek: number | null
): Date | null {
  if (dayOfWeek === null) return null
  return addDays(weekStartDate, dayOfWeek)
}

