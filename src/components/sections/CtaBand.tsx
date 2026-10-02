import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Magnetic, Reveal } from '../ui/motion'

export function CtaBand({
  title = 'Build the branch with us.',
  text = 'Volunteer calls open every term — organising committees, design, editorial, programming and chapter teams. No experience needed, just curiosity.',
}: {
  title?: string
  text?: string
}) {
  return (
    <section className="relative overflow-hidden bg-ieee text-white">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-cyan/40 blur-[120px]" />
      <div className="container-x relative grid items-center gap-10 py-24 md:grid-cols-[1.4fr_1fr] md:py-32">
        <div className="flex flex-col gap-6">
          <Reveal>
            <h2 className="font-display text-[clamp(2.6rem,6vw,5.6rem)] font-extrabold leading-[0.94] tracking-[-0.045em]">{title}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-xl text-lg leading-relaxed text-white/80">{text}</p>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="flex flex-wrap gap-3 md:justify-end">
          <Magnetic>
            <Link href="/volunteer" className="group inline-flex h-16 items-center gap-3 rounded-full bg-white pl-7 pr-2 text-lg font-semibold text-night transition hover:bg-night hover:text-white">
              Volunteer
              <span className="grid size-12 place-items-center rounded-full bg-night text-white transition group-hover:bg-cyan group-hover:text-night">
                <ArrowRight className="size-5" aria-hidden />
              </span>
            </Link>
          </Magnetic>
          <a
            href="https://www.ieee.org/membership/join/index.html"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-16 items-center gap-2 rounded-full border border-white/40 px-7 text-lg font-semibold transition hover:bg-white/10"
          >
            Become an IEEE member <ArrowUpRight className="size-5" aria-hidden />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
