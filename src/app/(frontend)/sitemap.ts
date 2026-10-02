import type { MetadataRoute } from 'next'
export const dynamic = 'force-static'
import { getAllPublishedPages, getChapters, getEvents, getPosts, getPrograms } from '@/lib/data'


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://ieee.soc.pdn.ac.lk'
  const [chapters, posts, programmes, events, pages] = await Promise.all([getChapters(), getPosts({ limit: 500 }), getPrograms(), getEvents({ limit: 500 }), getAllPublishedPages()])
  const staticPages = ['', '/about', '/chapters', '/events', '/programmes', '/news', '/gallery', '/volunteer', '/contact']
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...chapters.filter((c) => c.kind !== 'branch').map((c) => ({ url: `${base}/chapters/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 })),
    ...programmes.map((p) => ({ url: `${base}/programmes/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...pages.map((p) => ({ url: `${base}${p.url || p.path}`, lastModified: p.updatedAt, priority: p.shortPath ? 0.9 : 0.7 })),
    ...posts.map((p) => ({ url: `${base}/news/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...events.map((e) => ({ url: `${base}/events/${e.slug || e.vtoolsId || e.id}`, lastModified: e.updatedAt, priority: 0.5 })),
  ]
}
