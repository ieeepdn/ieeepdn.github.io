'use client'
import { useState } from 'react'
import { Play } from 'lucide-react'
import { Reveal } from '../ui/motion'

/** Click-to-play YouTube (no cookies, nothing loads until the visitor asks). */
export function Showreel({ videoId, channel }: { videoId: string; channel?: string | null }) {
  const [play, setPlay] = useState(false)
  return (
    <section className="relative overflow-hidden bg-night py-24 text-white md:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      <div className="container-x grid items-center gap-12 lg:grid-cols-[0.8fr_1.4fr]">
        <div className="flex flex-col gap-5">
          <Reveal><span className="eyebrow text-cyan">Watch</span></Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display text-[clamp(2.3rem,4.6vw,4.2rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">
              Missed a webinar? <span className="text-gradient">Catch up.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-lg leading-relaxed text-white/65">
              Past events, workshops and talks live on the branch YouTube channel — subscribe so you never miss one.
            </p>
          </Reveal>
          {channel && (
            <Reveal delay={0.14}>
              <a href={channel} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-semibold transition hover:bg-white hover:text-night">
                Visit the channel
              </a>
            </Reveal>
          )}
        </div>
        <Reveal delay={0.1} className="relative aspect-video overflow-hidden rounded-[1.75rem] border border-white/10 bg-night-2 shadow-[0_40px_120px_-40px_rgba(67,198,244,0.45)]">
          {play ? (
            <iframe
              className="absolute inset-0 size-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title="IEEE Student Branch, University of Peradeniya on YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 size-full" aria-label="Play video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="absolute inset-0 size-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90" loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
              <span className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-night shadow-2xl transition duration-500 group-hover:scale-110 group-hover:bg-cyan">
                <Play className="ml-1 size-9 fill-current" aria-hidden />
              </span>
            </button>
          )}
        </Reveal>
      </div>
    </section>
  )
}
