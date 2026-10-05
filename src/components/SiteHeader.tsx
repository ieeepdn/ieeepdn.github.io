'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import clsx from 'clsx'
import { ThemeToggle } from './ui/ThemeToggle'
import { SmartLink } from './ui/SmartLink'

type NavChapter = { name: string; shortName: string; slug: string; kind: string; accent: string }

const programmes = [
  { name: 'Pera Xtreme', slug: 'pera-xtreme', blurb: 'Road to IEEEXtreme — 24-hour global coding' },
  { name: 'Predicta', slug: 'predicta', blurb: 'National AI prediction challenge' },
  { name: 'MentorSpark', slug: 'mentorspark', blurb: 'Six-week mentoring circles for freshers' },
]

type NavSpotlight = { label: string; href: string; external: boolean; accent: string }

export function SiteHeader({
  chapters,
  announcement,
  spotlight,
}: {
  chapters: NavChapter[]
  announcement: { text: string; url: string } | null
  spotlight?: NavSpotlight | null
}) {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<null | 'chapters' | 'programmes'>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    setHidden(y > 240 && y > prev && !open && !menu)
  })

  useEffect(() => {
    setOpen(false)
    setMenu(null)
  }, [pathname])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  const hover = (m: typeof menu) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMenu(m)
  }
  const leave = () => {
    closeTimer.current = setTimeout(() => setMenu(null), 160)
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const society = chapters.filter((c) => c.kind !== 'branch')

  const linkCls = (href: string) =>
    clsx(
      'relative whitespace-nowrap rounded-full px-3 py-2.5 text-[15px] font-medium transition-colors xl:px-4',
      isActive(href) ? 'text-white' : 'text-white/70 hover:text-white',
    )

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-[60]"
        onMouseLeave={leave}
      >
        {announcement?.text && (
          <SmartLink href={announcement.url || '/'} className="block bg-signal text-center text-[13px] font-semibold text-night hover:bg-[#ffc56e]">
            <span className="container-x flex items-center justify-center gap-2 py-2">
              {announcement.text} <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </SmartLink>
        )}
        <div
          className={clsx(
            'transition-[background-color,backdrop-filter,border-color] duration-500',
            scrolled || menu
              ? 'border-b border-white/10 bg-night/75 backdrop-blur-xl backdrop-saturate-150'
              : 'border-b border-transparent bg-gradient-to-b from-night/70 to-transparent',
          )}
        >
          <div className="container-x flex h-[76px] items-center justify-between gap-6">
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-3"
              aria-label="IEEE Student Branch, University of Peradeniya — home"
            >
              <Image
                src="/brand/logo-mark.webp"
                alt=""
                width={44}
                height={44}
                priority
                className="size-11 object-contain transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105"
              />
              <span className="hidden flex-col leading-none sm:flex lg:hidden xl:flex">
                <span className="font-display text-[19px] font-extrabold tracking-tight text-white">
                  IEEE Student Branch
                </span>
                <span className="mt-1 text-[12.5px] text-white/60">University of Peradeniya</span>
              </span>
            </Link>

            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              <Link href="/about" className={linkCls('/about')}>
                About
              </Link>
              <button
                type="button"
                className={clsx(linkCls('/chapters'), 'flex items-center gap-1')}
                aria-expanded={menu === 'chapters'}
                onMouseEnter={() => hover('chapters')}
                onFocus={() => hover('chapters')}
                onClick={() => setMenu(menu === 'chapters' ? null : 'chapters')}
              >
                Chapters{' '}
                <ChevronDown
                  className={clsx(
                    'size-4 transition-transform',
                    menu === 'chapters' && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
              <Link href="/events" className={linkCls('/events')} onMouseEnter={() => hover(null)}>
                Events
              </Link>
              <button
                type="button"
                className={clsx(linkCls('/programmes'), 'flex items-center gap-1')}
                aria-expanded={menu === 'programmes'}
                onMouseEnter={() => hover('programmes')}
                onFocus={() => hover('programmes')}
                onClick={() => setMenu(menu === 'programmes' ? null : 'programmes')}
              >
                Programmes{' '}
                <ChevronDown
                  className={clsx(
                    'size-4 transition-transform',
                    menu === 'programmes' && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
              <Link href="/news" className={linkCls('/news')} onMouseEnter={() => hover(null)}>
                News
              </Link>
              <Link
                href="/gallery"
                className={linkCls('/gallery')}
                onMouseEnter={() => hover(null)}
              >
                Gallery
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {spotlight && (
                <Link
                  href={spotlight.href}
                  target={spotlight.external ? '_blank' : undefined}
                  rel={spotlight.external ? 'noreferrer' : undefined}
                  className={clsx(
                    'hidden items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-[14px] font-semibold transition lg:inline-flex',
                    isActive(spotlight.href) && !spotlight.external ? 'border-white/50 bg-white/15 text-white' : 'border-white/25 bg-white/[0.07] text-white hover:border-white/50 hover:bg-white/10',
                  )}
                >
                  <span className="size-2 animate-pulse-dot rounded-full" style={{ background: `color-mix(in oklab, ${spotlight.accent} 55%, white)` }} aria-hidden />
                  {spotlight.label}
                </Link>
              )}
              <Link
                href="/volunteer"
                className={clsx(
                  'hidden rounded-full border border-white/20 px-4 py-2.5 text-[14px] font-semibold text-white transition hover:border-white/50',
                  spotlight ? '2xl:inline-flex' : 'md:inline-flex',
                )}
              >
                Volunteer
              </Link>
              <a
                href="https://www.ieee.org/membership/join/index.html"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[14px] font-semibold text-night transition hover:bg-cyan"
              >
                Join IEEE{' '}
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menu && (
              <motion.div
                key={menu}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="hidden border-t border-white/10 lg:block"
                onMouseEnter={() => hover(menu)}
              >
                <div className="container-x py-8">
                  {menu === 'chapters' ? (
                    <div className="grid grid-cols-[1.1fr_3fr] gap-10">
                      <div className="flex flex-col gap-3">
                        <span className="eyebrow text-cyan">Seven communities</span>
                        <p className="font-display text-2xl font-bold leading-tight text-white">
                          Each chapter runs its own page, team and events.
                        </p>
                        <Link
                          href="/chapters"
                          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan hover:text-white"
                        >
                          All chapters <ArrowUpRight className="size-4" aria-hidden />
                        </Link>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {society.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/chapters/${c.slug}`}
                            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/25 hover:bg-white/[0.07]"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2.5 rounded-full"
                                style={{ background: c.accent }}
                              />
                              <span className="font-display text-xl font-extrabold text-white">
                                {c.shortName}
                              </span>
                            </span>
                            <span className="mt-2 block text-[13.5px] leading-snug text-white/65 group-hover:text-white/90">
                              {c.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {programmes.map((p, i) => (
                        <Link
                          key={p.slug}
                          href={`/programmes/${p.slug}`}
                          className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/25 hover:bg-white/[0.07]"
                        >
                          <span className="font-mono text-sm text-cyan">0{i + 1}</span>
                          <span>
                            <span className="block font-display text-xl font-bold text-white">
                              {p.name}
                            </span>
                            <span className="mt-1 block text-sm text-white/65">{p.blurb}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-night text-white lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 38px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 38px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 38px)' }}
            transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-x flex h-[76px] items-center justify-between">
              <span className="font-display text-lg font-extrabold">Menu</span>
              <span className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/20"
                  aria-label="Close menu"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </span>
            </div>
            <nav
              aria-label="Mobile"
              className="container-x flex flex-1 flex-col overflow-y-auto pb-10"
              data-lenis-prevent
            >
              {[
                ['/', 'Home'],
                ...(spotlight ? [[spotlight.href, spotlight.label]] : []),
                ['/about', 'About'],
                ['/chapters', 'Chapters'],
                ['/events', 'Events'],
                ['/programmes', 'Programmes'],
                ['/news', 'News'],
                ['/gallery', 'Gallery'],
                ['/volunteer', 'Volunteer'],
                ['/contact', 'Contact'],
              ].map(([href, label], i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.045, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={href}
                    target={spotlight?.external && href === spotlight.href ? '_blank' : undefined}
                    className="flex items-center justify-between border-b border-white/10 py-4 font-display text-[34px] font-bold tracking-tight"
                  >
                    {label}
                    <ArrowUpRight className="size-6 text-cyan" aria-hidden />
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 flex flex-wrap gap-2">
                {society.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/chapters/${c.slug}`}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold"
                  >
                    {c.shortName}
                  </Link>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
