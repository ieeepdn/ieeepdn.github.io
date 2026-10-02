# IEEE Student Branch · University of Peradeniya — GitHub Pages edition

This is the **free-hosting version** of the branch website. It looks and works like the full version
(`ieee-uop-website`, Next.js + Payload CMS + SQLite), but it needs **no server**:

| | Full version (`ieee-uop-website`) | This version (`ieee-uop-website-pages`) |
| --- | --- | --- |
| Hosting | A server running Node.js (Docker) | **GitHub Pages — free** |
| Pages | Rendered by the server | Pre-built into plain HTML by `next build` (static export) |
| Content | SQLite database | JSON files in [`content/`](content) — versioned in Git |
| Editing | Webmaster console at `/admin` | **[Pages CMS](https://pagescms.org)** (free, sign in with GitHub) |
| vTools events | Synced by the server every 30 min | Synced by **GitHub Actions** every 30 min |
| Images | Resized on upload | Resized at build time (`scripts/media.mjs`) |
| Forms | Responses stored on the site | Responses go to **Formspree** (email + CSV) or a Google Form |
| Analytics | Built-in, per chapter | Google Analytics 4 (optional) |

Same design, same pages, same section library (22 sections), same light/dark themes, same content
(8 chapters & committees, 23 stories, 218 vTools events, 3 flagship programmes, 9 albums, 503 photos).

> The full version is untouched. If the university later offers a server, switch back to it — the content
> can be copied across.

---

## 1. Put it on GitHub (once — about 15 minutes)

1. **Create a GitHub organisation** for the branch (e.g. `ieee-sb-uop`) — not a personal account, so the site
   survives committee handovers. Add the branch webmaster and the counsellor as owners.
2. Create a **public** repository in it, e.g. `website`, and push this folder:
   ```bash
   cd ieee-uop-website-pages
   git init -b main
   git add .
   git commit -m "IEEE SB UoP website"
   git remote add origin https://github.com/ieee-sb-uop/website.git
   git push -u origin main
   ```
   (Public, because GitHub Actions minutes are unlimited for public repositories. Nothing secret is stored here.)
3. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
4. **Settings → Actions → General → Workflow permissions → Read and write permissions** (the vTools sync commits
   new events).
5. Open the **Actions** tab — the *Build & deploy* workflow runs on the first push. After ~3 minutes the site is at
   `https://ieee-sb-uop.github.io/website/`.

### Use the university address (ieee.soc.pdn.ac.lk)

Ask the university IT team to add **one DNS record**:

```
ieee.soc.pdn.ac.lk.   CNAME   ieee-sb-uop.github.io.
```

Then in **Settings → Pages → Custom domain** enter `ieee.soc.pdn.ac.lk`, save, wait for the DNS check and tick
**Enforce HTTPS** (GitHub issues the certificate for free). Also verify the domain for the organisation
(**Organisation settings → Pages → Add a domain**) so nobody else can ever claim it. Run the workflow once more
(Actions → Build & deploy → Run workflow) so links and the sitemap use the new address.

> Tip: naming the repository `ieee-sb-uop.github.io` puts the site at `https://ieee-sb-uop.github.io/` even
> before the custom domain is ready.

## 2. Editing with Pages CMS (every webmaster)

1. Go to **<https://app.pagescms.org>**, sign in with GitHub and install the Pages CMS GitHub app on the branch
   organisation (only on this repository).
2. Open the repository. The sidebar shows everything the old console had: **Site settings, Chapters, Committees,
   News & stories, Events, Flagship programmes, Photo albums, Pages, Forms, Files, Image descriptions**.
3. Add chapter webmasters: either as members of the GitHub organisation, or — for people without a GitHub
   account — invite them by email as **Collaborators** in Pages CMS (they can edit content and media, not settings).
4. Every **Save** is a Git commit. GitHub Actions rebuilds the site and it is live **2–3 minutes later**.

What changed for webmasters compared with the console:

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

`scripts/vtools-sync.mjs` is the old server sync, rewritten to write JSON files:

- Every 30 minutes GitHub Actions reads each unit's **Upcoming** and **Recent** lists from vTools (by SPOID),
  fetches new or changed events, copies posters/photos into `public/media` and commits the changes. The first run
  (and *Run workflow → full history*) imports every event ever hosted.
- Unit SPOIDs live in **Chapters → <chapter> → IEEE vTools** (branch: **Site settings → vTools**). Same matching
  rules as before (SPOID → host name + chapter keywords → "Peradeniy" → branch).
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
  workflow republishes at least every 6 hours, and after every change.
- If you add a field: add it to `.pages.yml` (and to `src/content/schema.json` if it is an image, file or
  reference) and use it in the components.
