import Link from 'next/link'
import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from './ui/motion'

export function SectionHeader({
  eyebrow,
  title,
  text,
  link,
  dark,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  text?: string
  link?: { href: string; label: string }
  dark?: boolean
  className?: string
}) {
  return (
    <div className={clsx('mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end', className)}>
      <div className="flex max-w-3xl flex-col gap-4">
        <Reveal>
          <span className={clsx('eyebrow', dark ? 'text-cyan' : 'text-brand')}>{eyebrow}</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display text-[clamp(2.3rem,5vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.04em]">{title}</h2>
        </Reveal>
        {text && (
          <Reveal delay={0.1}>
            <p className={clsx('max-w-2xl text-lg leading-relaxed', dark ? 'text-white/65' : 'text-ink-3')}>{text}</p>
          </Reveal>
        )}
      </div>
      {link && (
        <Reveal delay={0.12}>
          <Link
            href={link.href}
            className={clsx(
              'group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 font-semibold transition',
              dark ? 'border-white/20 hover:border-white hover:bg-white hover:text-night' : 'border-ink/15 hover:border-ink hover:bg-ink hover:text-paper',
            )}
          >
            {link.label}
            <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" aria-hidden />
          </Link>
        </Reveal>
      )}
    </div>
  )
}
