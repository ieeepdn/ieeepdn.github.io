import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Marquee, Reveal } from '../ui/motion'

/** Two counter-scrolling rows of event photos. */
export function GalleryStrip({ photos }: { photos: { src: string; alt: string }[] }) {
  if (photos.length < 4) return null
  const half = Math.ceil(photos.length / 2)
  const rows = [photos.slice(0, half), photos.slice(half)]
  return (
    <section className="relative overflow-hidden bg-paper atmos py-24 md:py-32">
      <div className="container-x mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-col gap-4">
          <Reveal><span className="eyebrow text-brand">Moments</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
              Life at the branch.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Link href="/gallery" className="group inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-3 font-semibold transition hover:border-ink hover:bg-ink hover:text-paper">
            Open the gallery <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
          </Link>
        </Reveal>
      </div>
      <div className="flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {rows.map((row, r) => (
          <Marquee key={r} duration={r ? 70 : 60} reverse={r === 1}>
            {row.map((p, i) => (
              <div key={p.src + i} className="relative mr-4 h-[220px] w-[320px] shrink-0 overflow-hidden rounded-2xl md:h-[280px] md:w-[400px]">
                <Image src={p.src} alt={p.alt} fill sizes="400px" className="object-cover transition duration-700 hover:scale-105" />
              </div>
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  )
}
