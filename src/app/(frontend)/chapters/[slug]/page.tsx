import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { PageHero } from '@/components/PageHero'
import { RenderBlocks, visibleBlocks } from '@/components/blocks/RenderBlocks'
import { defaultChapterLayout } from '@/blocks/defaults'
import { getChapter, getChapters, getPages, getPeople, mediaUrl } from '@/lib/data'
import { relativeFromNow } from '@/lib/format'

export const dynamicParams = false

export async function generateStaticParams() {
  const chapters = await getChapters()
  return chapters.filter((c) => c.kind !== 'branch' && c.slug).map((c) => ({ slug: c.slug as string }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = await getChapter(slug)
  if (!c) return {}
  return { title: c.name, description: c.tagline ?? c.about?.slice(0, 160) }
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const chapter = await getChapter(slug)
  if (!chapter) notFound()

  const [people, pages] = await Promise.all([getPeople(chapter.id), getPages(chapter.id)])
  const accent = chapter.accent || '#00629B'
  // an empty layout (e.g. a brand-new chapter) falls back to the standard page
  const layout = chapter.layout?.length ? chapter.layout : (defaultChapterLayout(chapter.shortName) as NonNullable<typeof chapter.layout>)
  const has = (t: string) => visibleBlocks(layout).some((b) => b.blockType === t)
  const nav: [string, string][] = [
    ...(has('chapterAbout') ? ([['#about', 'About']] as [string, string][]) : []),
    ...pages.filter((p) => p.showInNav !== false).map((p) => [p.url || p.path || '#', p.title] as [string, string]),
    ...(has('events') ? ([['#events', 'Events']] as [string, string][]) : []),
    ...(has('stories') ? ([['#stories', 'Stories']] as [string, string][]) : []),
    ...(has('people') ? ([['#team', 'Team']] as [string, string][]) : []),
  ]

  return (
    <div style={{ ['--chapter' as string]: accent }}>
      <PageHero
        eyebrow={chapter.kind === 'affinity' ? 'Affinity group · University of Peradeniya' : 'Society chapter · University of Peradeniya'}
        title={chapter.name}
        text={chapter.tagline}
        image={mediaUrl(chapter.cover, 'hero')}
        accent={accent}
        mosaic={people.map((p) => mediaUrl(p.photo, 'thumb')).filter((u): u is string => Boolean(u))}
      >
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {chapter.links?.join && (
            <a href={chapter.links.join} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 font-semibold text-night transition hover:bg-cyan">
              Join {chapter.shortName} <ArrowUpRight className="size-4" aria-hidden />
            </a>
          )}
          {chapter.links?.email && (
            <a href={`mailto:${chapter.links.email}`} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-5 font-semibold hover:bg-white/10">
              <Mail className="size-4" aria-hidden /> Contact
            </a>
          )}
          <span className="font-mono text-xs text-white/55">Page updated {relativeFromNow(chapter.updatedAt)} by the {chapter.shortName} webmaster</span>
        </div>
      </PageHero>

      {nav.length > 1 && (
        <nav aria-label="Chapter sections" className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-xl">
          <div className="container-x flex gap-1 overflow-x-auto py-2 text-[15px] font-semibold">
            {nav.map(([href, label]) =>
              href.startsWith('#') ? (
                <a key={href} href={href} className="shrink-0 rounded-full px-4 py-2.5 text-ink-2 transition hover:bg-paper hover:text-ink">
                  {label}
                </a>
              ) : (
                <Link key={href} href={href} className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-ink transition hover:bg-paper">
                  <span className="size-1.5 rounded-full" style={{ background: accent }} />
                  {label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}

      <RenderBlocks blocks={layout} ctx={{ chapter, accent }} />
    </div>
  )
}
