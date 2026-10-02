import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { ArrowUpRight, Download, FileText } from 'lucide-react'
import clsx from 'clsx'
import type {
  CardsBlock,
  Chapter,
  ChapterAboutBlock,
  CtaBlock,
  DownloadsBlock,
  FeesBlock,
  ScheduleBlock,
  SpeakersBlock,
  VenueBlock,
  EventsBlock,
  FaqBlock,
  FormBlock,
  GalleryBlock,
  HeroBlock,
  LogosBlock,
  MediaTextBlock,
  Page,
  PageLinksBlock,
  PeopleBlock,
  StatsBlock,
  StoriesBlock,
  TextBlock,
  TimelineBlock,
  VideoBlock,
} from '@/payload-types'
import { Section, isDarkBg, resolveBg, type SectionStyle } from './Section'
import { Countdown } from './Countdown'
import { Fees, Schedule, Speakers, Venue } from './ConferenceBlocks'
import { FormView } from './FormView'
import { toFormDefinition } from '@/lib/forms'
import { SectionHeader } from '../SectionHeader'
import { EventCard } from '../EventCard'
import { PostCard } from '../PostCard'
import { Committee } from '../Committee'
import { Faq } from '../Faq'
import { MomentsMosaic } from '../sections/MomentsMosaic'
import { MediaFrame } from '../ui/MediaFrame'
import { PhotoSet } from '../ui/Photos'
import { CountUp, Reveal } from '../ui/motion'
import { toCommittee } from '@/lib/committee'
import { isPhoto, toPhoto } from '@/lib/photos'
import { formState } from '@/lib/forms'
import { SmartLink } from '../ui/SmartLink'
import { initials } from '@/lib/names'
import {
  accentVars,
  countResponses,
  getAlbum,
  getAlbums,
  getEvents,
  getForm,
  getPages,
  getPeople,
  getPosts,
  mediaInfo,
  mediaUrl,
} from '@/lib/data'

export type AnyBlock = NonNullable<Page['layout']>[number] | NonNullable<Chapter['layout']>[number]
export type BlockCtx = { chapter: Chapter; accent: string; page?: Page | null; breadcrumbs?: { label: string; href: string }[] }

type Btn = { label: string; url: string; variant?: 'primary' | 'secondary' | null; id?: string | null }


function Buttons({ items, accent, onDark }: { items?: Btn[] | null; accent: string; onDark?: boolean }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((b, i) => {
        const cls = clsx(
          'group inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold transition',
          b.variant === 'secondary'
            ? onDark
              ? 'border border-white/30 text-white hover:bg-white/10'
              : 'border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper'
            : onDark
              ? 'bg-white text-night hover:bg-cyan'
              : 'text-white hover:brightness-110',
        )
        const style = b.variant !== 'secondary' && !onDark ? { background: accent } : undefined
        const inner = (
          <>
            {b.label}
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
          </>
        )
        return (
          <SmartLink key={b.id ?? i} href={b.url} className={cls} style={style}>
            {inner}
          </SmartLink>
        )
      })}
    </div>
  )
}

function Header({ eyebrow, heading, text, link, center }: { eyebrow?: string | null; heading?: string | null; text?: string | null; link?: { href: string; label: string }; center?: boolean }) {
  if (!heading && !eyebrow) return null
  return <SectionHeader eyebrow={eyebrow ?? ''} title={heading ?? ''} text={text ?? undefined} link={link} className={center ? 'items-center text-center' : undefined} />
}

const styleOf = (b: SectionStyle) => ({ background: b.background, spacing: b.spacing, anchor: b.anchor })

// ---------------------------------------------------------------- blocks

