import 'server-only'
import { cache } from 'react'
import type { Milestone } from '@/components/sections/Timeline'
import { milestones as defaultMilestones } from './milestones'
import { rawFile, toMedia } from './content'

/**
 * Home page and theme settings, edited in Pages CMS as "Home page" (content/home.json) and
 * "Theme & colours" (content/theme.json). Every value is optional: anything left empty falls back to
 * the original design, so an empty file still gives the site exactly as it was built.
 */

// ---------------------------------------------------------------- home page

/** The sections of the home page, in their default order. The names are what editors pick in Pages CMS. */
export const HOME_SECTIONS = [
  'Chapter ticker',
  'Spotlight banner',
  'Why we exist',
  'Chapters',
  'Flagship programmes',
  'Events',
  'History timeline',
  'News & stories',
  'Photo moments',
  'Video',
  'Call to action',
] as const
export type HomeSectionName = (typeof HOME_SECTIONS)[number]

export type HomeSection = {
  section: HomeSectionName
  show: boolean
  eyebrow?: string
  heading?: string
  text?: string
}

export type HomeHero = {
  kicker?: string
  title?: string
  accent?: string
  text?: string
  /** 'Animated signal field' (default) | 'Photo' | 'Plain gradient' */
  background: 'signal' | 'photo' | 'plain'
  image: string | null
}

export type HomeConfig = {
  hero: HomeHero
  sections: HomeSection[]
  statement?: string
  timeline: Milestone[]
  cta: { title?: string; text?: string }
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)

const BACKGROUNDS: Record<string, HomeHero['background']> = {
  'Animated signal field': 'signal',
  Photo: 'photo',
  'Plain gradient': 'plain',
}

export const getHome = cache((): HomeConfig => {
  const h = rawFile('home.json')
  const hero = h.hero ?? {}
  const image = toMedia(hero.image)
  // sections: the editor's list, in their order; any section missing from the list keeps its default spot (shown)
  const listed: HomeSection[] = (Array.isArray(h.sections) ? h.sections : [])
    .filter((s: any) => HOME_SECTIONS.includes(s?.section))
    .map((s: any) => ({ section: s.section, show: s.show !== false, eyebrow: str(s.eyebrow), heading: str(s.heading), text: str(s.text) }))
  const seen = new Set(listed.map((s) => s.section))
  const sections = listed.length
    ? [...listed, ...HOME_SECTIONS.filter((n) => !seen.has(n)).map((section) => ({ section, show: true }))]
    : HOME_SECTIONS.map((section) => ({ section, show: true }))
  const timeline: Milestone[] = Array.isArray(h.timeline) && h.timeline.length
    ? h.timeline.filter((m: any) => m?.year && m?.title).map((m: any) => ({ year: String(m.year), title: String(m.title), body: String(m.body ?? '') }))
    : defaultMilestones
  return {
    hero: {
      kicker: str(hero.kicker),
      title: str(hero.title),
      accent: str(hero.accent),
      text: str(hero.text),
      background: BACKGROUNDS[hero.background] ?? 'signal',
      image: image ? (image.sizes?.hero?.url ?? image.url ?? null) : null,
    },
    sections,
    statement: str(h.statement),
    timeline,
    cta: { title: str(h.cta?.title), text: str(h.cta?.text) },
  }
})

/** Fields of home.json that used to live in Site settings — merged back so older code keeps working. */
export const homeSettings = (h: Record<string, any>) => ({
  ...(h.hero?.kicker ? { heroKicker: h.hero.kicker } : {}),
  ...(h.hero?.title ? { heroTitle: h.hero.title } : {}),
  ...(h.hero?.accent ? { heroAccent: h.hero.accent } : {}),
  ...(h.hero?.text ? { heroText: h.hero.text } : {}),
  ...(h.announcement ? { announcement: h.announcement } : {}),
  ...(h.stats ? { stats: h.stats } : {}),
  ...(h.vision ? { vision: h.vision } : {}),
  ...(h.mission ? { mission: h.mission } : {}),
  ...(h.showreel ? { showreel: h.showreel } : {}),
})

