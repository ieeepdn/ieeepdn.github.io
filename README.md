# IEEE Student Branch · University of Peradeniya

[![Build & deploy](https://github.com/ieeepdn/ieeepdn.github.io/actions/workflows/site.yml/badge.svg)](https://github.com/ieeepdn/ieeepdn.github.io/actions/workflows/site.yml)

The website of **Sri Lanka's first IEEE Student Branch**, established on 19 July 2001 at the Faculty of Engineering,
University of Peradeniya — home to seven society chapters and affinity groups: **WIE, CS, ComSoc, MTT-S, PES, RAS
and IAS**.

**🌐 Visit the site: [ieeepdn.github.io](https://ieeepdn.github.io)**

---

## What's on the site

- **Chapters** — a page for every chapter and affinity group, with its story, committee, events, news and photos
- **Events** — every branch and chapter event, pulled automatically from [IEEE vTools](https://events.vtools.ieee.org),
  with a subscribable calendar (`/calendar.ics`)
- **Flagship programmes** — Pera Xtreme (IEEEXtreme), Predicta and MentorSpark
- **News & stories** — recaps and announcements from each chapter
- **Gallery** — photo albums from workshops, competitions, field visits and outreach
- **Committees** — the current committee of every chapter, with past terms kept as the branch's history
- Light and dark themes, fully responsive, no cookies

## How it works

The site is a static website — there is no server to run or pay for.

| | |
| --- | --- |
| **Framework** | [Next.js](https://nextjs.org) (React, static export) with [Tailwind CSS](https://tailwindcss.com) |
| **Content** | JSON files in [`content/`](content), edited through [Pages CMS](https://pagescms.org) |
| **Events** | Synced from IEEE vTools once a day by [GitHub Actions](.github/workflows/site.yml) |
| **Hosting** | [GitHub Pages](https://pages.github.com) |

Every change to `main` — a webmaster saving in Pages CMS, or a new event arriving from vTools — rebuilds the site
and publishes it within a few minutes.

## For chapter webmasters

You don't need to touch any code. Sign in at **[app.pagescms.org](https://app.pagescms.org)** with your GitHub
account (ask the branch webmaster to add you as a collaborator) and edit your chapter's page, news, albums and
committee there. Events come from vTools automatically — publish them in vTools as usual.

The [maintainer guide](docs/MAINTAINING.md) explains editing, forms, committee handovers and the vTools sync in
detail.

## Running it locally

Requires [Node.js](https://nodejs.org) 20.9 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

To preview the exact files GitHub Pages will serve:

```bash
npm run build      # builds the static site into out/
npm run serve      # serves out/ on http://localhost:3000
```

## Project structure

```
content/            site content (chapters, committees, posts, events, albums, settings…)
public/media/       images (uploaded through Pages CMS or copied from vTools)
src/app/            pages and routes
src/components/     page sections and UI components
src/lib/            data loading, formatting and helpers
scripts/            image resizing and the IEEE vTools sync
.pages.yml          Pages CMS editor configuration
```

## Contributing

Found a mistake or have an idea? [Open an issue](https://github.com/ieeepdn/ieeepdn.github.io/issues). Members who
want to help with the code are welcome to open a pull request — please test with `npm run build` first.

## Contact

IEEE Student Branch, Department of Electrical & Electronic Engineering, Faculty of Engineering,
University of Peradeniya, Peradeniya 20400, Sri Lanka
✉️ [ieeepdn@gmail.com](mailto:ieeepdn@gmail.com) · ▶️ [YouTube](https://www.youtube.com/@ieeeperadeniya8445)

## License

The source code is released under the [MIT License](LICENSE). Text, photos and logos in `content/` and `public/`
belong to the IEEE Student Branch, University of Peradeniya, and their respective owners, and may not be reused
without permission. IEEE and the IEEE logo are trademarks of the Institute of Electrical and Electronics Engineers.
