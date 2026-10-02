import type { Metadata } from 'next'
import type { Chapter, HeroBlock, Page } from '@/payload-types'
import { PageHero } from '@/components/PageHero'
import { PreviewBar } from '@/components/PreviewBar'
import { RenderBlocks, visibleBlocks } from './RenderBlocks'
import { getPageByPath, getPages, isPreview, mediaUrl, pageHref } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://ieee.soc.pdn.ac.lk'

export function pageMetadata(page: Page): Metadata {
  const hero = (page.layout ?? []).find((b) => b.blockType === 'hero') as HeroBlock | undefined
  const img = mediaUrl(page.cover ?? hero?.image, 'hero')
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.summary || hero?.text || undefined,
    alternates: { canonical: `${siteUrl}${pageHref(page)}` },
    openGraph: img ? { images: [img] } : undefined,
  }
}

/** Walk up the parents for the breadcrumb trail. */
async function trail(page: Page, chapter: Chapter) {
  const crumbs: { label: string; href: string }[] = []
  const segments = (page.path ?? '').split('/').slice(3, -1)
  let acc = `/chapters/${chapter.slug}`
  for (const s of segments) {
    acc += `/${s}`
    const p = await getPageByPath(acc)
    if (p) crumbs.push({ label: p.title, href: pageHref(p) })
  }
  return [{ label: chapter.kind === 'branch' ? 'Student Branch' : chapter.shortName, href: `/chapters/${chapter.slug}` }, ...crumbs]
}

/** A chapter sub-page: its sections, a breadcrumb and cards for its own sub-pages. */
export async function PageView({ page, chapter }: { page: Page; chapter: Chapter }) {
  const accent = page.accent || chapter.accent || '#00629B'
  const [crumbs, children, preview] = await Promise.all([trail(page, chapter), getPages(chapter.id, page.id), isPreview()])
  const blocks = visibleBlocks(page.layout)
  const startsWithHero = blocks[0]?.blockType === 'hero'
  const needsChildren = children.length > 0 && !blocks.some((b) => b.blockType === 'pageLinks')

  return (
    <div style={{ ['--chapter' as string]: accent }}>
      {preview && <PreviewBar status={page._status} path={pageHref(page)} />}
      {!startsWithHero && <PageHero eyebrow={chapter.name} title={page.title} text={page.summary} accent={accent} compact />}
      <RenderBlocks
        blocks={[...blocks, ...(needsChildren ? [{ blockType: 'pageLinks' as const, heading: 'More on this' }] : [])]}
        ctx={{ chapter, accent, page, breadcrumbs: crumbs }}
      />
    </div>
  )
}
