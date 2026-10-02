import { getChapters } from '@/lib/data'
import { calendar } from '@/lib/calendar'

export const dynamic = 'force-static'
export const dynamicParams = false

export async function generateStaticParams() {
  return (await getChapters()).filter((c) => c.slug).map((c) => ({ chapter: `${c.slug}.ics` }))
}

/** One chapter's events: /calendar/cs.ics */
export async function GET(_req: Request, { params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params
  return new Response(await calendar(chapter.replace(/\.ics$/, '')), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } })
}
