#!/usr/bin/env node
/**
 * IEEE vTools → content/events/*.json
 *
 * Runs in GitHub Actions every 30 minutes (see .github/workflows/site.yml) and can be run by hand:
 *   node scripts/vtools-sync.mjs           # each unit's Upcoming + Recent events
 *   node scripts/vtools-sync.mjs --full    # each unit's entire history
 *
 * How events are found (same method as the original server version, tested Sept 2026):
 *  - vTools' public search page filters by organisational unit (…/events/search?ou=STB18711&d=Upcoming)
 *    and links every event as /m/<id>; each event's details and photos then come from the public JSON API
 *    (…/RST/events/api/public/v5/events/list?id=<id>&include=media). No API key is needed.
 *  - Event → chapter: SPOID of host/co-host, then host name + chapter keywords, then "…Peradeniy…" → branch,
 *    else the unit whose list it was found in.
 *  - Posters/photos are copied once into public/media (so the site never hot-links vTools).
 *
 * vTools owns title, dates, summary, venue and links (overwritten on every sync). Webmasters own the cover,
 * photos, category, "hidden" and "featured" (never touched after the first import). An event file deleted
 * in Pages CMS is remembered in content/vtools-state.json and never re-created — use "Hide" to take an
 * event off the site but keep it.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CONTENT = path.join(ROOT, 'content')
const EVENTS = path.join(CONTENT, 'events')
const MEDIA_DIR = path.join(ROOT, 'public/media')
const STATE_FILE = path.join(CONTENT, 'vtools-state.json')
const MEDIA_META = path.join(CONTENT, 'media.json')

const VTOOLS_BASE = (process.env.VTOOLS_BASE_URL || 'https://events.vtools.ieee.org').replace(/\/$/, '')
const VTOOLS_LIST_URL = process.env.VTOOLS_API_URL || `${VTOOLS_BASE}/RST/events/api/public/v5/events/list`
const UA = 'IEEE-SB-UoP-website/2.0 (+https://ieee.soc.pdn.ac.lk)'
const MODE = process.argv.includes('--full') || process.env.VTOOLS_MODE === 'full' ? 'full' : 'auto'
const PER_EVENT = Number(process.env.VTOOLS_IMAGES_PER_EVENT || 9)

const readJson = (f, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'))
  } catch {
    return fallback
  }
}
const writeJson = (f, data) => {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n')
}
const readDir = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => ({ file: f, doc: readJson(path.join(dir, f), {}) }))
    : []

// ------------------------------------------------------------------ vTools helpers

const stripHtml = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()

const pick = (a, ...keys) => {
  for (const k of keys) if (a[k] !== undefined && a[k] !== null && a[k] !== '') return a[k]
  return undefined
}

function normalise(raw) {
  const a = raw.attributes ?? {}
  const html = String(pick(a, 'description', 'agenda') ?? '')
  const text = stripHtml(html)
  const host = pick(a, 'primary-host', 'primary_host')
  const cohosts = (pick(a, 'cohosts', 'co-hosts') ?? []).filter(Boolean)
  const venue = [pick(a, 'building'), pick(a, 'room-number', 'room_number'), pick(a, 'address1')].filter(Boolean).join(', ')
  const locationType = String(pick(a, 'location-type', 'location_type') ?? '')
  const id = String(raw.id ?? pick(a, 'id'))
  return {
    id,
    title: String(pick(a, 'title') ?? 'Untitled event').trim(),
    descriptionHtml: html,
    summary: text.length > 320 ? `${text.slice(0, 317).trimEnd()}…` : text,
    start: String(pick(a, 'start-time', 'start_time')),
    end: pick(a, 'end-time', 'end_time'),
    host,
    cohosts,
    venue: venue || undefined,
    city: pick(a, 'city'),
    virtual: Boolean(pick(a, 'virtual')) || /virtual|online/i.test(locationType),
    cancelled: Boolean(pick(a, 'cancelled')),
    registrationUrl: pick(a, 'registration-url', 'registration_url'),
    vtoolsUrl: pick(a, 'link') || `https://events.vtools.ieee.org/m/${id}`,
    tags: (pick(a, 'tags') ?? []).map(String),
    images: (pick(a, 'media') ?? [])
      .filter((m) => /^image\//.test(String(m['content-type'] ?? '')) && (m.display_url || m.download_url))
      .map((m) => ({ url: String(m.display_url || m.download_url), title: String(m.title ?? '') })),
  }
}

async function http(url, as, timeoutMs = 60_000) {
  let lastErr
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: as === 'json' ? 'application/json' : '*/*' }, signal: controller.signal })
      if (!res.ok) throw new Error(`vTools responded ${res.status}`)
      if (as === 'json') return await res.json()
      if (as === 'text') return await res.text()
      return { buffer: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || 'image/jpeg' }
    } catch (err) {
      lastErr = err
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastErr
}

