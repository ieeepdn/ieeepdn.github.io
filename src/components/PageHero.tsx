import clsx from 'clsx'
import Image from 'next/image'
import { Reveal, SplitHeading } from './ui/motion'
import { getTheme } from '@/lib/site'

export function PageHero({
  eyebrow,
  title,
  text,
  image,
  accent,
  children,
  compact,
  mosaic,
}: {
  eyebrow: string
  title: string
  text?: string | null
  image?: string | null
  accent?: string
  children?: React.ReactNode
  compact?: boolean
  /** portrait URLs shown as a faded mosaic when there is no cover image */
  mosaic?: string[]
}) {
  // Pages CMS → Theme & colours → Page headers: photo with a colour glow (default), a brighter photo, or solid colour
  const style = getTheme().pageHero
  const tint = accent ?? 'var(--color-ieee)'
  return (
    <section className="grain relative isolate overflow-hidden bg-night text-white" style={style === 'solid' ? { background: tint } : undefined}>
      {image && style !== 'solid' && (
        <Image src={image} alt="" fill priority sizes="100vw" className={clsx('-z-20 object-cover', style === 'photo' ? 'opacity-60' : 'opacity-35')} />
      )}
      {(!image || style === 'solid') && mosaic && mosaic.length >= 8 && (
        <div aria-hidden className="absolute inset-y-0 right-0 -z-20 grid w-full grid-cols-4 content-center opacity-30 [mask-image:linear-gradient(to_left,black_20%,transparent_85%)] md:w-2/3 md:grid-cols-6">
          {mosaic.slice(0, 24).map((m, i) => (
            <div key={i} className="relative aspect-square">
              <Image src={m} alt="" fill sizes="180px" loading="eager" className="object-cover grayscale" />
            </div>
          ))}
        </div>
      )}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            style === 'solid'
              ? 'linear-gradient(to bottom, transparent 40%, color-mix(in srgb, var(--color-night) 55%, transparent))'
              : style === 'photo'
                ? `radial-gradient(ellipse 70% 70% at 80% 10%, color-mix(in srgb, ${tint} 45%, transparent), transparent 65%), linear-gradient(to bottom, color-mix(in srgb, var(--color-night) 20%, transparent), color-mix(in srgb, var(--color-night) 85%, transparent))`
                : `radial-gradient(ellipse 70% 70% at 80% 10%, color-mix(in srgb, ${tint} 60%, transparent), transparent 65%), linear-gradient(to bottom, color-mix(in srgb, var(--color-night) 35%, transparent), var(--color-night))`,
        }}
      />
      <div className="grid-lines absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div className={clsx('container-x flex flex-col gap-7', compact ? 'pb-16 pt-40' : 'pb-20 pt-44 md:pb-28 md:pt-52')}>
        <Reveal>
          <span className="eyebrow text-cyan">{eyebrow}</span>
        </Reveal>
        <SplitHeading
          as="h1"
          text={title}
          className="max-w-[18ch] font-display text-[clamp(2.8rem,7.5vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.045em]"
        />
        {text && (
          <Reveal delay={0.25}>
            <p className="max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl">{text}</p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  )
}
