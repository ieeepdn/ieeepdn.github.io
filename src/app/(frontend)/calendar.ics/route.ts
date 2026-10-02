import { calendar } from '@/lib/calendar'

export const dynamic = 'force-static'

/** iCalendar feed of all branch & chapter events (subscribe from Google Calendar, Outlook, Apple Calendar). */
export async function GET() {
  return new Response(await calendar(null), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } })
}
