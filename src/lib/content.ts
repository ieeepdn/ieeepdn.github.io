import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import schema from '@/content/schema.json'

/**
 * Build-time content store. Everything the site shows lives as JSON in /content (edited with Pages CMS or
 * by the vTools sync in GitHub Actions). This module reads those files and "hydrates" them into the same
 * shapes Payload used to return, so every page and component works unchanged:
 *   - image paths ("/media/x.jpg")   → Media objects (url, alt, width, height, focal point, resized sizes)
 *   - file paths ("/files/x.pdf")    → Document objects
 *   - references (an entry's id)     → the referenced entry (one level deep, like Payload's depth)
 */

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

type Json = Record<string, any>
type SchemaField = { name: string; kind: 'media' | 'file' | 'rel' | 'array' | 'group' | 'blocks'; many?: boolean; to?: string; fields?: SchemaField[]; blocks?: Record<string, SchemaField[]> }
const SCHEMA = schema as unknown as Record<string, SchemaField[]>

const readJson = (file: string): any => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw new Error(`Could not read ${path.relative(ROOT, file)}: ${(e as Error).message}`)
  }
}

/**
 * Pages CMS date pickers save local Sri Lanka time without a zone ("2026-09-28T10:00"). Give those an
 * explicit +05:30 so the build (which runs in UTC on GitHub Actions) reads them correctly.
 */
const LOCAL_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/
const zoned = (v: any): any => {
  if (typeof v === 'string') return LOCAL_DT.test(v) ? `${v}+05:30` : v
  if (Array.isArray(v)) return v.map(zoned)
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) v[k] = zoned(v[k])
    return v
  }
  return v
}

/** All entries of a collection folder, raw (not hydrated). */
export const rawCollection = cache((collection: string): Json[] => {
  const dir = path.join(CONTENT, collection)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const doc = zoned(readJson(path.join(dir, f)) ?? {})
      // entries created in Pages CMS always get an id (uuid field); fall back to the file name just in case
      if (!doc.id) doc.id = f.replace(/\.json$/, '')
      doc.id = String(doc.id)
      doc.updatedAt ||= doc.createdAt || fs.statSync(path.join(dir, f)).mtime.toISOString()
      doc.createdAt ||= doc.updatedAt
      doc._file = f
      return doc
    })
})

export const rawFile = cache((name: string): Json => zoned(readJson(path.join(CONTENT, name)) ?? {}))

// ---------------------------------------------------------------- media

type SizeInfo = { url: string; width: number; height: number }
type MediaIndexEntry = { width: number; height: number; sizes?: Partial<Record<'thumb' | 'card' | 'hero', SizeInfo>> }

const mediaIndex = cache((): Record<string, MediaIndexEntry> => readJson(path.join(ROOT, 'src/content/media-index.json')) ?? {})
const mediaMeta = cache((): Map<string, Json> => {
  const list = (readJson(path.join(CONTENT, 'media.json')) ?? []) as Json[]
  return new Map(list.filter((m) => m?.file).map((m) => [String(m.file), m]))
})

const withBase = (u: string) => (BASE_PATH && u.startsWith('/') && !u.startsWith(BASE_PATH + '/') ? BASE_PATH + u : u)

