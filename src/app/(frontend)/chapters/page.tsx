import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { CommitteePerson } from '@/lib/data'
import { PageHero } from '@/components/PageHero'
import { CtaBand } from '@/components/sections/CtaBand'
import { ChapterExplorer, type ExplorerChapter } from '@/components/ChapterExplorer'
import { Reveal } from '@/components/ui/motion'
import { asChapter, getChapters, getEvents, getPeople, getPosts, mediaUrl } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Chapters',
  description: 'IEEE society chapters and the Women in Engineering affinity group at the University of Peradeniya.',
}

const leaderOrder = [/^(chair(man|person)?|president)$/i, /vice/i, /^secretary$/i, /web\s*master$/i, /treasurer/i]

function pickLeaders(people: CommitteePerson[]) {
  const execs = people.filter((p) => p.group === 'executive')
  const picked: CommitteePerson[] = []
  for (const rx of leaderOrder) {
    const hit = execs.find((p) => rx.test(p.position.trim()) && !picked.includes(p))
    if (hit) picked.push(hit)
    if (picked.length === 4) break
  }
  return picked
}

export default async function ChaptersPage() {
  const [chapters, events, upcoming, posts] = await Promise.all([
    getChapters(),
    getEvents({ limit: 1000 }),
    getEvents({ when: 'upcoming', limit: 200 }),
    getPosts({ limit: 500 }),
  ])
  const society = chapters.filter((c) => c.kind !== 'branch')
  const teams = await Promise.all(society.map((c) => getPeople(c.id)))
  const byChapter = <T extends { chapter?: unknown }>(list: T[], id: number) =>
    list.filter((x) => asChapter(x.chapter as never)?.id === id).length

  const data: ExplorerChapter[] = society.map((c, i) => ({
    slug: c.slug ?? '',
    shortName: c.shortName,
    name: c.name,
    kind: c.kind,
    tagline: c.tagline,
    about: c.about,
    accent: c.accent ?? '#00629B',
    logo: mediaUrl(c.logo, 'thumb'),
    cover: mediaUrl(c.cover, 'hero'),
    faces: teams[i].map((p) => mediaUrl(p.photo, 'thumb')).filter((u): u is string => Boolean(u)),
    leaders: pickLeaders(teams[i]).map((p) => ({ name: p.name, position: p.position, photo: mediaUrl(p.photo, 'thumb') })),
    members: teams[i].length,
    upcoming: byChapter(upcoming, c.id),
    events: byChapter(events, c.id),
    stories: byChapter(posts, c.id),
    founded: c.founded,
    highlights: (c.highlights ?? []).map((h) => ({ value: h.value, label: h.label })),
  }))

  const chairs = society
    .map((c, i) => ({ c, chair: teams[i].find((p) => /^(chair(man|person)?|president)$/i.test(p.position.trim())) }))
    .filter((x) => x.chair)

  const totalVolunteers = teams.reduce((a, t) => a + t.length, 0)

  return (
    <>
      <PageHero
        eyebrow="Chapters & affinity groups"
        title="Find your people."
        text={`Six technical society chapters and the Women in Engineering affinity group — ${totalVolunteers} student volunteers, each chapter with its own committee, events and webmaster.`}
        compact
      />

      <section className="bg-paper atmos py-16 md:py-24">
        <div className="container-x">
          <ChapterExplorer chapters={data} />
        </div>
      </section>

      {chairs.length > 0 && (
        <section className="bg-mist atmos py-20 md:py-28">
          <div className="container-x">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="flex flex-col gap-3">
                <Reveal>
                  <span className="eyebrow text-brand">Leadership</span>
                </Reveal>
                <Reveal delay={0.05}>
                  <h2 className="font-display text-[clamp(2.1rem,4.2vw,3.6rem)] font-extrabold leading-[1] tracking-[-0.04em]">The chairs.</h2>
                </Reveal>
              </div>
              <Reveal delay={0.1}>
                <p className="max-w-md text-ink-3">One chair per chapter, elected by its members every year. Say hello at the next event.</p>
              </Reveal>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
              {chairs.map(({ c, chair }, i) => {
                const photo = mediaUrl(chair!.photo, 'card')
                return (
                  <Reveal as="li" key={c.id} delay={i * 0.05}>
                    <Link href={`/chapters/${c.slug}#team`} className="group flex flex-col gap-3">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-paper-2">
                        {photo && (
                          <Image src={photo} alt={chair!.name} fill sizes="(min-width: 1024px) 14vw, 45vw" className="object-cover object-[50%_22%] transition duration-700 group-hover:scale-105" />
                        )}
                        <span className="absolute inset-x-0 bottom-0 h-1/2 opacity-70 mix-blend-soft-light" style={{ background: `linear-gradient(transparent, ${c.accent})` }} />
                        <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: c.accent ?? '#00629B' }}>
                          {c.shortName}
                        </span>
                      </span>
                      <span className="flex items-start justify-between gap-2">
                        <span className="flex flex-col">
                          <span className="font-display text-[1.05rem] font-bold leading-tight">{chair!.name}</span>
                          <span className="text-[13px] text-ink-3">{chair!.position}</span>
                        </span>
                        <ArrowUpRight className="mt-1 size-4 shrink-0 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" aria-hidden />
                      </span>
                    </Link>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      <CtaBand title="Want to lead a chapter?" text="Chapter committees are elected every year. Start as a team member — design, editorial, programming or events — and grow from there." />
    </>
  )
}
