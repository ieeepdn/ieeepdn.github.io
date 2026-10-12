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
import { getHome, type HomeSectionName } from '@/lib/site'
import { Fragment } from 'react'


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

  const home = getHome()
  const copyOf = (name: HomeSectionName) => {
    const s = home.sections.find((x) => x.section === name)
    return s ? { eyebrow: s.eyebrow, heading: s.heading, text: s.text } : undefined
  }

  // every home page section, by the name editors use in Pages CMS → Home page → Sections
  const render: Record<HomeSectionName, (prev?: HomeSectionName) => React.ReactNode> = {
    'Chapter ticker': () => (
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
    ),
    'Spotlight banner': () => (spotlight?.style === 'banner' ? <SpotlightBanner s={spotlight} /> : null),
    'Why we exist': () => (
      <Manifesto
        statement={home.statement ?? 'We inspire future engineers to achieve, and lead our community to greater heights.'}
        stats={(settings.stats ?? []).map((s) => ({ value: s.value, suffix: s.suffix, label: s.label }))}
        vision={settings.vision ?? ''}
        mission={settings.mission ?? ''}
        copy={copyOf('Why we exist')}
      />
    ),
    Chapters: () => (
      <ChaptersBento
        copy={copyOf('Chapters')}
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
    ),
    'Flagship programmes': () =>
      programmes.length ? (
        <ProgrammesScroller
          copy={copyOf('Flagship programmes')}
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
      ) : null,
    Events: (prev) => {
      const c = copyOf('Events')
      // straight after the programmes (same background) the section needs no extra space on top
      return (
        <section className={prev === 'Flagship programmes' ? 'bg-paper atmos pb-28 md:pb-36' : 'bg-paper atmos pb-28 pt-28 md:pb-36 md:pt-36'}>
          <div className="container-x">
            <SectionHeader
              eyebrow={c?.eyebrow ?? (upcoming.length ? 'Coming up' : 'Recently')}
              title={c?.heading ?? (upcoming.length ? 'Don’t miss what’s next.' : 'What we’ve been up to.')}
              text={c?.text}
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
      )
    },
    'History timeline': () => (home.timeline.length ? <Timeline items={home.timeline} copy={copyOf('History timeline')} /> : null),
    'News & stories': () => {
      if (!lead) return null
      const c = copyOf('News & stories')
      return (
        <section className="bg-mist atmos py-28 md:py-36">
          <div className="container-x">
            <SectionHeader eyebrow={c?.eyebrow ?? 'News & stories'} title={c?.heading ?? 'From the chapters.'} text={c?.text} link={{ href: '/news', label: 'All stories' }} />
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
      )
    },
    'Photo moments': () => {
      const c = copyOf('Photo moments')
      return photos.length ? (
        <MomentsMosaic photos={photos} eyebrow={c?.eyebrow} title={c?.heading ?? 'Life at the branch.'} totalLabel={`${photoCount} photos in ${albums.length} albums`} />
      ) : null
    },
    Video: () => (settings.showreel ? <Showreel videoId={settings.showreel} channel={settings.youtube} copy={copyOf('Video')} /> : null),
    'Call to action': () => {
      const c = copyOf('Call to action')
      return <CtaBand title={c?.heading ?? home.cta.title} text={c?.text ?? home.cta.text} />
    },
  }

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
          background={home.hero.background}
          image={home.hero.image}
          nextEvent={nextEvent}
          chapters={society.map((c) => ({ slug: c.slug ?? '', shortName: c.shortName, accent: c.accent ?? '#00629B', logo: mediaUrl(c.logo, 'thumb') }))}
        />
      )}
      {home.sections
        .filter((s) => s.show)
        .map((s, i, shown) => (
          <Fragment key={s.section}>{render[s.section](shown[i - 1]?.section)}</Fragment>
        ))}
    </>
  )
}
