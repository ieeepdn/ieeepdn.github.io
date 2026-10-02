import { Hero, type HeroEvent } from '@/components/sections/Hero'
import { SpotlightBanner, SpotlightHero } from '@/components/sections/Spotlight'
import { Manifesto } from '@/components/sections/Manifesto'
import { ChaptersBento } from '@/components/sections/ChaptersBento'
import { ProgrammesScroller } from '@/components/sections/ProgrammesScroller'
import { Timeline } from '@/components/sections/Timeline'
import { MomentsMosaic } from '@/components/sections/MomentsMosaic'
import { isPhoto, toPhoto } from '@/lib/photos'
import { CtaBand } from '@/components/sections/CtaBand'
import { Showreel } from '@/components/sections/Showreel'
import { SectionHeader } from '@/components/SectionHeader'
import { EventCard } from '@/components/EventCard'
import { PostCard } from '@/components/PostCard'
import { VtoolsBadge } from '@/components/VtoolsBadge'
import { Reveal, Marquee } from '@/components/ui/motion'
import {
  asChapter,
  getAlbums,
  getChapters,
  getEvents,
  getFeaturedPosts,
  getPeople,
  getPrograms,
  getSettings,
  getSpotlight,
  mediaUrl,
} from '@/lib/data'
import { dateShort, dayOf, monthOf } from '@/lib/format'
import { milestones } from '@/lib/milestones'


export default async function HomePage() {
  const [settings, spotlight, chapters, upcoming, past, posts, programmes, albums] = await Promise.all([
    getSettings(),
    getSpotlight(),
    getChapters(),
    getEvents({ when: 'upcoming', limit: 6 }),
    getEvents({ when: 'past', limit: 6 }),
    getFeaturedPosts(4),
    getPrograms(),
    getAlbums(),
  ])


  const next = upcoming[0]
  const nextEvent: HeroEvent = next
    ? {
        title: next.title,
        href: `/events/${next.slug || next.vtoolsId || next.id}`,
        chapter: asChapter(next.chapter)?.shortName ?? 'Branch',
        dateLabel: dateShort(next.start),
        day: dayOf(next.start),
        month: monthOf(next.start),
        venue: next.virtual ? 'Online' : next.venue,
      }
    : null

  const society = chapters.filter((c) => c.kind !== 'branch')
  const teams = await Promise.all(society.map((c) => getPeople(c.id)))
  // events the branch webmaster ticked "Featured" jump the queue; otherwise date order is kept
  const featuredFirst = <T extends { featured?: boolean | null }>(list: T[]) => [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
  const events = featuredFirst(upcoming.length ? upcoming : past).slice(0, 3)

  const photos = albums
    .flatMap((a) => {
      const ch = asChapter(a.chapter)
      const chip = ch ? { label: ch.kind === 'branch' ? 'Branch' : ch.shortName, accent: ch.accent ?? '#00629B' } : null
      return (a.photos ?? []).map((p) => toPhoto(p, { caption: a.title, chip }))
    })
    .filter(isPhoto)
  const photoCount = albums.reduce((n, a) => n + (a.photos?.length ?? 0), 0)

  const [lead, ...rest] = posts

  return (
    <>
      {spotlight?.style === 'hero' ? (
        <SpotlightHero s={spotlight} />
      ) : (
        <Hero
          kicker={settings.heroKicker ?? 'Est. 19 July 2001'}
          title={settings.heroTitle ?? 'Sri Lanka’s first IEEE Student Branch.'}
          accent={settings.heroAccent ?? 'Still building the future.'}
          text={settings.heroText ?? ''}
          nextEvent={nextEvent}
          chapters={society.map((c) => ({ slug: c.slug ?? '', shortName: c.shortName, accent: c.accent ?? '#00629B', logo: mediaUrl(c.logo, 'thumb') }))}
        />
      )}

      {/* chapter ticker */}
      <div className="border-y border-white/10 bg-night py-5 text-white">
        <Marquee duration={45}>
          {[...society, ...society].map((c, i) => (
            <span key={i} className="mx-8 flex items-center gap-4 font-display text-2xl font-bold tracking-tight text-white/80 md:text-3xl">
              <span className="size-2.5 rounded-full" style={{ background: c.accent ?? '#43c6f4' }} />
              {c.name}
            </span>
          ))}
        </Marquee>
      </div>

      {spotlight?.style === 'banner' && <SpotlightBanner s={spotlight} />}

      <Manifesto
        statement="We inspire future engineers to achieve, and lead our community to greater heights — by giving every student a platform to reach out to the world and try everything, because we believe in the impact engineers can make to build a better tomorrow for everyone."
        stats={(settings.stats ?? []).map((s) => ({ value: s.value, suffix: s.suffix, label: s.label }))}
        vision={settings.vision ?? ''}
        mission={settings.mission ?? ''}
      />

      <ChaptersBento
        chapters={society.map((c, i) => ({
          slug: c.slug ?? '',
          shortName: c.shortName,
          name: c.name,
          kind: c.kind,
          tagline: c.tagline,
          accent: c.accent ?? '#00629B',
          logo: mediaUrl(c.logo, 'thumb'),
          cover: mediaUrl(c.cover, 'card'),
          members: teams[i].length,
          faces: teams[i].map((p) => mediaUrl(p.photo, 'thumb')).filter((u): u is string => Boolean(u)).slice(0, 9),
          upcoming: upcoming.filter((e) => asChapter(e.chapter)?.id === c.id).length,
        }))}
      />

      <ProgrammesScroller
        programmes={programmes.map((p) => ({
          slug: p.slug ?? '',
          name: p.name,
          edition: p.edition,
          tagline: p.tagline,
          summary: p.summary,
          accent: p.accent ?? '#00629B',
          cover: mediaUrl(p.cover, 'hero'),
          stats: (p.stats ?? []).map((s) => ({ value: s.value, label: s.label })),
        }))}
      />

      <section className="bg-paper atmos pb-28 md:pb-36">
        <div className="container-x">
          <SectionHeader
            eyebrow={upcoming.length ? 'Coming up' : 'Recently'}
            title={upcoming.length ? 'Don’t miss what’s next.' : 'What we’ve been up to.'}
            link={{ href: '/events', label: 'All events' }}
          />
          <Reveal className="mb-8">
            <VtoolsBadge lastSync={settings.vtoolsLastSync} />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.08} className="h-full">
                <EventCard event={e} past={!upcoming.length} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Timeline items={milestones} />

      {lead && (
        <section className="bg-mist atmos py-28 md:py-36">
          <div className="container-x">
            <SectionHeader eyebrow="News & stories" title="From the chapters." link={{ href: '/news', label: 'All stories' }} />
            <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr]">
              <Reveal>
                <PostCard post={lead} large />
              </Reveal>
              <div className="flex flex-col gap-10">
                {rest.slice(0, 3).map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.08}>
                    <PostCard post={p} className="sm:grid sm:grid-cols-[0.9fr_1.1fr] sm:items-start sm:gap-6" />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <MomentsMosaic photos={photos} title="Life at the branch." totalLabel={`${photoCount} photos in ${albums.length} albums`} />

      {settings.showreel && <Showreel videoId={settings.showreel} channel={settings.youtube} />}

      <CtaBand />
    </>
  )
}
