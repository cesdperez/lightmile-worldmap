# Lightmile World Map

An interactive world map for the **Lightmile Run Club** (Eindhoven).
[@lightmilerunclub](https://www.instagram.com/lightmilerunclub/)

## The idea

Wherever a Lightmile photo is taken, that place lights up on a world map. A photo
counts whenever the **Lightmile logo appears in it**: a sticker, someone wearing a
club t-shirt, a flag, anything. These are *not* running-stat photos, so there are no
distances or times. It is about presence: "we were here".

The game is to **conquer the whole world**:

- Drop at least one photo in a city → a **pin** appears there.
- Drop at least one photo in a country → the whole **country turns blue**.
- A **progress bar** tracks how much of the world is conquered.

Visitors browse the map, tap a city to open a **carousel** of every photo from that
place. Each photo shows a small **author tag** (e.g. `@cesar`) and an optional note.

## How it works (short version)

- Public, read-only website. Anyone can view it; nobody can submit anything.
- People send photos to the admin (Cesar) over WhatsApp.
- The admin adds them to the site by committing image files + a data entry, then pushing.
- The site is a **static** site hosted free on **Cloudflare Pages**.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run check      # type-check (svelte-check)
npm run build      # static site -> build/
npm run preview    # serve the production build locally
```

The map, pins, country fills, carousel, and progress bar are all **derived from**
`src/lib/data/cities.json` + `src/lib/data/photos.json`. Adding content is just editing
those two files and dropping images under `static/photos/<city-id>/` — see
[docs/DATA-MODEL.md](docs/DATA-MODEL.md). Data is validated with Zod at build time
(`src/lib/data/schema.ts`), so a bad city reference, country code, or coordinate **fails
the build** instead of shipping broken.

## Deploy (Cloudflare Pages)

The site is fully static (`@sveltejs/adapter-static`). To deploy on the free tier:

1. Push this repo to GitHub/GitLab.
2. In Cloudflare Pages, create a project from the repo with:
   - **Build command:** `npm run build`
   - **Build output directory:** `build`
   - (Framework preset: SvelteKit, or "None" with the settings above.)
3. Every push auto-builds and deploys to `<project>.pages.dev`. A custom domain can be
   added later via Cloudflare DNS (free).

## Docs

| Doc | What's in it |
| --- | --- |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Functional + non-functional requirements |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, map approach, hosting, constraints |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Data schema + the admin "add a photo" workflow |
| [docs/DESIGN.md](docs/DESIGN.md) | Brand, colors, typography, UX of the map |
| [docs/ROADMAP.md](docs/ROADMAP.md) | V1 scope and what comes later |

## Status

**V1 built.** SvelteKit static site with the vector world map, derived country fills,
city pins, photo carousel, and progress bar — seeded with sample data (Eindhoven,
Lisbon) and placeholder images, ready to deploy to Cloudflare Pages. Brand colors/fonts
are approximated from [docs/DESIGN.md](docs/DESIGN.md) pending the real logo assets.
