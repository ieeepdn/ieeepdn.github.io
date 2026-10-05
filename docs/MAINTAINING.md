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
2. Open the repository. The sidebar shows **Site settings, Chapters, Committees,
   News & stories, Events, Flagship programmes, Photo albums, Pages, Forms, Files, Image descriptions**.
3. Add chapter webmasters: either as repository collaborators (with their own GitHub accounts), or — for people
   without a GitHub account — invite them by email as **Collaborators** in Pages CMS (they can edit content and media, not settings).
4. Every **Save** is a Git commit. GitHub Actions rebuilds the site and it is live **2–3 minutes later**.

Things to know when editing:

- **Everyone with access can edit every chapter** (Pages CMS has no per-chapter permissions). Agree that each
  webmaster only edits their own chapter; every change is recorded in the repository history with the editor's
  name and can be undone (GitHub → the file → History → revert).
- **No live preview.** Set a post or page to *Draft (hidden)* while you work on it, then switch it to *Published*.
- **Deleting** an entry removes its file (restore it from the repository history if needed). To take a vTools
  event off the site, tick **Hidden** rather than deleting it.
- **Images:** upload in any image field. Add alt text (what the image shows) in **Image descriptions**.
- **New sub-pages start empty** — add sections with *Add an entry* in the Sections list. Pick the chapter and
  (optionally) a parent page; the address becomes `/chapters/<chapter>/<parent>/<slug>`, or `/<short address>`
  when a short address is set.
- **Forms:** create a free form at [formspree.io](https://formspree.io) with the chapter's email and paste its
  address into the form's *Where responses go* field. Responses arrive by email and can be exported as CSV
  there. Or paste a Google Form link into *…or link to a Google Form* instead.
- **Committee handover:** add a new committee entry for the new term (copy the teams from last year's), tick
  **On the website (current)** and untick it on the old one. Old committees stay at
  `/chapters/<chapter>/committee`.

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
| `content/` | All content (JSON). `settings.json`, `media.json` (alt text), `vtools-state.json`, one folder per collection |
| `public/media/` | Uploaded images (originals). `public/files/` — PDFs for the Downloads section |
| `.pages.yml` | Pages CMS editor configuration (collections, fields, the section library) |
| `src/lib/content.ts` | Reads `content/` and turns image paths and references back into full objects |
| `src/lib/data.ts` | The data functions every page uses (same names as the Payload version) |
| `src/content/schema.json` | Which fields are images, files or references (generated from the old Payload config) |
| `scripts/media.mjs` | Makes the 480/960/1920 px WebP copies and `src/content/media-index.json` (cached in CI) |
| `scripts/vtools-sync.mjs` | IEEE vTools sync |
| `.github/workflows/site.yml` | Sync → commit → build → deploy |

Notes:

- References between entries store the target's `id` (Pages CMS fills it in from a list).
- Times are Sri Lanka local time (`2026-09-28T10:00`), dates are `2026-09-28`.
- When the site lives in a sub-folder (`<org>.github.io/<repo>/`), the workflow sets `NEXT_PUBLIC_BASE_PATH`
  automatically; with a custom domain it is empty.
- Upcoming/past events, timed spotlights and form open/close times are decided when the site is built — the
  workflow republishes once a day, and after every change.
- If you add a field: add it to `.pages.yml` (and to `src/content/schema.json` if it is an image, file or
  reference) and use it in the components.
