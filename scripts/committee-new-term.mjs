#!/usr/bin/env node
/**
 * "Duplicate for a new term" — run by the Pages CMS button on a committee (see .github/workflows/cms-actions.yml).
 *
 * Copies the committee the button was pressed on into a new entry for another term, with all its people, so the
 * webmaster only changes what is different. The original is never changed and stays online as history at
 * /chapters/<chapter>/committee/<term>.
 *
 *  - By default the copy is hidden (“work in progress”): edit it, then untick “Hide from the website” and it
 *    replaces the old committee on the chapter page (the newest shown term wins).
 *  - With “Show it on the chapter page now” ticked, the copy is published straight away.
 *
 * Input: the Pages CMS payload (JSON) in $PAYLOAD — context.path is the committee file, inputs.term the new term,
 * inputs.publish (checkbox).
 */
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const ROOT = process.cwd()
const DIR = 'content/committees'
const fail = (msg) => {
  console.error(`::error::${msg}`)
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(process.env.PAYLOAD || '{}')
} catch {
  fail('The Pages CMS payload is not valid JSON.')
}
const file = String(payload?.context?.path || '').replace(/^\/+/, '')
if (!file.startsWith(`${DIR}/`) || !file.endsWith('.json') || file.includes('..')) fail(`Not a committee entry: "${file}"`)
const full = path.join(ROOT, file)
if (!fs.existsSync(full)) fail(`${file} does not exist on the branch.`)

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n')

/** 2025/26 → 2026/27 · 2025/2026 → 2026/2027 · 2025-26 → 2026-27 · 2025 → 2026 */
const nextTerm = (term) => {
  const m = String(term || '').match(/^(\d{4})([\/\-–])(\d{2}|\d{4})$/)
  if (m) {
    const a = Number(m[1]) + 1
    const b = m[3].length === 2 ? String((Number(m[3]) + 1) % 100).padStart(2, '0') : String(Number(m[3]) + 1)
    return `${a}${m[2]}${b}`
  }
  const y = String(term || '').match(/^(\d{4})$/)
  if (y) return String(Number(y[1]) + 1)
  return null
}

const old = read(full)
const term = String(payload?.inputs?.term || '').trim() || nextTerm(old.term)
if (!term) fail(`Can't work out the next term after "${old.term}". Type the new term in the box when you press the button.`)
if (term === old.term) fail(`This committee is already ${term}.`)

const chapters = fs.readdirSync(path.join(ROOT, 'content/chapters')).filter((f) => f.endsWith('.json')).map((f) => read(path.join(ROOT, 'content/chapters', f)))
const chapter = chapters.find((c) => String(c.id) === String(old.chapter))
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const newFile = `${DIR}/${slug(chapter?.slug || 'committee')}-${slug(term)}.json`
if (fs.existsSync(path.join(ROOT, newFile))) fail(`${newFile} already exists — open that committee in Pages CMS instead.`)

const publish = payload?.inputs?.publish === true || payload?.inputs?.publish === 'true'
const { updatedAt, hidden, ...rest } = old
const title = old.title && old.title.includes(old.term) ? old.title.replace(old.term, term) : `${chapter?.shortName ?? 'Committee'} · ${term}`
// "current" + newest term = the committee the chapter page shows; a hidden copy waits until it is unticked
write(path.join(ROOT, newFile), { ...rest, id: randomUUID(), title, term, current: true, ...(publish ? {} : { hidden: true }) })

const summary = `${chapter?.shortName ?? 'Committee'}: duplicated ${old.term} as ${term}${publish ? ' (published)' : ' (hidden until ready)'}`
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `summary=${summary}\nfile=${newFile}\n`)
console.log(summary)
console.log(`New entry: ${newFile} — open it in Pages CMS, change the people${publish ? '' : ', then untick “Hide from the website”'}.`)
