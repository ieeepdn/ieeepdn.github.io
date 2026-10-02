import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowUpRight, Mail } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { CtaBand } from '@/components/sections/CtaBand'
import { CountUp, Reveal } from '@/components/ui/motion'
import { accentVars, getProgram, getPrograms, mediaUrl } from '@/lib/data'


export const dynamicParams = false

export async function generateStaticParams() {
  return (await getPrograms()).filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProgram(slug)
  return p ? { title: p.name, description: p.summary } : {}
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getProgram(slug)
  if (!p) notFound()
  const accent = p.accent || '#00629B'
  const gallery = (p.gallery ?? []).map((m) => ({ src: mediaUrl(m, 'card'), alt: typeof m === 'object' ? m.alt : p.name })).filter((g) => g.src)

  return (
    <>
      <PageHero eyebrow={p.edition ? `Flagship · ${p.edition}` : 'Flagship programme'} title={p.name} text={p.tagline} image={mediaUrl(p.cover, 'hero')} accent={accent}>
        <div className="mt-4 flex flex-wrap gap-3">
          {(p.links ?? []).map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className={l.primary ? 'inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-night hover:bg-cyan' : 'inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 font-semibold hover:bg-white/10'}
            >
              {l.label} <ArrowUpRight className="size-4" aria-hidden />
            </a>
          ))}
        </div>
      </PageHero>

      <section className="bg-paper atmos py-20 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="flex flex-col gap-8">
            {mediaUrl(p.logo, 'card') && (
              <span className="flex h-24 w-fit items-center rounded-2xl border border-line bg-white px-6 py-4 shadow-[0_20px_50px_-30px_rgba(3,10,19,0.35)]">
                <Image src={mediaUrl(p.logo, 'card') as string} alt={`${p.name} logo`} width={320} height={96} className="h-full w-auto object-contain" />
              </span>
            )}
            <p className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-semibold leading-snug tracking-[-0.02em] text-ink">{p.summary}</p>
          </Reveal>
          {(p.stats ?? []).length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {(p.stats ?? []).map((s, i) => (
                <Reveal key={s.id ?? i} delay={i * 0.06} className="rounded-2xl border border-line bg-surface p-6">
                  <CountUp value={s.value} className="font-display text-5xl font-extrabold tracking-[-0.04em]" />
                  <span className="mt-2 block text-sm text-ink-3">{s.label}</span>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {(p.sections ?? []).map((s, i) => (
        <section key={s.id ?? i} className={i % 2 ? 'bg-paper atmos py-20 md:py-24' : 'bg-mist atmos py-20 md:py-24'}>
          <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal className="flex flex-col gap-3">
              <span className="accent-text font-mono text-sm" style={accentVars(accent)}>0{i + 1}</span>
              <h2 className="font-display text-[clamp(1.9rem,3.4vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{s.heading}</h2>
            </Reveal>
            <Reveal delay={0.08} className="flex flex-col gap-6">
              <div className="prose-ieee">
                {s.body.split(/\n\s*\n/).map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
              {(s.points ?? []).length > 0 && (
                <ul className="grid gap-3">
                  {(s.points ?? []).map((pt, j) => (
                    <li key={pt.id ?? j} className="flex gap-4 rounded-2xl border border-line bg-surface p-4 text-[15.5px] leading-relaxed text-ink-2">
                      <span className="accent-text mt-0.5 font-mono text-xs" style={accentVars(accent)}>{String(j + 1).padStart(2, '0')}</span>
                      {pt.text}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          </div>
        </section>
      ))}

      {gallery.length > 0 && (
        <section className="bg-night py-20">
          <div className="container-x columns-2 gap-3 md:columns-3">
            {gallery.map((g, i) => (
              <Reveal key={i} delay={(i % 3) * 0.05} className="relative mb-3 overflow-hidden rounded-2xl">
                <Image src={g.src as string} alt={g.alt} width={800} height={600} sizes="(min-width: 768px) 33vw, 50vw" className="h-auto w-full object-cover" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {(p.contacts ?? []).length > 0 && (
        <section className="bg-mist atmos py-20">
          <div className="container-x">
            <h2 className="mb-8 font-display text-3xl font-extrabold tracking-[-0.03em]">Contact the organisers</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {(p.contacts ?? []).map((c, i) => (
                <div key={c.id ?? i} className="flex flex-col gap-1 rounded-2xl border border-line p-6">
                  <span className="font-display text-xl font-bold">{c.name}</span>
                  {c.role && <span className="text-ink-3">{c.role}</span>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="mt-2 flex items-center gap-2 font-semibold text-brand hover:underline">
                      <Mail className="size-4" aria-hidden /> {c.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}
