import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageView, pageMetadata } from '@/components/blocks/PageView'
import { asChapter, getAllPublishedPages, getChapter, getPageByShort } from '@/lib/data'


/**
 * Short addresses set by the branch webmaster on a page — ieee.soc.pdn.ac.lk/conf2026 and its
 * sub-pages (/conf2026/registration). Every other top-level route (about, events, …) is matched first.
 */
export const dynamicParams = false

export async function generateStaticParams() {
  const pages = await getAllPublishedPages()
  // every page whose public address is short (/conf2026) or below one (/conf2026/registration)
  const out = pages
    .filter((p) => p.url && !p.url.startsWith('/chapters/'))
    .map((p) => {
      const [, short, ...rest] = (p.url as string).split('/')
      return { short, rest }
    })
  // static export needs at least one page per route; this one is a 404
  return out.length ? out : [{ short: '_', rest: [] }]
}

type Params = { params: Promise<{ short: string; rest?: string[] }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { short, rest } = await params
  const page = await getPageByShort(short.toLowerCase(), rest ?? [])
  return page ? pageMetadata(page) : {}
}

export default async function ShortAddressPage({ params }: Params) {
  const { short, rest } = await params
  const page = await getPageByShort(short.toLowerCase(), rest ?? [])
  if (!page) notFound()
  const chapter = asChapter(page.chapter) ?? (await getChapter(String(page.path ?? '').split('/')[2] ?? ''))
  if (!chapter) notFound()
  return <PageView page={page} chapter={chapter} />
}
