import type { Metadata } from 'next'
import Link from 'next/link'
import clsx from 'clsx'
import { PageHero } from '@/components/PageHero'
import { PostCard } from '@/components/PostCard'
import { Reveal } from '@/components/ui/motion'
import { getChapters, getPosts } from '@/lib/data'
import { QueryViews } from '@/components/ui/QueryViews'
import type { Chapter } from '@/payload-types'

export const metadata: Metadata = { title: 'News & stories', description: 'Recaps, announcements and stories from every chapter of the IEEE Student Branch, University of Peradeniya.' }

export default async function NewsPage() {
  const chapters = await getChapters()
  const views: Record<string, React.ReactNode> = { all: await NewsList({ chapters, active: undefined }) }
  for (const c of chapters) if (c.slug) views[c.slug] = await NewsList({ chapters, active: c })
  return (
    <>
      <PageHero eyebrow="News & stories" title="Straight from the chapters." text="Every chapter publishes its own recaps and announcements — the moment they hit publish, it’s live here." compact />
      <QueryViews views={views} param="chapter" fallback="all" />
    </>
  )
}

async function NewsList({ chapters, active }: { chapters: Chapter[]; active: Chapter | undefined }) {
  const posts = await getPosts({ chapterId: active?.id, limit: 60 })
  const [lead, ...rest] = posts

  return (
    <>
      <section className="bg-paper atmos pb-28 pt-10">
        <div className="container-x">
          <nav aria-label="Filter by chapter" className="mb-12 flex flex-wrap gap-2">
            <Link href="/news" className={clsx('rounded-full border px-4 py-2.5 text-sm font-semibold transition', !active ? 'border-ink bg-ink text-paper' : 'border-line bg-surface hover:border-ink/30')}>
              All
            </Link>
            {chapters.map((c) => (
              <Link
                key={c.id}
                href={`/news?chapter=${c.slug}`}
                className={clsx('rounded-full border px-4 py-2.5 text-sm font-semibold transition', active?.id === c.id ? 'border-transparent text-white' : 'border-line bg-surface hover:border-ink/30')}
                style={active?.id === c.id ? { background: c.accent ?? undefined } : undefined}
              >
                {c.kind === 'branch' ? 'Branch' : c.shortName}
              </Link>
            ))}
          </nav>
          {!lead ? (
            <p className="rounded-2xl border border-dashed border-ink/20 bg-surface p-10 text-ink-3">No stories yet — check back soon.</p>
          ) : (
            <>
              <Reveal className="mb-20">
                <PostCard post={lead} large className="lg:grid lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12" />
              </Reveal>
              <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 0.06}>
                    <PostCard post={p} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
