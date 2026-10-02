import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/PageHero'
import { Committee } from '@/components/Committee'
import { PageView, pageMetadata } from '@/components/blocks/PageView'
import { toCommittee } from '@/lib/committee'
import { asChapter, flattenCommittee, getAllPublishedPages, getChapter, getChapters, getCommittees, getPageByPath } from '@/lib/data'
import { Redirect } from '@/components/ui/Redirect'


const termSlug = (t: string) => t.replace(/[^0-9a-z]+/gi, '-').toLowerCase()

export const dynamicParams = false

export async function generateStaticParams() {
  const pages = await getAllPublishedPages()
  const out: { slug: string; path: string[] }[] = pages
    .filter((p) => p.path?.startsWith('/chapters/'))
    .map((p) => {
      const [, , slug, ...path] = (p.path as string).split('/')
      return { slug, path }
    })
  // committee history: /chapters/<slug>/committee and /chapters/<slug>/committee/<term>
  for (const c of await getChapters()) {
    const all = await getCommittees(c.id)
    if (!all.length || !c.slug) continue
    out.push({ slug: c.slug, path: ['committee'] })
    for (const t of all) out.push({ slug: c.slug, path: ['committee', termSlug(t.term)] })
  }
  return out
}

type Params = { params: Promise<{ slug: string; path: string[] }> }


export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, path } = await params
  if (path[0] === 'committee') return { title: 'Committees' }
  const page = await getPageByPath(`/chapters/${slug}/${path.join('/')}`)
  return page ? pageMetadata(page) : {}
}

export default async function SubPage({ params }: Params) {
  const { slug, path } = await params

  // /chapters/<slug>/committee[/<term>] — every committee, current and past
  if (path[0] === 'committee') {
    const chapter = await getChapter(slug)
    if (!chapter) notFound()
    const all = await getCommittees(chapter.id)
    if (!all.length) notFound()
    const chosen = path[1] ? all.find((c) => termSlug(c.term) === path[1]) : (all.find((c) => c.current) ?? all[0])
    if (!chosen) notFound()
    const accent = chapter.accent || '#00629B'
    const people = flattenCommittee(chosen)
    return (
      <>
        <PageHero eyebrow={`${chapter.shortName} · committees`} title={`${chapter.shortName} committee ${chosen.term}`} text={`Every ${chapter.shortName} committee, from the current one back — kept as the chapter’s history.`} accent={accent} compact />
        <nav aria-label="Terms" className="border-b border-line bg-surface">
          <div className="container-x flex gap-1 overflow-x-auto py-2 text-[15px] font-semibold">
            {all.map((c) => (
              <Link
                key={c.id}
                href={`/chapters/${chapter.slug}/committee/${termSlug(c.term)}`}
                aria-current={c.id === chosen.id ? 'page' : undefined}
                className="shrink-0 rounded-full px-4 py-2.5 text-ink-2 transition hover:bg-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper"
              >
                {c.term}
                {c.current ? ' · current' : ''}
              </Link>
            ))}
          </div>
        </nav>
        <section className="bg-paper atmos py-20 md:py-28">
          <div className="container-x">
            <Committee people={toCommittee(people)} accent={accent} title={`${chapter.shortName} ${chosen.term}`} term={chosen.term} chapterName={chapter.name} />
          </div>
        </section>
      </>
    )
  }

  const page = await getPageByPath(`/chapters/${slug}/${path.join('/')}`)
  if (!page) notFound()
  // pages with a short address (/conf2026) live there; the long address forwards to it
  if (page.url && page.url !== page.path) return <Redirect to={page.url} />
  const chapter = asChapter(page.chapter) ?? (await getChapter(slug))
  if (!chapter) notFound()
  return <PageView page={page} chapter={chapter} />
}
