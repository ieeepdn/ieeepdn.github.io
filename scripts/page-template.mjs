#!/usr/bin/env node
/**
 * "Fill with a starter layout" — run by the Pages CMS button on a chapter sub-page (see .github/workflows/cms-actions.yml).
 * Puts the starter sections of a competition, conference, project or info page into a page that has no sections yet.
 * Placeholder text is in [square brackets], so it is obvious what still needs writing.
 *
 * Input: the Pages CMS payload (JSON) in $PAYLOAD — context.path is the page file, inputs.template the layout.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pageTemplates } from './page-templates.mjs'

const fail = (msg) => {
  console.error(`::error::${msg}`)
  process.exit(1)
}
const payload = JSON.parse(process.env.PAYLOAD || '{}')
const file = String(payload?.context?.path || '').replace(/^\/+/, '')
if (!file.startsWith('content/pages/') || !file.endsWith('.json') || file.includes('..')) fail(`Not a page entry: "${file}"`)
const full = path.join(process.cwd(), file)
if (!fs.existsSync(full)) fail(`${file} does not exist yet — save the new page once, then press the button.`)

const template = String(payload?.inputs?.template || 'competition')
if (!pageTemplates[template]) fail(`Unknown layout "${template}".`)
const page = JSON.parse(fs.readFileSync(full, 'utf8'))
const existing = Array.isArray(page.layout) ? page.layout.length : 0
if (existing && !payload?.inputs?.append) fail(`“${page.title}” already has ${existing} section(s). Tick “Add after the existing sections” to keep them and add the starter sections below.`)

const sections = pageTemplates[template](page.title || 'Untitled')
page.layout = [...(page.layout ?? []), ...sections]
if (template !== 'blank') page.template = template
fs.writeFileSync(full, JSON.stringify(page, null, 2) + '\n')
const summary = `Added the ${template} starter layout (${sections.length} sections) to “${page.title}”`
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `summary=${summary}\n`)
console.log(summary)
