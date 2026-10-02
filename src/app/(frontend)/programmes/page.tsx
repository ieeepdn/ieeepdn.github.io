import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { CtaBand } from '@/components/sections/CtaBand'
import { Reveal } from '@/components/ui/motion'
import { getPrograms, mediaUrl } from '@/lib/data'

export const metadata: Metadata = { title: 'Flagship programmes', description: 'Pera Xtreme, Predicta and MentorSpark — the branch’s flagship programmes.' }

export default async function ProgrammesPage() {
  const programmes = await getPrograms()
  return (
    <>
      <PageHero eyebrow="Flagship programmes" title="Big ideas, run by students." text="Branch-wide programmes that bring together hundreds of students — from all-night coding to national AI challenges and mentoring circles." />
      <section className="bg-paper atmos py-20 md:py-28">
        <div className="container-x grid gap-6">
          {programmes.map((p, i) => {
            const cover = mediaUrl(p.cover, 'hero')
            return (
              <Reveal key={p.id}>
                <Link href={`/programmes/${p.slug}`} className="group relative grid min-h-[440px] overflow-hidden rounded-[2rem] bg-night text-white md:grid-cols-2">
                  <div className={`relative min-h-[260px] overflow-hidden ${i % 2 ? 'md:order-2' : ''}`}>
                    {cover && <Image src={cover} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-[1.2s] group-hover:scale-105" />}
                    <div className="absolute inset-0 mix-blend-multiply" style={{ background: `linear-gradient(135deg, ${p.accent}88, transparent)` }} />
                  </div>
                  <div className="relative flex flex-col justify-between gap-8 p-8 md:p-12">
                    <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-3xl" style={{ background: `${p.accent}66` }} />
                    <span className="font-mono text-sm text-cyan">0{i + 1}{p.edition ? ` · ${p.edition}` : ''}</span>
                    <div className="relative flex flex-col gap-4">
                      <h2 className="font-display text-[clamp(2.6rem,5vw,4.8rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">{p.name}</h2>
                      <p className="font-display text-xl font-semibold text-cyan-soft">{p.tagline}</p>
                      <p className="max-w-lg leading-relaxed text-white/70">{p.summary}</p>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-night transition group-hover:bg-cyan">
                      Explore <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>
      <CtaBand title="Partner with a programme." text="Industry partners and alumni help us run programmes that reach students across Sri Lanka. Read a proposal or get in touch." />
    </>
  )
}
