'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import { Reveal, SplitHeading, Spotlight } from '../ui/motion'

export type ChapterCard = {
  slug: string
  shortName: string
  name: string
  kind: string
  tagline?: string | null
  accent: string
  logo?: string | null
  cover?: string | null
  members: number
  upcoming: number
  faces: string[]
}

/** Every chapter gets the same tile: 1 per row on phones, 2 on tablets, 4 on laptops; a short last row is centred. */
const tile = 'w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]'

const hexToRgba = (hex: string, a: number) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function ChaptersBento({ chapters }: { chapters: ChapterCard[] }) {
  return (
    <section className="relative overflow-hidden bg-night py-28 text-white md:py-36">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_65%)]" />
      <div className="container-x relative">
        <div className="mb-14 grid items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-5">
            <Reveal><span className="eyebrow text-cyan">Chapters &amp; affinity groups</span></Reveal>
            <SplitHeading
              text="Seven communities. One branch."
              className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.04em]"
              highlight={['One', 'branch']}
            />
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-lg text-lg leading-relaxed text-white/65">
              Every chapter has its own webmaster, its own page and its own events — so what you see here is what’s
              actually happening this week.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {chapters.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 4) * 0.06} className={clsx(tile, 'flex')}>
              <Spotlight color={hexToRgba(c.accent, 0.35)} className="flex w-full rounded-[1.6rem]">
                <Link
                  href={`/chapters/${c.slug}`}
                  className="group relative flex min-h-[320px] w-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-6 transition-colors duration-500 hover:border-white/25 md:p-7"
                >
                  <div
                    className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-40 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
                    style={{ background: c.accent }}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    {c.logo ? (
                      <span className="grid size-16 place-items-center rounded-2xl bg-white p-2 shadow-lg">
                        <Image src={c.logo} alt="" width={56} height={56} className="size-full object-contain" />
                      </span>
                    ) : (
                      <span className="size-3 rounded-full" style={{ background: c.accent }} />
                    )}
                    <span className="grid size-11 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover:rotate-45 group-hover:border-white/40 group-hover:bg-white group-hover:text-night">
                      <ArrowUpRight className="size-5" aria-hidden />
                    </span>
                  </div>
                  <div className="relative mt-auto flex flex-col gap-2 pt-10">
                    {c.faces.length > 2 && (
                      <span aria-hidden className="mb-3 flex -space-x-2.5">
                        {c.faces.slice(0, 4).map((f, j) => (
                          <span key={j} className="relative size-8 overflow-hidden rounded-full ring-2 ring-night">
                            <Image src={f} alt="" fill sizes="32px" className="object-cover" />
                          </span>
                        ))}
                        <span className="grid size-8 place-items-center rounded-full bg-white/10 font-mono text-[10px] text-white/80 ring-2 ring-night backdrop-blur">+{Math.max(0, c.members - 4)}</span>
                      </span>
                    )}
                    <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.04em] lg:text-[2.6rem] xl:text-5xl">{c.shortName}</span>
                    <span className="text-[17px] font-semibold leading-snug text-white/90">{c.name}</span>
                    {c.tagline && <span className="line-clamp-2 text-[15px] leading-relaxed text-white/60">{c.tagline}</span>}
                    <span className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
                      <span className="rounded-full border border-white/12 px-2.5 py-1">{c.kind === 'affinity' ? 'Affinity group' : 'Society chapter'}</span>
                      {c.members > 0 && <span className="rounded-full border border-white/12 px-2.5 py-1">{c.members} on the team</span>}
                      {c.upcoming > 0 && (
                        <span className="rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-1 text-cyan">{c.upcoming} upcoming</span>
                      )}
                    </span>
                  </div>
                </Link>
              </Spotlight>
            </Reveal>
          ))}
          {chapters.length % 4 !== 0 && (
            // fills the gap in the last row on laptops with a same-size tile to the chapters explorer
            <Reveal delay={0.12} className={clsx(tile, 'hidden lg:flex')}>
              <Link
                href="/chapters"
                className="group relative flex min-h-[320px] w-full flex-col justify-between overflow-hidden rounded-[1.6rem] border border-dashed border-white/20 p-6 transition-colors duration-500 hover:border-white/40 hover:bg-white/[0.04] md:p-7"
              >
                <span className="grid size-11 place-items-center self-end rounded-full border border-white/15 transition-all duration-500 group-hover:rotate-45 group-hover:border-white/40 group-hover:bg-white group-hover:text-night">
                  <ArrowUpRight className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col gap-2">
                  <span className="font-display text-3xl font-extrabold leading-tight tracking-[-0.03em]">Explore all chapters</span>
                  <span className="text-[15px] leading-relaxed text-white/60">Compare what each one does, meet every committee and find your fit.</span>
                </span>
              </Link>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
