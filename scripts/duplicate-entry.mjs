#!/usr/bin/env node
/**
 * "Duplicate" — run by the Pages CMS button on a chapter sub-page, a news story or a form
 * (see .github/workflows/cms-actions.yml).
 *
 * Saves a copy of the entry under a new title (default: “<title> (copy)”) so last year's flagship page, a recap or a
 * registration form can be reused. The copy gets its own id and address; pages and stories start as drafts so
 * nothing goes live before it has been edited.
 *
 * Input: the Pages CMS payload (JSON) in $PAYLOAD — context.path is the entry file, inputs.title the new title.
 */
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const fail = (msg) => {
  console.error(`::error::${msg}`)
  process.exit(1)
}
const ALLOWED = ['content/pages/', 'content/posts/', 'content/forms/']
const payload = JSON.parse(process.env.PAYLOAD || '{}')
const file = String(payload?.context?.path || '').replace(/^\/+/, '')
if (!ALLOWED.some((d) => file.startsWith(d)) || !file.endsWith('.json') || file.includes('..')) fail(`This entry can't be duplicated: "${file}"`)
const full = path.join(process.cwd(), file)
if (!fs.existsSync(full)) fail(`${file} does not exist yet — save it once first.`)

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const doc = JSON.parse(fs.readFileSync(full, 'utf8'))
const title = String(payload?.inputs?.title || '').trim() || `${doc.title || 'Untitled'} (copy)`
const dir = path.dirname(full)
let name = slugify(title) || 'copy'
while (fs.existsSync(path.join(dir, `${name}.json`))) name += '-2'

const { updatedAt, slug, shortPath, ...rest } = doc
const copy = { ...rest, id: randomUUID(), title, slug: name }
if ('_status' in doc || file.startsWith('content/pages/') || file.startsWith('content/posts/')) copy._status = 'draft'
if (file.startsWith('content/posts/')) delete copy.featured
fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(copy, null, 2) + '\n')

const summary = `Duplicated “${doc.title}” as “${title}”${copy._status === 'draft' ? ' (draft)' : ''}`
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `summary=${summary}\n`)
console.log(summary)