function Hero({ b, ctx }: { b: HeroBlock; ctx: BlockCtx }) {
  const img = mediaUrl(b.image, 'hero')
  return (
    <section className="grain relative isolate overflow-hidden bg-night text-white" data-theme="dark">
      {img && <Image src={img} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: `radial-gradient(ellipse 70% 80% at 85% 0%, ${ctx.accent}b3, transparent 65%), linear-gradient(to bottom, rgba(3,10,19,0.25), #030a13)` }}
      />
      <div className="grid-lines absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div className="container-x flex flex-col gap-7 pb-20 pt-40 md:pb-24 md:pt-48">
        {ctx.breadcrumbs && ctx.breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/65">
            {ctx.breadcrumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={c.href} className="hover:text-white">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        {b.eyebrow && (
          <Reveal>
            <span className="eyebrow text-cyan">{b.eyebrow}</span>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          <h1 className="max-w-[18ch] font-display text-[clamp(2.8rem,7vw,6.6rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">{b.heading}</h1>
        </Reveal>
        {b.text && (
          <Reveal delay={0.12}>
            <p className="max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">{b.text}</p>
          </Reveal>
        )}
        {(b.dateLabel || b.countdownTo) && (
          <Reveal delay={0.16} className="flex flex-wrap items-center gap-4">
            {b.dateLabel && <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-sm tracking-wide text-white/85 backdrop-blur">{b.dateLabel}</span>}
            {b.countdownTo && <Countdown to={b.countdownTo} />}
          </Reveal>
        )}
        <Reveal delay={0.2}>
          <Buttons items={b.buttons as Btn[]} accent={ctx.accent} onDark />
        </Reveal>
      </div>
    </section>
  )
}

function Text({ b, ctx, i }: { b: TextBlock; ctx: BlockCtx; i: number }) {
  const split = b.width === 'split' && (b.heading || b.eyebrow)
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      {split ? (
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal className="flex flex-col gap-4">
            {b.eyebrow && <span className="eyebrow accent-text" style={accentVars(ctx.accent)}>{b.eyebrow}</span>}
            {b.heading && <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{b.heading}</h2>}
          </Reveal>
          <Reveal delay={0.08} className="prose-ieee max-w-3xl">
            <RichText data={b.content} />
          </Reveal>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <Header eyebrow={b.eyebrow} heading={b.heading} />
          <Reveal className="prose-ieee">
            <RichText data={b.content} />
          </Reveal>
        </div>
      )}
    </Section>
  )
}

function MediaText({ b, ctx, i }: { b: MediaTextBlock; ctx: BlockCtx; i: number }) {
  const dark = isDarkBg(resolveBg(b.background, i))
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <div className={clsx('grid items-center gap-10 lg:grid-cols-2 lg:gap-16', b.imageSide === 'right' && 'lg:[&>*:first-child]:order-2')}>
        <Reveal>
          <MediaFrame media={mediaInfo(b.image, 'hero')} ratio={4 / 3} sizes="(min-width: 1024px) 45vw, 100vw" className="rounded-[1.75rem] shadow-[var(--card-shadow)]" />
        </Reveal>
        <Reveal delay={0.08} className="flex flex-col gap-5">
          {b.eyebrow && <span className="eyebrow accent-text" style={accentVars(ctx.accent)}>{b.eyebrow}</span>}
          {b.heading && <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{b.heading}</h2>}
          {b.content && (
            <div className="prose-ieee">
              <RichText data={b.content} />
            </div>
          )}
          <Buttons items={b.buttons as Btn[]} accent={ctx.accent} onDark={dark} />
        </Reveal>
      </div>
    </Section>
  )
}

function Stats({ b, ctx, i }: { b: StatsBlock; ctx: BlockCtx; i: number }) {
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow} heading={b.heading} />
      <div className={clsx('grid grid-cols-2 border-t border-line', (b.items?.length ?? 0) >= 4 ? 'md:grid-cols-4' : 'md:grid-cols-3')}>
        {(b.items ?? []).map((s, k) => (
          <Reveal key={s.id ?? k} delay={k * 0.06} className="flex flex-col gap-3 border-b border-line py-8 pr-6 md:[&:not(:first-child)]:pl-8">
            <CountUp value={s.value} className="font-display text-[clamp(2.6rem,5.5vw,4.6rem)] font-extrabold leading-none tracking-[-0.04em]" />
            <span className="max-w-[24ch] text-[15px] leading-snug text-ink-3">{s.label}</span>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

function Cards({ b, ctx, i }: { b: CardsBlock; ctx: BlockCtx; i: number }) {
  const cols = b.columns === '2' ? 'md:grid-cols-2' : b.columns === '4' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow} heading={b.heading} text={b.intro} />
      <div className={clsx('grid gap-5', cols)}>
        {(b.items ?? []).map((c, k) => {
          const media = mediaInfo(c.image, 'card')
          const body = (
            <>
              {media && <MediaFrame media={media} ratio={16 / 10} sizes="(min-width: 1024px) 30vw, 100vw" />}
              <div className="flex flex-1 flex-col gap-3 p-6">
                {c.tag && (
                  <span className="accent-chip w-fit rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em]" style={accentVars(ctx.accent)}>
                    {c.tag}
                  </span>
                )}
                <h3 className="font-display text-[1.45rem] font-bold leading-tight tracking-[-0.02em]">{c.title}</h3>
                {c.text && <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-3">{c.text}</p>}
                {c.link && (
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold accent-text" style={accentVars(ctx.accent)}>
                    Learn more <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
                  </span>
                )}
              </div>
            </>
          )
          const cls = 'group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-line bg-surface shadow-[var(--card-shadow)] transition duration-500 hover:-translate-y-1'
          return (
            <Reveal key={c.id ?? k} delay={(k % 4) * 0.06} className="h-full">
              {c.link ? (
                <SmartLink href={c.link} className={cls}>
                  {body}
                </SmartLink>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

function Timeline({ b, ctx, i }: { b: TimelineBlock; ctx: BlockCtx; i: number }) {
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div>
          <Header eyebrow={b.eyebrow} heading={b.heading} />
        </div>
        <ol className="relative flex flex-col gap-2 border-l border-line pl-8">
          {(b.items ?? []).map((t, k) => (
            <Reveal as="li" key={t.id ?? k} delay={k * 0.05} className="relative pb-8">
              <span aria-hidden className="absolute -left-[2.35rem] top-1.5 size-3 rounded-full ring-4 ring-paper" style={{ background: ctx.accent }} />
              <span className="font-mono text-xs uppercase tracking-[0.14em] accent-text" style={accentVars(ctx.accent)}>
                {t.when}
              </span>
              <h3 className="mt-1.5 font-display text-2xl font-bold tracking-[-0.02em]">{t.title}</h3>
              {t.text && <p className="mt-2 max-w-2xl whitespace-pre-line leading-relaxed text-ink-3">{t.text}</p>}
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  )
}

async function Gallery({ b, ctx, i }: { b: GalleryBlock; ctx: BlockCtx; i: number }) {
  const chip = { label: ctx.chapter.kind === 'branch' ? 'Branch' : ctx.chapter.shortName, accent: ctx.accent }
  let photos = (b.photos ?? []).map((p) => toPhoto(p, { caption: b.heading ?? ctx.page?.title ?? ctx.chapter.shortName, chip })).filter(isPhoto)
  let galleryHref = `/gallery?chapter=${ctx.chapter.slug}`
  if (!photos.length) {
    const albumId = typeof b.album === 'object' ? b.album?.id : b.album
    const albums = albumId ? [await getAlbum(albumId)].filter((a) => a !== null) : await getAlbums(ctx.chapter.id)
    photos = albums.flatMap((a) => (a.photos ?? []).map((p) => toPhoto(p, { caption: a.title, chip }))).filter(isPhoto)
    if (albumId) galleryHref = `/gallery?chapter=${ctx.chapter.slug}`
  }
  if (!photos.length) return null
  const bg = resolveBg(b.background, i)
  if (b.layout !== 'rows' && photos.length >= 4) {
    return (
      <div id={b.anchor ?? undefined} data-theme={isDarkBg(bg) ? 'dark' : undefined}>
        <MomentsMosaic photos={photos} variant={isDarkBg(bg) ? 'dark' : 'light'} eyebrow={b.eyebrow ?? 'Moments'} title={b.heading ?? 'In pictures.'} galleryHref={galleryHref} totalLabel={`${photos.length} photos`} />
      </div>
    )
  }
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow} heading={b.heading} />
      <PhotoSet photos={photos} />
    </Section>
  )
}

async function Events({ b, ctx, i }: { b: EventsBlock; ctx: BlockCtx; i: number }) {
  const limit = b.limit ?? 6
  const upcoming = b.show === 'past' ? [] : await getEvents({ when: 'upcoming', chapterId: ctx.chapter.id, limit, titleContains: b.titleContains })
  const past = b.show === 'upcoming' || (b.show !== 'past' && upcoming.length) ? [] : await getEvents({ when: 'past', chapterId: ctx.chapter.id, limit, titleContains: b.titleContains })
  const list = upcoming.length ? upcoming : past
  const onChapterPage = !ctx.page
  if (!list.length && !onChapterPage) return null
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="events">
      <Header
        eyebrow={b.eyebrow ?? `${ctx.chapter.shortName} events`}
        heading={b.heading ?? (upcoming.length ? 'Coming up next.' : 'Recent events.')}
        link={{ href: `/events?chapter=${ctx.chapter.slug}`, label: 'All events' }}
      />
      {list.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-ink/20 p-10 text-ink-3">
          When {ctx.chapter.shortName} publishes an event on IEEE vTools, it appears here within 30 minutes.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, limit).map((e, k) => (
            <Reveal key={e.id} delay={(k % 3) * 0.06} className="h-full">
              <EventCard event={e} past={!upcoming.length} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}

async function Stories({ b, ctx, i }: { b: StoriesBlock; ctx: BlockCtx; i: number }) {
  const posts = await getPosts({ chapterId: ctx.chapter.id, limit: b.limit ?? 3, titleContains: b.titleContains })
  if (!posts.length) return null
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="stories">
      <Header eyebrow={b.eyebrow ?? 'Stories'} heading={b.heading ?? 'Stories & recaps.'} link={{ href: `/news?chapter=${ctx.chapter.slug}`, label: 'More stories' }} />
      <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, k) => (
          <Reveal key={p.id} delay={(k % 3) * 0.06}>
            <PostCard post={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

async function People({ b, ctx, i }: { b: PeopleBlock; ctx: BlockCtx; i: number }) {
  if (b.source !== 'custom') {
    const people = await getPeople(ctx.chapter.id)
    if (!people.length) return null
    return (
      <Section style={styleOf(b)} index={i} accent={ctx.accent} id="team">
        <Committee people={toCommittee(people)} accent={ctx.accent} title={b.heading ?? `Meet the ${ctx.chapter.shortName} team`} term={people.find((p) => p.term)?.term} chapterName={ctx.chapter.name} />
        <p className="mt-6 text-sm text-ink-3">
          <Link href={`/chapters/${ctx.chapter.slug}/committee`} className="link-underline font-semibold">
            Past committees
          </Link>
        </p>
      </Section>
    )
  }
  const items = b.items ?? []
  if (!items.length) return null
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow} heading={b.heading} />
      <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p, k) => {
          const photo = mediaInfo(p.photo, 'card')
          return (
            <Reveal as="li" key={p.id ?? k} delay={(k % 4) * 0.05} className="group flex flex-col gap-3">
              <MediaFrame media={photo} ratio={4 / 5} fit="cover" sizes="(min-width: 1024px) 22vw, 45vw" className="rounded-[1.25rem]">
                {!photo && (
                  <span className="absolute inset-0 grid place-items-center" style={{ background: `linear-gradient(145deg, ${ctx.accent}, #030a13)` }}>
                    <span aria-hidden className="font-display text-4xl font-extrabold tracking-[-0.03em] text-white/80">
                      {initials(p.name)}
                    </span>
                  </span>
                )}
              </MediaFrame>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-lg font-bold leading-tight">{p.name}</span>
                {p.position && <span className="text-sm text-ink-2">{p.position}</span>}
                {p.organisation && <span className="text-sm text-ink-3">{p.organisation}</span>}
                {p.linkedin && (
                  <a href={p.linkedin} target="_blank" rel="noreferrer" className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-semibold accent-text" style={accentVars(ctx.accent)}>
                    LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}

function FaqSection({ b, ctx, i }: { b: FaqBlock; ctx: BlockCtx; i: number }) {
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Header eyebrow={b.eyebrow ?? 'FAQ'} heading={b.heading ?? 'Questions.'} />
        </div>
        <Faq items={(b.items ?? []).map((f) => ({ q: f.q, a: f.a }))} />
      </div>
    </Section>
  )
}

async function FormSection({ b, ctx, i }: { b: FormBlock; ctx: BlockCtx; i: number }) {
  const id = typeof b.form === 'object' ? b.form?.id : b.form
  const form = id ? await getForm(id) : null
  if (!form) return null
  const state = formState(form)
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent} id="register">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          <Header eyebrow={b.eyebrow ?? 'Register'} heading={b.heading ?? form.title} text={b.intro} />
        </div>
        <Reveal>
          <FormView form={toFormDefinition(form)} state={state} accent={ctx.accent} />
        </Reveal>
      </div>
    </Section>
  )
}

function Downloads({ b, ctx, i }: { b: DownloadsBlock; ctx: BlockCtx; i: number }) {
  const rel = (u?: string | null) => (u ? u.replace(/^https?:\/\/[^/]+/, '') : null)
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow ?? 'Downloads'} heading={b.heading} />
      <ul className="grid gap-3 md:grid-cols-2">
        {(b.items ?? []).map((d, k) => {
          const f = typeof d.file === 'object' ? d.file : null
          const href = rel(f?.url)
          if (!href) return null
          const size = f?.filesize ? `${(f.filesize / 1024 / 1024).toFixed(f.filesize > 1024 * 1024 ? 1 : 2)} MB` : null
          return (
            <Reveal as="li" key={d.id ?? k} delay={k * 0.05}>
              <a href={href} download className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:border-ink/30">
                <span className="accent-chip grid size-12 shrink-0 place-items-center rounded-xl" style={accentVars(ctx.accent)}>
                  <FileText className="size-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">{d.label}</span>
                  <span className="truncate text-sm text-ink-3">{[d.note, size].filter(Boolean).join(' · ')}</span>
                </span>
                <Download className="size-5 shrink-0 text-ink-3 transition group-hover:translate-y-0.5 group-hover:text-ink" aria-hidden />
              </a>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}

function Logos({ b, ctx, i }: { b: LogosBlock; ctx: BlockCtx; i: number }) {
  const tiers = new Map<string, NonNullable<LogosBlock['items']>>()
  for (const it of b.items ?? []) {
    const k = it.tier || ''
    if (!tiers.has(k)) tiers.set(k, [])
    tiers.get(k)!.push(it)
  }
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow ?? 'Partners'} heading={b.heading} />
      <div className="flex flex-col gap-10">
        {[...tiers.entries()].map(([tier, items], t) => (
          <div key={tier || t} className="flex flex-col gap-4">
            {tier && <span className="eyebrow text-ink-3">{tier}</span>}
            <ul className={clsx('grid gap-4', t === 0 && tier ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5')}>
              {items.map((l, k) => {
                const src = mediaUrl(l.logo, 'card')
                const tile = (
                  <span className="relative grid aspect-[3/2] place-items-center rounded-2xl border border-line bg-white p-6 transition hover:shadow-[var(--card-shadow)]">
                    {src && <Image src={src} alt={l.name} fill sizes="240px" className="object-contain p-6" />}
                  </span>
                )
                return (
                  <li key={l.id ?? k}>
                    {l.url ? (
                      <a href={l.url} target="_blank" rel="noreferrer" aria-label={l.name}>
                        {tile}
                      </a>
                    ) : (
                      tile
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

const youtubeId = (v: string) => v.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1] ?? (/^[\w-]{11}$/.test(v.trim()) ? v.trim() : null)

function Video({ b, ctx, i }: { b: VideoBlock; ctx: BlockCtx; i: number }) {
  const id = youtubeId(b.youtube)
  if (!id) return null
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow} heading={b.heading} />
      <Reveal className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-line bg-night shadow-[var(--card-shadow)]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
          title={b.heading || b.caption || 'Video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </Reveal>
      {b.caption && <p className="mt-4 text-sm text-ink-3">{b.caption}</p>}
    </Section>
  )
}

async function PageLinks({ b, ctx, i }: { b: PageLinksBlock; ctx: BlockCtx; i: number }) {
  let pages = (b.pages ?? []).filter((p): p is Page => typeof p === 'object' && p !== null && p._status === 'published')
  if (!pages.length) pages = await getPages(ctx.chapter.id, ctx.page?.id ?? null)
  if (!pages.length) return null
  return (
    <Section style={styleOf(b)} index={i} accent={ctx.accent}>
      <Header eyebrow={b.eyebrow} heading={b.heading} />
      <div className={clsx('grid gap-5', pages.length === 1 ? 'md:grid-cols-1' : pages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3')}>
        {pages.map((p, k) => {
          const heroBlock = (p.layout ?? []).find((x) => x.blockType === 'hero' && !x.hidden) as HeroBlock | undefined
          const media = mediaInfo(p.cover ?? heroBlock?.image, 'hero')
          return (
            <Reveal key={p.id} delay={(k % 3) * 0.06} className="h-full">
              <Link href={p.url || p.path || '#'} className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.75rem] bg-night p-7 text-white" data-theme="dark">
                <MediaFrame media={media} ratio={16 / 9} fill fit="cover" sizes="(min-width: 1024px) 33vw, 100vw" className="absolute inset-0 -z-0 opacity-60 transition duration-700 group-hover:opacity-75" />
                <span className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
                <span className="absolute inset-0 mix-blend-soft-light" style={{ background: `linear-gradient(135deg, ${ctx.accent}, transparent 70%)` }} />
                <span className="relative flex flex-col gap-3">
                  {heroBlock?.dateLabel && <span className="w-fit rounded-full border border-white/25 px-3 py-1 font-mono text-xs text-white/85">{heroBlock.dateLabel}</span>}
                  <span className="font-display text-[1.9rem] font-extrabold leading-[1.02] tracking-[-0.03em]">{p.title}</span>
                  {p.summary && <span className="line-clamp-3 text-[15px] leading-relaxed text-white/75">{p.summary}</span>}
                  <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan">
                    Open <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
                  </span>
                </span>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

function Cta({ b, ctx }: { b: CtaBlock; ctx: BlockCtx }) {
  return (
    <section id={b.anchor?.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || undefined} data-theme="dark" className="relative scroll-mt-24 overflow-hidden text-white" style={{ background: `radial-gradient(ellipse 70% 90% at 100% 0%, color-mix(in oklab, ${ctx.accent} 70%, #43c6f4), ${ctx.accent} 50%, #02101d 130%)` }}>
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]" />
      <div className="container-x relative grid items-center gap-10 py-20 md:grid-cols-[1.4fr_1fr] md:py-28">
        <div className="flex flex-col gap-5">
          <Reveal>
            <h2 className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.045em]">{b.heading}</h2>
          </Reveal>
          {b.text && (
            <Reveal delay={0.08}>
              <p className="max-w-xl text-lg leading-relaxed text-white/80">{b.text}</p>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.12} className="md:justify-self-end">
          <Buttons items={b.buttons as Btn[]} accent={ctx.accent} onDark />
        </Reveal>
      </div>
    </section>
  )
}

function ChapterAbout({ b, ctx, i }: { b: ChapterAboutBlock; ctx: BlockCtx; i: number }) {
  const { chapter, accent } = ctx
  const logo = mediaUrl(chapter.logo, 'card')
  const l = chapter.links
  const findUs = (
    [
      ['Website', l?.website],
      ['Facebook', l?.facebook],
      ['Instagram', l?.instagram],
      ['LinkedIn', l?.linkedin],
    ] as [string, string | null | undefined][]
  ).filter((x): x is [string, string] => Boolean(x[1]))
  return (
    <Section style={styleOf(b)} index={i} accent={accent} id="about">
      <div className="grid gap-14 lg:grid-cols-[auto_1fr]">
        {logo && (
          <Reveal className="grid size-40 place-items-center rounded-[2rem] border border-line bg-white p-5 shadow-[var(--card-shadow)] md:size-56">
            <Image src={logo} alt={`${chapter.shortName} logo`} width={220} height={220} className="size-full object-contain" />
          </Reveal>
        )}
        <div className="flex flex-col gap-8">
          <Reveal>
            <span className="eyebrow accent-text" style={accentVars(accent)}>
              {b.heading || `What is ${chapter.shortName}?`}
            </span>
          </Reveal>
          <Reveal delay={0.05} className="prose-ieee max-w-3xl">
            {(chapter.about ?? '').split(/\n\s*\n/).map((para, k) => (
              <p key={k} className={k === 0 ? '!text-[1.35rem] !leading-relaxed !text-ink' : ''}>
                {para}
              </p>
            ))}
          </Reveal>
          {chapter.mission && (
            <Reveal delay={0.08}>
              <blockquote className="max-w-3xl border-l-[3px] pl-6 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.01em] text-ink-2" style={{ borderColor: accent }}>
                <span className="eyebrow mb-2 block font-sans not-italic accent-text" style={accentVars(accent)}>
                  Our mission
                </span>
                {chapter.mission}
              </blockquote>
            </Reveal>
          )}
          {findUs.length > 0 && (
            <Reveal delay={0.1} className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm text-ink-3">Find {chapter.shortName} on</span>
              {findUs.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition hover:border-ink/30">
                  {label} <ArrowUpRight className="size-3.5 opacity-60" aria-hidden />
                </a>
              ))}
            </Reveal>
          )}
          {chapter.highlights && chapter.highlights.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {chapter.highlights.map((h, k) => (
                <Reveal key={h.id ?? k} delay={k * 0.06} className="rounded-2xl border border-line bg-surface p-5">
                  <CountUp value={h.value} className="font-display text-4xl font-extrabold tracking-[-0.03em]" />
                  <span className="mt-1 block text-sm leading-snug text-ink-3">{h.label}</span>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

// ---------------------------------------------------------------- renderer

/** Sections a webmaster switched off stay saved in the console but are left out of the page. */
export const visibleBlocks = <T,>(blocks: T[] | null | undefined): T[] => (blocks ?? []).filter((b) => !(b as { hidden?: boolean | null }).hidden)

export function RenderBlocks({ blocks, ctx }: { blocks: AnyBlock[] | null | undefined; ctx: BlockCtx }) {
  // "automatic" backgrounds alternate between the sections that are shown
  let auto = 0
  return (
    <>
      {visibleBlocks(blocks).map((raw, k) => {
        const b = raw as AnyBlock & SectionStyle
        const i = !b.background || b.background === 'auto' ? auto++ : 0
        const key = b.id ?? `${b.blockType}-${k}`
        switch (b.blockType) {
          case 'hero':
            return <Hero key={key} b={b as HeroBlock} ctx={ctx} />
          case 'text':
            return <Text key={key} b={b as TextBlock} ctx={ctx} i={i} />
          case 'mediaText':
            return <MediaText key={key} b={b as MediaTextBlock} ctx={ctx} i={i} />
          case 'stats':
            return <Stats key={key} b={b as StatsBlock} ctx={ctx} i={i} />
          case 'cards':
            return <Cards key={key} b={b as CardsBlock} ctx={ctx} i={i} />
          case 'timeline':
            return <Timeline key={key} b={b as TimelineBlock} ctx={ctx} i={i} />
          case 'gallery':
            return <Gallery key={key} b={b as GalleryBlock} ctx={ctx} i={i} />
          case 'events':
            return <Events key={key} b={b as EventsBlock} ctx={ctx} i={i} />
          case 'stories':
            return <Stories key={key} b={b as StoriesBlock} ctx={ctx} i={i} />
          case 'people':
            return <People key={key} b={b as PeopleBlock} ctx={ctx} i={i} />
          case 'faq':
            return <FaqSection key={key} b={b as FaqBlock} ctx={ctx} i={i} />
          case 'form':
            return <FormSection key={key} b={b as FormBlock} ctx={ctx} i={i} />
          case 'downloads':
            return <Downloads key={key} b={b as DownloadsBlock} ctx={ctx} i={i} />
          case 'logos':
            return <Logos key={key} b={b as LogosBlock} ctx={ctx} i={i} />
          case 'video':
            return <Video key={key} b={b as VideoBlock} ctx={ctx} i={i} />
          case 'pageLinks':
            return <PageLinks key={key} b={b as PageLinksBlock} ctx={ctx} i={i} />
          case 'cta':
            return <Cta key={key} b={b as CtaBlock} ctx={ctx} />
          case 'schedule':
            return <Schedule key={key} b={b as ScheduleBlock} ctx={ctx} i={i} />
          case 'fees':
            return <Fees key={key} b={b as FeesBlock} ctx={ctx} i={i} />
          case 'speakers':
            return <Speakers key={key} b={b as SpeakersBlock} ctx={ctx} i={i} />
          case 'venue':
            return <Venue key={key} b={b as VenueBlock} ctx={ctx} i={i} />
          case 'chapterAbout':
            return <ChapterAbout key={key} b={b as ChapterAboutBlock} ctx={ctx} i={i} />
          default:
            return null
        }
      })}
    </>
  )
}