// ---------------------------------------------------------------- theme

export const DISPLAY_FONTS: Record<string, string> = {
  'Bricolage Grotesque': "'Bricolage Grotesque Variable', 'Bricolage Grotesque'",
  'Space Grotesk': "'Space Grotesk Variable'",
  Outfit: "'Outfit Variable'",
  'Plus Jakarta Sans': "'Plus Jakarta Sans Variable'",
  'Fraunces (serif)': "'Fraunces Variable'",
}
export const BODY_FONTS: Record<string, string> = {
  'IBM Plex Sans': "'IBM Plex Sans'",
  'DM Sans': "'DM Sans Variable'",
  'Source Sans 3': "'Source Sans 3 Variable'",
  'Plus Jakarta Sans': "'Plus Jakarta Sans Variable'",
}

export type Theme = {
  css: string
  pageHero: 'glow' | 'photo' | 'solid'
  defaultMode: 'system' | 'light' | 'dark'
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
const hex = (v: unknown): string | null => {
  if (typeof v !== 'string' || !HEX.test(v.trim())) return null
  let h = v.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return `#${h.toLowerCase()}`
}
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (c: number[]) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`
/** Mix a colour towards black (amount < 0) or white (amount > 0). */
const shade = (h: string, amount: number) => toHex(rgb(h).map((v) => (amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))

const PAGE_HERO: Record<string, Theme['pageHero']> = {
  'Photo with colour glow': 'glow',
  'Brighter photo': 'photo',
  'Solid colour': 'solid',
}
const MODES: Record<string, Theme['defaultMode']> = { 'Follow the visitor’s device': 'system', Light: 'light', Dark: 'dark' }

export const getTheme = cache((): Theme => {
  const t = rawFile('theme.json')
  const c = t.colours ?? {}
  // only colours that differ from the original design are written out (the originals are hand-tuned shades)
  const changed = (v: unknown, original: string) => {
    const h = hex(v)
    return h && h !== original ? h : null
  }
  const vars: string[] = []
  const dark: string[] = []
  const primary = changed(c.primary, '#00629b')
  if (primary) {
    vars.push(`--color-ieee:${primary}`, `--color-ieee-600:${shade(primary, -0.2)}`, `--color-ieee-700:${shade(primary, -0.37)}`, `--color-brand:${primary}`)
  }
  const accent = changed(c.accent, '#43c6f4')
  if (accent) vars.push(`--color-cyan:${accent}`, `--color-cyan-soft:${shade(accent, 0.45)}`)
  // these rules sit outside the stylesheet's layers, so dark mode needs its own values again
  if (primary || accent) dark.push(`--color-brand:${accent ? shade(accent, 0.15) : '#63c7f2'}`)
  const highlight = changed(c.highlight, '#ffb547')
  if (highlight) {
    vars.push(`--color-signal:${highlight}`, `--color-signal-ink:${shade(highlight, -0.55)}`)
    dark.push(`--color-signal-ink:${shade(highlight, 0.45)}`)
  }
  const night = changed(c.dark, '#030a13')
  if (night) vars.push(`--color-night:${night}`, `--color-night-2:${shade(night, 0.05)}`, `--color-night-3:${shade(night, 0.11)}`)
  const display = t.fonts?.display !== 'Bricolage Grotesque' && DISPLAY_FONTS[t.fonts?.display]
  if (display) vars.push(`--font-display:${display}, ui-sans-serif, system-ui, sans-serif`)
  const body = t.fonts?.body !== 'IBM Plex Sans' && BODY_FONTS[t.fonts?.body]
  if (body) vars.push(`--font-sans:${body}, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`)
  const css = [vars.length ? `:root{${vars.join(';')}}` : '', dark.length ? `:root[data-theme='dark'],[data-theme='dark']{${dark.join(';')}}` : ''].join('')
  return {
    css,
    pageHero: PAGE_HERO[t.heroes?.pageHero] ?? 'glow',
    defaultMode: MODES[t.defaultMode] ?? 'system',
  }
})
