import 'server-only'
import { cache } from 'react'
import type { Chapter, Committee, Event, Form, Media, Page, Post, Program, Album, SiteSetting } from '@/payload-types'
import { activeSpotlight } from './spotlight'
import { hydrate, rawCollection, rawFile } from './content'

/**
 * The same data functions the Payload version had, now reading the JSON files in /content at build time.
 * Every page is pre-rendered by `next build` (static export) and published to GitHub Pages.
 */

const published = (d: { _status?: string | null }) => (d._status ?? 'published') !== 'draft'
const time = (s?: string | null) => (s ? new Date(s).getTime() : 0)
const byDesc = (k: string) => (a: any, b: any) => time(b[k]) - time(a[k])
const byOrder = (a: any, b: any) => (a.order ?? 10) - (b.order ?? 10) || String(a.name ?? a.title).localeCompare(String(b.name ?? b.title))
const same = (a: unknown, b: unknown) => {
  const id = (v: unknown) => (v && typeof v === 'object' ? (v as { id: unknown }).id : v)
  return id(a) != null && id(b) != null && String(id(a)) === String(id(b))
}

export const getSettings = cache(async (): Promise<SiteSetting> => {
  const state = rawFile('vtools-state.json')
  const s = hydrate<SiteSetting>('site-settings', { ...rawFile('settings.json'), id: 'settings' }, 1)
  return { ...s, vtoolsLastSync: state.lastSync ?? null, vtoolsLastResult: state.lastResult ?? null } as SiteSetting
})

export const getChapters = cache(async (): Promise<Chapter[]> =>
  rawCollection('chapters')
    .slice()
    .sort(byOrder)
    .map((c) => hydrate<Chapter>('chapters', c, 1)),
)

export const getChapter = cache(async (slug: string): Promise<Chapter | null> => (await getChapters()).find((c) => c.slug === slug) ?? null)

export type CommitteePerson = {
  id: string
  name: string
  position: string
  group: 'advisor' | 'executive' | 'lead' | 'member'
  team?: string | null
  photo?: number | Media | null
  linkedin?: string | null
  term?: string | null
}

/** Flatten a committee record into the people list the committee layouts render. */
export const flattenCommittee = (c: Committee): CommitteePerson[] => {
  const out: CommitteePerson[] = []
  const term = c.term
  ;(c.advisors ?? []).forEach((a, i) =>
    out.push({ id: `a${a.id ?? i}`, name: a.name, position: a.position || 'Advisor', group: 'advisor', photo: a.photo, linkedin: a.linkedin, term }),
  )
  ;(c.executive ?? []).forEach((e, i) =>
    out.push({ id: `e${e.id ?? i}`, name: e.name, position: e.position, group: 'executive', photo: e.photo, linkedin: e.linkedin, term }),
  )
  ;(c.teams ?? []).forEach((t, ti) =>
    (t.members ?? []).forEach((m, i) =>
      out.push({
        id: `t${ti}-${m.id ?? i}`,
        name: m.name,
        position: m.position || (m.role === 'lead' ? `${t.name} Team Lead` : `${t.name} Team`),
        group: m.role === 'lead' ? 'lead' : 'member',
        team: t.name,
        photo: m.photo,
        term,
      }),
    ),
  )
  return out
}

const committeesRaw = cache(() => rawCollection('committees').slice().sort((a, b) => String(b.term ?? '').localeCompare(String(a.term ?? ''))))

/** Every committee of a chapter, newest term first (for the history page). */
export const getCommittees = cache(async (chapterId: number | string): Promise<Committee[]> =>
  committeesRaw()
    .filter((c) => same(c.chapter, chapterId))
    .map((c) => hydrate<Committee>('committees', c, 1)),
)

/** The committee a chapter shows on the website (the one ticked "On the website", else the newest term). */
export const getCommittee = cache(async (chapterId: number | string): Promise<Committee | null> => {
  const all = await getCommittees(chapterId)
  return all.find((c) => c.current) ?? all[0] ?? null
})

export const getPeople = cache(async (chapterId: number | string): Promise<CommitteePerson[]> => {
  const c = await getCommittee(chapterId)
  return c ? flattenCommittee(c) : []
})

const postsRaw = cache(() => rawCollection('posts').filter(published).sort(byDesc('date')))

export const getPosts = cache(
  async (opts: { limit?: number; chapterId?: number | string; exclude?: number | string; titleContains?: string | null } = {}): Promise<Post[]> => {
    const q = opts.titleContains?.toLowerCase()
    return postsRaw()
      .filter((p) => !opts.chapterId || same(p.chapter, opts.chapterId))
      .filter((p) => !opts.exclude || !same(p.id, opts.exclude))
      .filter((p) => !q || String(p.title ?? '').toLowerCase().includes(q))
      .slice(0, opts.limit ?? 24)
      .map((p) => hydrate<Post>('posts', p, 1))
  },
)

export const getFeaturedPosts = cache(async (limit = 4): Promise<Post[]> => {
  const featured = postsRaw().filter((p) => p.featured)
  const rest = postsRaw().filter((p) => !p.featured)
  return [...featured, ...rest].slice(0, limit).map((p) => hydrate<Post>('posts', p, 1))
})

/** Static site: there is no draft preview (drafts are simply not published). */
export const isPreview = async () => false

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const p = postsRaw().find((x) => x.slug === slug)
  return p ? hydrate<Post>('posts', p, 2) : null
})

const eventsRaw = cache(() => rawCollection('events').filter((e) => !e.hidden && e.start))
/** Build time — the site is rebuilt by GitHub Actions after every vTools sync and every few hours. */
const now = () => Date.now()
const isUpcoming = (e: any) => time(e.end) >= now() || time(e.start) >= now()