async function searchUnitEventIds(spoid, range) {
  const url = (page) =>
    `${VTOOLS_BASE}/events/search?${new URLSearchParams({ _sub: 'true', commit: 'Search', q: '', ou: spoid.trim(), d: range, page: String(page) })}`
  const idsIn = (html) => [...html.matchAll(/\/m\/(\d{4,})/g)].map((m) => m[1])
  const first = await http(url(1), 'text', 90_000)
  const total = Number(first.match(/Showing\s+\d+\s+of\s+(\d+)/)?.[1] ?? 0)
  if (total > 3000) throw new Error(`vTools does not recognise the unit ID "${spoid}" — check the SPOID on that chapter`)
  const ids = new Set(idsIn(first))
  const pages = Math.min(Math.ceil(total / 50), 40)
  for (let p = 2; p <= pages; p++) idsIn(await http(url(p), 'text', 90_000)).forEach((id) => ids.add(id))
  return [...ids]
}

async function fetchEvent(id) {
  const res = await http(`${VTOOLS_LIST_URL}?${new URLSearchParams({ id, include: 'media' })}`, 'json')
  const raw = res.data?.[0]
  if (!raw) return null
  const ev = normalise(raw)
  return ev.start && ev.start !== 'undefined' ? ev : null
}

async function pool(items, n, fn) {
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        await fn(items[i], i)
      }
    }),
  )
}

function matchChapter(ev, chapters, branchHostMatch) {
  const hosts = [ev.host, ...ev.cohosts].filter(Boolean)
  for (const h of hosts) {
    const hit = chapters.find((c) => c.spoid && h.spoid && c.spoid.trim().toUpperCase() === String(h.spoid).trim().toUpperCase())
    if (hit) return hit.id
  }
  const needleBranch = (branchHostMatch ?? '').toLowerCase()
  for (const h of hosts) {
    const name = (h.name ?? '').toLowerCase()
    if (needleBranch && !name.includes(needleBranch)) continue
    const hit = chapters.find(
      (c) =>
        c.kind !== 'branch' &&
        c.hostMatch &&
        c.hostMatch
          .toLowerCase()
          .split('|')
          .some((k) => k.trim() && name.includes(k.trim())),
    )
    if (hit) return hit.id
  }
  if (branchHostMatch && hosts.some((h) => (h.name ?? '').toLowerCase().includes(needleBranch))) return chapters.find((c) => c.kind === 'branch')?.id ?? null
  return null
}

const categorise = (ev) => {
  const t = `${ev.title} ${ev.tags.join(' ')}`.toLowerCase()
  if (/(hackathon|competition|challenge|xtreme|contest|predicta)/.test(t)) return 'competition'
  if (/(workshop|hands-on|bootcamp|training)/.test(t)) return 'workshop'
  if (/(visit|tour|field)/.test(t)) return 'visit'
  if (/(agm|meeting|general)/.test(t)) return 'meeting'
  if (/(donation|charity|outreach|social|relief|day)/.test(t)) return 'social'
  return 'talk'
}

