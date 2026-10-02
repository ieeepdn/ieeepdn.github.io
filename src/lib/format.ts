const TZ = 'Asia/Colombo'

export const fmt = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions) =>
  iso ? new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(new Date(iso)) : ''

export const dayOf = (iso?: string | null) => fmt(iso, { day: '2-digit' })
export const monthOf = (iso?: string | null) => fmt(iso, { month: 'short' }).toUpperCase()
export const yearOf = (iso?: string | null) => fmt(iso, { year: 'numeric' })
export const dateLong = (iso?: string | null) => fmt(iso, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
export const dateShort = (iso?: string | null) => fmt(iso, { day: 'numeric', month: 'short', year: 'numeric' })
export const timeOf = (iso?: string | null) => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', ' ')

export const timeRange = (start?: string | null, end?: string | null) => {
  if (!start) return ''
  const s = timeOf(start)
  if (!end) return s
  return `${s} – ${timeOf(end)}`
}

export const isMidnight = (iso?: string | null) => (iso ? fmt(iso, { hour: '2-digit', minute: '2-digit', hour12: false }) === '00:00' : true)

export const relativeFromNow = (iso?: string | null) => {
  if (!iso) return ''
  const diff = new Date(iso).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const mins = Math.round(diff / 60000)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hours = Math.round(mins / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(months / 12), 'year')
}

export const readingTime = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 220))