export const getEvents = cache(
  async (opts: { when?: 'upcoming' | 'past' | 'all'; chapterId?: number | string; limit?: number; titleContains?: string | null } = {}): Promise<Event[]> => {
    const q = opts.titleContains?.toLowerCase()
    let list = eventsRaw()
    if (opts.when === 'upcoming') list = list.filter(isUpcoming)
    if (opts.when === 'past') list = list.filter((e) => time(e.start) < now())
    if (opts.chapterId) list = list.filter((e) => same(e.chapter, opts.chapterId))
    if (q) list = list.filter((e) => String(e.title ?? '').toLowerCase().includes(q))
    list = list.slice().sort((a, b) => (opts.when === 'upcoming' ? time(a.start) - time(b.start) : time(b.start) - time(a.start)))
    return list.slice(0, opts.limit ?? 100).map((e) => hydrate<Event>('events', e, 1))
  },
)

/** Every event that gets its own page. */
export const getAllEvents = cache(async (): Promise<Event[]> => eventsRaw().map((e) => hydrate<Event>('events', e, 1)))

export const eventKey = (e: { slug?: string | null; vtoolsId?: string | number | null; id: string | number }) => String(e.slug || e.vtoolsId || e.id)

export const getEvent = cache(async (slug: string): Promise<Event | null> => {
  const e = eventsRaw().find((x) => x.slug === slug || String(x.vtoolsId) === slug || String(x.id) === slug)
  return e ? hydrate<Event>('events', e, 1) : null
})

export const getPrograms = cache(async (): Promise<Program[]> =>
  rawCollection('programs')
    .slice()
    .sort(byOrder)
    .map((p) => hydrate<Program>('programs', p, 1)),
)

export const getProgram = cache(async (slug: string): Promise<Program | null> => (await getPrograms()).find((p) => p.slug === slug) ?? null)

export const getAlbums = cache(async (chapterId?: number | string): Promise<Album[]> =>
  rawCollection('albums')
    .filter((a) => !chapterId || same(a.chapter, chapterId))
    .sort(byDesc('date'))
    .slice(0, 60)
    .map((a) => hydrate<Album>('albums', a, 1)),
)

export { asMedia, mediaUrl, mediaInfo, asChapter, accentVars, type MaybeMedia, type MediaInfo } from './media'

// ---------------------------------------------------------------- pages, forms

const pagesRaw = cache(() => rawCollection('pages'))
const pagesPublished = cache(() => pagesRaw().filter(published).map((p) => hydrate<Page>('pages', p, 0)))
const deepPage = (id: unknown, depth: number) => {
  const raw = pagesRaw().find((r) => same(r.id, id))
  return raw ? hydrate<Page>('pages', raw, depth) : null
}

/** A sub-page by its full address. */
export const getPageByPath = cache(async (path: string): Promise<Page | null> => {
  const p = pagesPublished().find((x) => x.path === path)
  return p ? deepPage(p.id, 2) : null
})

/** The home-page spotlight, with its linked page loaded deep enough for the cover and header photo. */
export const getSpotlight = cache(async () => {
  const settings = await getSettings()
  const ref = settings.spotlight?.page
  const id = ref && typeof ref === 'object' ? ref.id : ref
  let page: Page | null = null
  if (settings.spotlight?.active && settings.spotlight.linkType !== 'url' && id) {
    const raw = pagesRaw().find((r) => same(r.id, id))
    if (!raw || !published(raw)) return null
    page = hydrate<Page>('pages', raw, 1)
  }
  return activeSpotlight(settings, page)
})

/** A page by its short address (/conf2026), or one of its sub-pages (/conf2026/registration). */
export const getPageByShort = cache(async (short: string, rest: string[] = []): Promise<Page | null> => {
  const root = pagesPublished().find((p) => p.shortPath === short)
  if (!root) return null
  return getPageByPath(rest.length ? `${root.path}/${rest.join('/')}` : root.path!)
})

/** Where visitors find a page: its short address when it has one, else /chapters/… */
export const pageHref = (p: Pick<Page, 'url' | 'path'> | null | undefined) => p?.url || p?.path || '#'

/** Published sub-pages of a chapter (top level), or the children of one page. */
export const getPages = cache(async (chapterId: number | string, parentId?: number | string | null): Promise<Page[]> =>
  pagesPublished()
    .filter((p) => same(p.chapter, chapterId))
    .filter((p) => (parentId ? same(p.parent, parentId) : !p.parent))
    .sort(byOrder)
    .map((p) => deepPage(p.id, 1)!),
)

export const getAllPublishedPages = cache(async (): Promise<Page[]> => pagesPublished())

const formsRaw = cache(() => rawCollection('forms'))

export const getForm = cache(async (idOrSlug: number | string): Promise<Form | null> => {
  const f = formsRaw().find((x) => same(x.id, idOrSlug) || x.slug === idOrSlug)
  return f ? hydrate<Form>('forms', f, 0) : null
})

export const getAllForms = cache(async (): Promise<Form[]> => formsRaw().map((f) => hydrate<Form>('forms', f, 0)))

/** Responses go to the form's own inbox (see FormView), not to this site. */
export const countResponses = async (_formId: number | string) => 0

export const getAlbum = cache(async (id: number | string): Promise<Album | null> => {
  const a = rawCollection('albums').find((x) => same(x.id, id) || x.slug === id)
  return a ? hydrate<Album>('albums', a, 1) : null
})