/** vTools times → local Sri Lanka time without a zone, the format Pages CMS date pickers use. */
const local = (iso) => {
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? iso : new Date(t + 330 * 60_000).toISOString().slice(0, 16)
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')

// ------------------------------------------------------------------ run

const settings = readJson(path.join(CONTENT, 'settings.json'), {})
const state = readJson(STATE_FILE, {})
state.known = Array.isArray(state.known) ? state.known : []
state.ignored = Array.isArray(state.ignored) ? state.ignored : []

if (settings.vtoolsEnabled === false) {
  console.log('vTools sync is switched off in Site settings.')
  process.exit(0)
}

const chapterFiles = readDir(path.join(CONTENT, 'chapters')).map((x) => x.doc)
const chapters = chapterFiles.map((c) => ({
  id: String(c.id),
  shortName: c.shortName,
  kind: c.kind,
  spoid: ((c.kind === 'branch' ? settings.vtoolsBranchSpoid || c.vtools?.spoid : c.vtools?.spoid) || '').trim() || null,
  hostMatch: c.vtools?.hostNameMatch,
}))
const units = chapters.filter((c) => c.spoid)
const mode = MODE === 'full' || !state.historyImported ? 'full' : 'recent'
const result = { units: units.length, found: 0, created: 0, updated: 0, images: 0, warnings: [] }
const missing = chapters.filter((c) => !c.spoid).map((c) => c.shortName)
if (missing.length) result.warnings.push(`No vTools SPOID yet: ${missing.join(', ')}`)

// existing events, by vTools id
const eventFiles = readDir(EVENTS)
const byVtoolsId = new Map(eventFiles.filter((x) => x.doc.vtoolsId).map((x) => [String(x.doc.vtoolsId), x]))
const usedSlugs = new Set(eventFiles.map((x) => x.doc.slug).filter(Boolean))
// a vTools event we imported before whose file is gone was deleted by a webmaster → never bring it back
for (const id of state.known) if (!byVtoolsId.has(String(id)) && !state.ignored.includes(String(id))) state.ignored.push(String(id))
const ignore = new Set(state.ignored.map(String))

const mediaMeta = readJson(MEDIA_META, [])
let failed = null
try {
  const ranges = mode === 'full' ? ['All'] : ['Upcoming', 'Recent']
  const foundUnder = new Map()
  await pool(
    units.flatMap((u) => ranges.map((r) => [u, r])),
    3,
    async ([u, r]) => {
      try {
        for (const id of await searchUnitEventIds(u.spoid, r)) if (!foundUnder.has(id)) foundUnder.set(id, u.id)
      } catch (err) {
        result.warnings.push(`${u.spoid} (${r.toLowerCase()}): ${err.message}`)
      }
    },
  )
  result.found = foundUnder.size
  if (!result.found && result.warnings.length) throw new Error(`could not read any unit from vTools (${result.warnings.slice(-2).join('; ')})`)

  const ids = [...foundUnder.keys()].filter((id) => !ignore.has(id))
  await pool(ids, 6, async (id) => {
    let ev = null
    try {
      ev = await fetchEvent(id)
    } catch (err) {
      result.warnings.push(`Event ${id}: ${err.message}`)
    }
    if (!ev || ev.cancelled) return
    const chapter = matchChapter(ev, units, settings.vtoolsHostMatch) ?? foundUnder.get(id)
    const prev = byVtoolsId.get(id)
    const vtoolsOwned = {
      title: ev.title,
      start: local(ev.start),
      ...(ev.end ? { end: local(ev.end) } : {}),
      summary: ev.summary,
      descriptionHtml: ev.descriptionHtml,
      ...(ev.venue ? { venue: ev.venue } : {}),
      ...(ev.city ? { city: ev.city } : {}),
      virtual: ev.virtual,
      ...(ev.registrationUrl ? { registrationUrl: ev.registrationUrl } : {}),
      vtoolsUrl: ev.vtoolsUrl,
      ...(ev.host?.name ? { hostName: ev.host.name } : {}),
      vtoolsId: ev.id,
      source: 'vtools',
      chapter,
    }
    let doc
    let file
    if (prev) {
      doc = { ...prev.doc }
      const before = JSON.stringify(doc)
      Object.assign(doc, vtoolsOwned)
      // only touch the file when vTools actually changed something
      if (JSON.stringify(doc) === before && doc.vtoolsMediaDone !== undefined) return
      if (JSON.stringify(doc) !== before) {
        doc.syncedAt = new Date().toISOString()
        doc.updatedAt = doc.syncedAt
        result.updated++
      }
      file = prev.file
    } else {
      let slug = slugify(ev.title) || `vtools-${ev.id}`
      if (usedSlugs.has(slug)) slug = `${slug}-${ev.id}`
      usedSlugs.add(slug)
      doc = { id: `vtools-${ev.id}`, slug, ...vtoolsOwned, category: categorise(ev), syncedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      file = `${slug}.json`
      result.created++
    }

    // posters & photos, once per event
    if (ev.images.length && !doc.vtoolsMediaDone) {
      const got = []
      for (const [i, img] of ev.images.slice(0, PER_EVENT).entries()) {
        try {
          const { buffer, type } = await http(img.url, 'buffer', 60_000)
          if (!/^image\//.test(type) || buffer.length < 2_000) continue
          const ext = type.split('/')[1]?.replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'jpg'
          const name = `vtools-${ev.id}-${i + 1}.${ext}`
          fs.mkdirSync(MEDIA_DIR, { recursive: true })
          fs.writeFileSync(path.join(MEDIA_DIR, name), buffer)
          const p = `/media/${name}`
          got.push(p)
          if (!mediaMeta.some((m) => m.file === p)) mediaMeta.push({ file: p, alt: `${ev.title}${ev.images.length > 1 ? ` — photo ${i + 1}` : ''}`.slice(0, 250), credit: 'IEEE vTools' })
        } catch (err) {
          result.warnings.push(`Photo for ${ev.id}: ${err.message}`)
        }
      }
      result.images += got.length
      if (got.length) {
        if (!doc.cover) doc.cover = got[0]
        if (!doc.gallery?.length && got.length > 1) doc.gallery = got.slice(1)
      }
    }
    doc.vtoolsMediaDone = true
    writeJson(path.join(EVENTS, file), doc)
    if (!state.known.includes(ev.id)) state.known.push(ev.id)
  })
  // every event file we have from vTools counts as known
  for (const [id] of byVtoolsId) if (!state.known.includes(id)) state.known.push(id)
  if (mode === 'full') state.historyImported = true
} catch (err) {
  failed = err.message
}

if (result.images) writeJson(MEDIA_META, mediaMeta)
const summary = failed
  ? `Failed: ${failed}`
  : `OK · ${result.found} events found for ${result.units} units · ${result.created} new · ${result.updated} updated${result.images ? ` · ${result.images} photos imported` : ''}${result.warnings.length ? ` · ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}: ${result.warnings.slice(0, 3).join(' | ')}` : ''}`
state.lastSync = new Date().toISOString()
state.lastResult = summary.slice(0, 900)
state.known.sort()
state.ignored.sort()
writeJson(STATE_FILE, state)
console.log(`[vtools ${mode}] ${summary}`)
if (failed) process.exit(1)
