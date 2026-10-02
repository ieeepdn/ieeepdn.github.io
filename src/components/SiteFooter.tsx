import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { Chapter, SiteSetting } from '@/payload-types'

export function SiteFooter({ settings, chapters }: { settings: SiteSetting; chapters: Chapter[] }) {
  const socials = [
    ['Facebook', settings.facebook],
    ['Instagram', settings.instagram],
    ['LinkedIn', settings.linkedin],
    ['YouTube', settings.youtube],
  ].filter(([, url]) => Boolean(url)) as [string, string][]

  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container-x relative grid gap-14 pb-10 pt-24 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image src="/brand/logo-mark.png" alt="" width={56} height={56} className="size-14 object-contain" />
            <div className="leading-tight">
              <div className="font-display text-2xl font-extrabold">IEEE Student Branch</div>
              <div className="text-white/60">University of Peradeniya</div>
            </div>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-white/65">
            The link between the IEEE global body and IEEE students at Peradeniya — a volunteer community of
            young engineers since 2001.
          </p>
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="link-underline w-fit font-display text-xl font-bold text-cyan">
              {settings.email}
            </a>
          )}
          {settings.address && <p className="whitespace-pre-line text-sm leading-relaxed text-white/55">{settings.address}</p>}
        </div>

        <FooterCol title="Branch">
          <FooterLink href="/about">About &amp; history</FooterLink>
          <FooterLink href="/about#team">Executive committee</FooterLink>
          <FooterLink href="/events">Events</FooterLink>
          <FooterLink href="/news">News</FooterLink>
          <FooterLink href="/gallery">Gallery</FooterLink>
          <FooterLink href="/volunteer">Volunteer</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterCol>

        <FooterCol title="Chapters">
          {chapters
            .filter((c) => c.kind !== 'branch')
            .map((c) => (
              <FooterLink key={c.id} href={`/chapters/${c.slug}`}>
                {c.shortName} <span className="text-white/40">· {c.name.replace(/^IEEE\s+/, '')}</span>
              </FooterLink>
            ))}
        </FooterCol>

        <FooterCol title="IEEE">
          <FooterLink href="https://www.ieee.org/" external>IEEE.org</FooterLink>
          <FooterLink href="https://www.ieeer10.org/" external>IEEE Region 10</FooterLink>
          <FooterLink href="https://ieee.lk/" external>IEEE Sri Lanka Section</FooterLink>
          <FooterLink href="https://events.vtools.ieee.org/" external>IEEE vTools Events</FooterLink>
          <FooterLink href="https://www.pdn.ac.lk/" external>University of Peradeniya</FooterLink>
          {socials.map(([label, url]) => (
            <FooterLink key={label} href={url} external>
              {label}
            </FooterLink>
          ))}
        </FooterCol>
      </div>

      {/* Affiliation strip — who we belong to */}
      <div className="container-x relative pb-10">
        <div className="relative grid gap-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10 md:p-8">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-ieee/40 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 right-10 size-64 rounded-full bg-cyan/10 blur-3xl" />
          <a href="https://www.ieee.org/" target="_blank" rel="noreferrer" className="relative w-fit opacity-90 transition hover:opacity-100">
            <Image src="/brand/ieee-white.png" alt="IEEE" width={160} height={47} className="h-10 w-auto md:h-12" />
          </a>
          <p className="relative max-w-xl text-[15px] leading-relaxed text-white/65">
            A student branch of <span className="text-white">IEEE</span>, the world’s largest technical professional
            organisation — part of <span className="text-white">Region 10 (Asia-Pacific)</span> and the{' '}
            <span className="text-white">IEEE Sri Lanka Section</span>.
          </p>
          <a href="https://www.pdn.ac.lk/" target="_blank" rel="noreferrer" className="relative flex items-center gap-3 opacity-90 transition hover:opacity-100">
            <Image src="/brand/uop-crest.png" alt="" width={52} height={52} className="size-12 object-contain" />
            <span className="flex flex-col leading-tight">
              <span className="font-display font-bold">University of Peradeniya</span>
              <span className="text-sm text-white/55">Faculty of Engineering</span>
            </span>
          </a>
        </div>
      </div>

      <div className="container-x relative flex flex-col gap-3 border-t border-white/10 py-6 font-mono text-xs text-white/45 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} IEEE Student Branch, University of Peradeniya</span>
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Events synced live from IEEE vTools</span>
          <a href="https://app.pagescms.org" className="hover:text-white">Webmaster sign-in</a>
        </span>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="eyebrow mb-1 text-cyan">{title}</span>
      {children}
    </div>
  )
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const cls = 'group inline-flex w-fit items-center gap-1.5 text-[15px] text-white/75 transition-colors hover:text-white'
  if (external)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
        <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
      </a>
    )
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}
