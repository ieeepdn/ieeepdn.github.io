import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/ui/motion'
import { getChapters, getSettings } from '@/lib/data'

export const metadata: Metadata = { title: 'Contact', description: 'Get in touch with the IEEE Student Branch, University of Peradeniya.' }

export default async function ContactPage() {
  const [settings, chapters] = await Promise.all([getSettings(), getChapters()])
  const withEmail = chapters.filter((c) => c.links?.email)
  return (
    <>
      <PageHero eyebrow="Contact" title="Let’s build something together." text="Partnerships, sponsorships, speaking at an event or just a question — we’d love to hear from you." compact />
      <section className="bg-paper atmos py-20 md:py-28">
        <div className="container-x grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Reveal className="flex flex-col justify-between gap-10 rounded-[2rem] bg-night p-8 text-white md:p-12">
            <div className="flex flex-col gap-4">
              <Mail className="size-8 text-cyan" aria-hidden />
              <span className="eyebrow text-cyan">Email the branch</span>
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="w-fit break-all font-display text-[clamp(1.8rem,4vw,3.4rem)] font-extrabold tracking-[-0.03em] hover:text-cyan">
                  {settings.email}
                </a>
              )}
            </div>
            {settings.address && (
              <div className="flex gap-4 text-white/70">
                <MapPin className="mt-1 size-5 shrink-0 text-cyan" aria-hidden />
                <p className="whitespace-pre-line leading-relaxed">{settings.address}</p>
              </div>
            )}
          </Reveal>
          <Reveal delay={0.08} className="relative min-h-[360px] overflow-hidden rounded-[2rem] border border-line bg-surface">
            <iframe
              title="Faculty of Engineering, University of Peradeniya on the map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=80.5857%2C7.2497%2C80.5977%2C7.2597&layer=mapnik&marker=7.2547%2C80.5917"
              className="absolute inset-0 size-full border-0 grayscale-[0.4]"
              loading="lazy"
            />
          </Reveal>
        </div>
        {withEmail.length > 0 && (
          <div className="container-x mt-16">
            <h2 className="mb-6 font-display text-3xl font-extrabold tracking-[-0.03em]">Chapters</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {withEmail.map((c) => (
                <a key={c.id} href={`mailto:${c.links?.email}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition hover:border-ink/30">
                  <span className="flex flex-col">
                    <span className="font-display text-xl font-bold">{c.kind === 'branch' ? 'Student Branch' : c.shortName}</span>
                    <span className="text-sm text-ink-3">{c.links?.email}</span>
                  </span>
                  <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="container-x mt-12 text-ink-3">
          Webmaster? <a href="https://app.pagescms.org" className="font-semibold text-brand hover:underline">Sign in to Pages CMS</a>.
        </div>
      </section>
    </>
  )
}
