import 'server-only'
import { getEvents, asChapter } from '@/lib/data'

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')

/** iCalendar feed: all events, or one chapter's (used by /calendar/<chapter>.ics). */
export async function calendar(chapter: string | null) {
  const events = [...(await getEvents({ when: 'upcoming', limit: 200 })), ...(await getEvents({ when: 'past', limit: 100 }))]
  const site = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://ieee.soc.pdn.ac.lk') + (process.env.NEXT_PUBLIC_BASE_PATH || '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IEEE SB University of Peradeniya//Events//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:IEEE SB · University of Peradeniya',
    'X-WR-TIMEZONE:Asia/Colombo',
  ]
  for (const e of events) {
    const ch = asChapter(e.chapter)
    if (chapter && ch?.slug !== chapter) continue
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.vtoolsId ? `vtools-${e.vtoolsId}` : `event-${e.id}`}@ieee.soc.pdn.ac.lk`,
      `DTSTAMP:${stamp(e.updatedAt)}`,
      `DTSTART:${stamp(e.start)}`,
      `DTEND:${stamp(e.end ?? e.start)}`,
      `SUMMARY:${esc(`${ch ? `[${ch.shortName}] ` : ''}${e.title}`)}`,
      `DESCRIPTION:${esc(`${e.summary ?? ''}\n${e.registrationUrl ?? e.vtoolsUrl ?? ''}`)}`,
      `LOCATION:${esc(e.virtual ? 'Online' : e.venue ?? 'University of Peradeniya')}`,
      `URL:${site}/events/${e.slug || e.vtoolsId || e.id}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