/** "/media/x.jpg" (as stored by Pages CMS) → a Payload-like Media object. */
export const toMedia = (p: unknown): Json | null => {
  if (!p) return null
  if (typeof p === 'object') return p as Json
  const file = String(p)
  if (/^https?:\/\//.test(file)) return { id: file, url: file, filename: file.split('/').pop(), alt: '', width: null, height: null }
  const key = file.startsWith('/') ? file : `/${file}`
  const info = mediaIndex()[key]
  const meta = mediaMeta().get(key) ?? {}
  const sizes: Json = {}
  for (const s of ['thumb', 'card', 'hero'] as const) {
    const v = info?.sizes?.[s]
    if (v) sizes[s] = { ...v, url: withBase(v.url) }
  }
  return {
    id: key,
    url: withBase(key),
    filename: key.split('/').pop(),
    alt: meta.alt ?? '',
    credit: meta.credit ?? null,
    width: info?.width ?? null,
    height: info?.height ?? null,
    focalX: typeof meta.focalX === 'number' ? meta.focalX : 50,
    focalY: typeof meta.focalY === 'number' ? meta.focalY : 50,
    sizes,
  }
}

const toDocument = (p: unknown): Json | null => {
  if (!p) return null
  if (typeof p === 'object') return p as Json
  const key = String(p)
  const entry = rawCollection('documents').find((d) => d.file === key || d.id === key)
  if (entry) return { ...entry, url: withBase(String(entry.file)), filename: String(entry.file).split('/').pop() }
  return { id: key, url: withBase(key), filename: key.split('/').pop(), title: key.split('/').pop() }
}

// ---------------------------------------------------------------- hydration

const COLLECTION_OF: Record<string, string> = { 'site-settings': 'site-settings' }

const byId = cache((collection: string) => new Map(rawCollection(collection).map((d) => [String(d.id), d])))

const resolveRel = (to: string, id: unknown, depth: number): unknown => {
  if (id == null || id === '') return null
  if (typeof id === 'object') return id
  if (depth <= 0) return String(id)
  const target = to === 'pages' ? allPagesRaw().find((p) => p.id === String(id)) : byId(to).get(String(id))
  if (!target) return null
  return hydrate(to, target, depth - 1)
}

const hydrateFields = (fields: SchemaField[], data: Json, depth: number): Json => {
  if (!data || typeof data !== 'object') return data
  const out: Json = { ...data }
  for (const f of fields) {
    const v = data[f.name]
    if (v === undefined || v === null) continue
    switch (f.kind) {
      case 'media':
        out[f.name] = f.many ? (Array.isArray(v) ? v : [v]).map(toMedia).filter(Boolean) : toMedia(v)
        break
      case 'file':
        out[f.name] = f.many ? (Array.isArray(v) ? v : [v]).map(toDocument).filter(Boolean) : toDocument(v)
        break
      case 'rel':
        out[f.name] = f.many ? (Array.isArray(v) ? v : [v]).map((x) => resolveRel(f.to!, x, depth)).filter(Boolean) : resolveRel(f.to!, v, depth)
        break
      case 'group':
        out[f.name] = hydrateFields(f.fields ?? [], v, depth)
        break
      case 'array':
        out[f.name] = (Array.isArray(v) ? v : []).map((row: Json, i: number) => ({ id: `${f.name}-${i}`, ...hydrateFields(f.fields ?? [], row, depth) }))
        break
      case 'blocks':
        out[f.name] = (Array.isArray(v) ? v : []).map((row: Json, i: number) => ({
          id: `${row.blockType}-${i}`,
          ...hydrateFields(f.blocks?.[row.blockType] ?? [], row, depth),
        }))
        break
    }
  }
  return out
}

/** Make a raw entry look like a Payload document at the given depth. */
export const hydrate = <T = Json>(collection: string, doc: Json, depth = 1): T => {
  const fields = SCHEMA[COLLECTION_OF[collection] ?? collection] ?? []
  const out = hydrateFields(fields, doc, depth)
  if (collection === 'pages') Object.assign(out, pageAddress(doc))
  return out as T
}

// ---------------------------------------------------------------- pages: addresses (was a Payload hook)

const slugify = (s: string) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const allPagesRaw = cache(() => rawCollection('pages'))

/** /chapters/<chapter>/<parent…>/<slug>, and the short address (/conf2026) when it has one. */
export const pageAddress = (doc: Json, seen = new Set<string>()): { slug: string; path: string; url: string; shortPath: string | null } => {
  const slug = slugify(doc.slug || doc.title || 'page')
  const pages = allPagesRaw()
  const parent = doc.parent && !seen.has(String(doc.parent)) ? pages.find((p) => p.id === String(doc.parent) && p.id !== doc.id) : null
  seen.add(String(doc.id))
  const parentAddr = parent ? pageAddress(parent, seen) : null
  const chapter = byId('chapters').get(String(doc.chapter))
  const base = parentAddr?.path ?? `/chapters/${chapter?.slug ?? 'student-branch'}`
  const p = `${base}/${slug}`
  const short = doc.shortPath ? slugify(doc.shortPath) : null
  let url = p
  if (short) url = `/${short}`
  else if (parentAddr && !parentAddr.url.startsWith('/chapters/')) url = `${parentAddr.url}/${slug}`
  return { slug, path: p, url, shortPath: short }
}
