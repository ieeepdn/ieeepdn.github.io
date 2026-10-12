# Maintainer guide

How the site is hosted, edited and kept up to date. For an overview of the project, see the [README](../README.md).

The site is a static Next.js build published on **GitHub Pages**. Content lives as JSON in [`content/`](../content) and is
edited with **[Pages CMS](https://pagescms.org)**; events are synced from **IEEE vTools** by GitHub Actions once a day.

---

## 1. Hosting setup

The repository [`ieeepdn/ieeepdn.github.io`](https://github.com/ieeepdn/ieeepdn.github.io) is owned by the
branch's GitHub account (`ieeepdn`), and the site is served at **https://ieeepdn.github.io**. Webmasters work
from their own GitHub accounts, added as collaborators.

One-time repository settings (signed in as `ieeepdn`):

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Actions → General → Workflow permissions → Read and write permissions** (the vTools sync commits
   new events).
3. **Settings → Collaborators → Add people** for each webmaster.

The *Build & deploy* workflow ([`.github/workflows/site.yml`](../.github/workflows/site.yml)) publishes the site on
every push to `main`. The repository is public so GitHub Actions minutes are unlimited; nothing secret is stored here.

### Using the university address (ieee.soc.pdn.ac.lk)

Ask the university IT team to add **one DNS record**:

```
ieee.soc.pdn.ac.lk.   CNAME   ieeepdn.github.io.
```

Then in **Settings → Pages → Custom domain** enter `ieee.soc.pdn.ac.lk`, save, wait for the DNS check and tick
**Enforce HTTPS** (GitHub issues the certificate for free). Also verify the domain under the `ieeepdn` account's
**Settings → Pages → Add a domain** so nobody else can claim it. Run the workflow once more
(Actions → Build & deploy → Run workflow) so links and the sitemap use the new address.

## 2. Editing with Pages CMS (every webmaster)

1. Go to **<https://app.pagescms.org>** and sign in with GitHub. (The Pages CMS GitHub app is installed on this
   repository by the `ieeepdn` account, once.)
2. Open the repository. The sidebar is grouped by what you want to change (table below).
3. Add chapter webmasters: either as repository collaborators (with their own GitHub accounts), or — for people
   without a GitHub account — invite them by email as **Collaborators** in Pages CMS (they can edit content and media, not settings).
4. Every **Save** is a Git commit. GitHub Actions rebuilds the site and it is live **2–3 minutes later**.

### Where to change what

| I want to change… | Open in Pages CMS |
| --- | --- |
| The home page header, announcement bar, which home sections show and in what order, their headings | **Website → Home page** |
| The history timeline (home page and About page) | **Website → Home page → History timeline** |
| A big event promoted on the home page, menu and top bar | **Website → Spotlight (big event)** |
| Colours, fonts, the style of page headers, light/dark default | **Website → Theme & colours** |
| Branch email, address, social links, Google Analytics, vTools | **Website → Contact, links & vTools** |
| A chapter's header photo, logo, colour, about text, big numbers | **Chapters → Chapter pages** → the chapter (top fields) |
| The sections of a chapter page (events, stories, photos, team, FAQ…) | **Chapters → Chapter pages** → the chapter → **Page sections** |
| A committee (or start next year’s) | **Chapters → Committees** (“Duplicate for a new term”) |
| A flagship event, competition, conference or project page | **Chapters → Chapter sub-pages** |
| Pera Xtreme, Predicta, MentorSpark cards and pages | **Programmes, news & events → Flagship programmes** |
| A story, a cover photo on a vTools event, hiding an event | **Programmes, news & events → News & stories / Events** |
| Photo albums, forms, PDFs, alt text | **Chapters → Photo albums**, **Forms, files & images** |

### Buttons that do the work for you

- **Committees → open last year’s committee → “Duplicate for a new term”** (top right): saves a copy with all the
  people for the next term (e.g. 2026/27 → 2027/28). The copy starts **hidden**, so you can take your time: after a
  minute refresh Committees, open the copy, change the people, then untick **Hide from the website** — it replaces
  the old committee on the chapter page. Last year’s committee is never changed and stays online as history at
  `/chapters/<chapter>/committee`. **Never overwrite last year’s committee** — the history would be lost.
- **Chapter sub-pages, News & stories, Forms → “Duplicate”**: saves a copy as a draft, e.g. last year’s flagship
  page for the new edition, or a registration form for the next event.
- **Chapter sub-pages → create a page, Save, then “Fill with a starter layout”**: adds ready-made sections for a
  flagship event / competition, conference, project or info page, with [bracketed] placeholder text to replace.
  Refresh the page after a minute to see them.

The buttons run a small GitHub Actions job (*Pages CMS buttons*), save the change and republish the site.

### Photo albums

- **Chapters → Photo albums → + Add**: give it a title, chapter and date, then **drag a whole folder’s worth of
  photos** into *Photos* (or click to pick several). Drag photos to reorder them.
- **Cover photo** (optional) leads the album; otherwise the first photo does. **Pin** keeps an album at the top of
  the Gallery, **Hide** takes it off the site, and **Keep out of the mosaics** keeps it off the home page and
  chapter photo tiles (it still shows in the Gallery).
- Big phone photos are fine: each publish shrinks any photo over 2400 px or 1.5 MB, and the site makes small
  WebP copies for visitors.
- The Gallery page never crops photos. The photo tiles on the home and chapter pages show posters and very wide
  or tall photos whole instead of cutting them.

### Things to know when editing

- **Page sections** are folded: each row shows the section number and its heading, and a badge with the section
  type. Click a row to open it, drag ⋮⋮ to reorder, **+ Add** to add a section. “Hide this section” takes a
  section off the page without deleting it. Empty headings use the built-in wording.
- **Everyone with access can edit every chapter** (Pages CMS has no per-chapter permissions). Agree that each
  webmaster only edits their own chapter; every change is recorded in the repository history with the editor's
  name and can be undone (GitHub → the file → History → revert).
- **No live preview.** Set a post or page to *Draft (hidden)* while you work on it, then switch it to *Published*.
- **Deleting** an entry removes its file (restore it from the repository history if needed). To take a vTools
  event off the site, tick **Hide from the website** rather than deleting it.
- **Images:** upload in any image field. Add alt text (what the image shows) in **Image descriptions**.
- **Page addresses:** leave “Page address” empty and it is made from the title. A sub-page lives at
  `/chapters/<chapter>/<parent>/<address>`, or at `/<short address>` when a short address is set.
- **Colours** are colour codes like `#00629B`. Clear a colour in Theme & colours to go back to the original.
- **Forms:** create a free form at [formspree.io](https://formspree.io) with the chapter's email and paste its
  address into the form's *Where responses go* field. Responses arrive by email and can be exported as CSV
  there. Or paste a Google Form link into *…or link to a Google Form* instead.

## 3. IEEE vTools events

`scripts/vtools-sync.mjs` keeps the events in `content/events/` up to date:

- Once a day (05:47 Sri Lanka time) GitHub Actions reads each unit's **Upcoming** and **Recent** lists from vTools (by SPOID),
  fetches new or changed events, copies posters/photos into `public/media` and commits the changes. The first run
  (and *Run workflow → full history*) imports every event ever hosted.
- Need an event on the site sooner? **Actions → Build & deploy → Run workflow** syncs and republishes right away.
- Unit SPOIDs live in **Chapters → <chapter> → IEEE vTools** (branch: **Site settings → vTools**). Matching
  rules, in order: host or co-host SPOID → host name + chapter keywords → hosts named "…Peradeniy…" go to the branch.
- vTools owns the title, dates, description, venue and links (edit them in vTools). Webmasters own the cover,
  photos, category, *Hidden* and *Featured*.
- The result of the last sync is in `content/vtools-state.json` and in the workflow log.

Run it yourself: `npm run vtools:sync` (add `-- --full` for the whole history).

## 4. Working on the code

Requirements: Node.js 20.9+ (22 LTS recommended).

```bash
npm install
npm run dev          # http://localhost:3000 — content is read from content/ on every request
npm run build        # writes the finished site to out/
npm run serve        # preview out/ like GitHub Pages does
```

| Where | What |
| --- | --- |
| `content/` | All content (JSON): `home.json`, `spotlight.json`, `theme.json`, `settings.json`, `media.json` (alt text), `vtools-state.json`, one folder per collection |
| `public/media/` | Uploaded images (originals). `public/files/` — PDFs for the Downloads section |
| `.pages.yml` | Pages CMS editor configuration (collections, fields, the section library) |
| `src/lib/content.ts` | Reads `content/` and turns image paths and references back into full objects |
| `src/lib/data.ts` | The data functions every page uses (same names as the Payload version) |
| `src/lib/site.ts` | Home page sections and the theme (colours, fonts, header styles) from `home.json` / `theme.json` |
| `src/content/schema.json` | Which fields are images, files or references (generated from the old Payload config) |
| `scripts/media.mjs` | Makes the 480/960/1920 px WebP copies and `src/content/media-index.json` (cached in CI) |
| `scripts/vtools-sync.mjs` | IEEE vTools sync |
| `.github/workflows/site.yml` | Sync → commit → build → deploy |
| `.github/workflows/cms-actions.yml` | The Pages CMS buttons: `scripts/committee-new-term.mjs`, `scripts/duplicate-entry.mjs`, `scripts/page-template.mjs` (layouts in `scripts/page-templates.mjs`) |
| `scripts/shrink-uploads.mjs` | Resizes uploaded photos over 2400 px / 1.5 MB before each build |

Notes:

- References between entries store the target's `id` (Pages CMS fills it in from a list).
- Times are Sri Lanka local time (`2026-09-28T10:00`), dates are `2026-09-28`.
- When the site lives in a sub-folder (`<org>.github.io/<repo>/`), the workflow sets `NEXT_PUBLIC_BASE_PATH`
  automatically; with a custom domain it is empty.
- Upcoming/past events, timed spotlights and form open/close times are decided when the site is built — the
  workflow republishes once a day, and after every change.
- If you add a field: add it to `.pages.yml` (and to `src/content/schema.json` if it is an image, file or
  reference) and use it in the components.
