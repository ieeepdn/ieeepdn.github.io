import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock, MapPin, Video } from 'lucide-react'
import { EventCard } from '@/components/EventCard'
import { Reveal } from '@/components/ui/motion'
import { asChapter, eventKey, getAllEvents, getEvent, getEvents, mediaInfo } from '@/lib/data'
import { MediaFrame } from '@/components/ui/MediaFrame'
import { PhotoSet } from '@/components/ui/Photos'
import { isPhoto, toPhoto } from '@/lib/photos'
import { dateLong, isMidnight, timeRange } from '@/lib/format'
import { stripHtml } from '@/lib/html'


export const dynamicParams = false

export async function generateStaticParams() {
  return (await getAllEvents()).map((e) => ({ slug: eventKey(e) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const e = await getEvent(slug)
  if (!e) return {}
  return { title: e.title, description: e.summary ?? undefined }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event || event.hidden) notFound()
  const chapter = asChapter(event.chapter)
  const accent = chapter?.accent || '#00629B'
  const upcoming = new Date(event.end ?? event.start).getTime() >= Date.now()
  const more = (await getEvents({ when: 'upcoming', limit: 4 })).filter((e) => e.id !== event.id).slice(0, 3)
  const cover = mediaInfo(event.cover, 'hero', event.title)
  const gallery = (event.gallery ?? []).map((m) => toPhoto(m, { caption: event.title })).filter(isPhoto)
  const body = event.descriptionHtml ? stripHtml(event.descriptionHtml) : event.summary ?? ''

  const gcal = new URL('https://calendar.google.com/calendar/render')
  const toCal = (iso?: string | null) => (iso ? new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '') : '')
  gcal.searchParams.set('action', 'TEMPLATE')
  gcal.searchParams.set('text', event.title)
  gcal.searchParams.set('dates', `${toCal(event.start)}/${toCal(event.end ?? event.start)}`)
  gcal.searchParams.set('location', event.virtual ? 'Online' : event.venue ?? 'University of Peradeniya')
  gcal.searchParams.set('details', `${event.summary ?? ''}\n\n${event.vtoolsUrl ?? ''}`)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.start,
    endDate: event.end ?? undefined,
    eventAttendanceMode: event.virtual ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.virtual ? { '@type': 'VirtualLocation', url: event.vtoolsUrl } : { '@type': 'Place', name: event.venue ?? 'University of Peradeniya', address: event.city ?? 'Peradeniya, Sri Lanka' },
    organizer: { '@type': 'Organization', name: chapter?.name ?? 'IEEE Student Branch, University of Peradeniya' },
    description: event.summary,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="grain relative isolate overflow-hidden bg-night pb-20 pt-40 text-white md:pt-48">
        {cover && <Image src={cover.thumb} alt="" fill sizes="200px" className="-z-20 scale-110 object-cover opacity-40 blur-3xl saturate-150" />}
        <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(ellipse 70% 70% at 85% 0%, ${accent}aa, transparent 60%), linear-gradient(to bottom, rgba(3,10,19,.3), #030a13)` }} />
        <div className={cover ? 'container-x grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]' : 'container-x'}>
        <div className="flex min-w-0 flex-col gap-8">
          <Link href="/events" className="flex w-fit items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden /> All events
          </Link>
          <div className="flex flex-wrap gap-2">
            {chapter && <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ background: accent }}>{chapter.shortName}</span>}
            <span className="rounded-full border border-white/20 px-3 py-1 font-mono text-xs uppercase tracking-widest">{upcoming ? 'Upcoming' : 'Past event'}</span>
          </div>
          <h1 className="max-w-[22ch] font-display text-[clamp(2.4rem,6vw,5.4rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">{event.title}</h1>
          <div className="grid gap-4 text-white/80 md:grid-cols-3">
            <span className="flex items-center gap-3"><CalendarDays className="size-5 text-cyan" aria-hidden />{dateLong(event.start)}</span>
            {!isMidnight(event.start) && <span className="flex items-center gap-3"><Clock className="size-5 text-cyan" aria-hidden />{timeRange(event.start, event.end)} (Sri Lanka)</span>}
            <span className="flex items-center gap-3">
              {event.virtual ? <Video className="size-5 text-cyan" aria-hidden /> : <MapPin className="size-5 text-cyan" aria-hidden />}
              {event.virtual ? 'Online' : event.venue || 'University of Peradeniya'}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {upcoming && (event.registrationUrl || event.vtoolsUrl) && (
              <a href={event.registrationUrl || event.vtoolsUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-6 font-semibold text-night hover:bg-cyan">
                Register on vTools <ArrowUpRight className="size-4" aria-hidden />
              </a>
            )}
            {upcoming && (
              <a href={gcal.toString()} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2 rounded-full border border-white/25 px-6 font-semibold hover:bg-white/10">
                Add to Google Calendar
              </a>
            )}
            {event.vtoolsUrl && (
              <a href={event.vtoolsUrl} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2 px-2 font-semibold text-cyan hover:text-white">
                View on vTools <ArrowUpRight className="size-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
        {cover && (
          <Reveal delay={0.1}>
            <MediaFrame
              media={cover}
              ratio={Math.min(Math.max(cover.width / cover.height, 0.75), 1.5)}
              priority
              zoom={false}
              sizes="(min-width: 1024px) 400px, 90vw"
              className="rounded-[1.75rem] border border-white/10 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)]"
            />
          </Reveal>
        )}
        </div>
      </section>

      <section className="bg-paper atmos py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="prose-ieee">
            {body.split(/\n+/).filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
          <aside className="flex flex-col gap-4 rounded-[1.5rem] border border-line bg-surface p-7 lg:self-start">
            <span className="eyebrow text-brand">Hosted by</span>
            <span className="font-display text-2xl font-bold">{chapter?.name ?? event.hostName}</span>
            {chapter?.slug && chapter.kind !== 'branch' && (
              <Link href={`/chapters/${chapter.slug}`} className="font-semibold text-brand hover:underline">Visit the {chapter.shortName} page</Link>
            )}
            {event.source === 'vtools' && <span className="font-mono text-xs text-ink-3">Source: IEEE vTools event #{event.vtoolsId}</span>}
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-mist atmos py-20">
          <div className="container-x">
            <div className="mb-8 flex items-center gap-4">
              <h2 className="font-display text-3xl font-extrabold tracking-[-0.03em]">Photos</h2>
              <span className="font-mono text-xs text-ink-3">{gallery.length}</span>
            </div>
            <PhotoSet photos={gallery} />
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="bg-mist atmos py-20">
          <div className="container-x">
            <h2 className="mb-8 font-display text-3xl font-extrabold tracking-[-0.03em]">More coming up</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {more.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
