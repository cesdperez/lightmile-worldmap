# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A public, read-only static site for the Lightmile Run Club: wherever a club photo is taken, that place lights up on a world map. There is no backend and no submission flow. Content is added by the admin editing two JSON files + committing images, then pushing. Cloudflare Pages auto-builds and deploys.

## Commands

```bash
npm run dev        # local dev server (vite)
npm run check      # type-check: svelte-kit sync && svelte-check
npm run build      # static site -> build/  (runs prerender; bad data fails here)
npm run preview    # serve the production build locally
```

There is no test runner or linter configured. `npm run check` (svelte-check) is the type/correctness gate.

## Architecture: everything is derived from two JSON files

The entire map (country fills, pins, carousels, progress bar, counters) is computed from `src/lib/data/cities.json` + `src/lib/data/photos.json`. Nothing about "conquered" state is hand-set or stored.

Data flow:
1. `src/routes/+page.ts` (`load`, runs at **prerender** time since `+layout.ts` sets `prerender = true`) imports both JSON files and calls `parseData` from `src/lib/data/schema.ts`. Invalid or inconsistent data **throws here and fails `npm run build`** — this is the intentional guardrail, not a bug.
2. `src/lib/state/derive.ts#buildMapData` turns cities + photos into the view model: a city is conquered iff it has ≥1 photo (cities with no photos are dropped, no pin); a country is conquered iff ≥1 of its cities is. `computeProgress` = conquered countries / total countries.
3. `src/routes/+page.svelte` wires the derived data into `WorldMap`, `ProgressBar`, and `Carousel`.

### Country code join (the non-obvious part)

Data files use friendly ISO 3166-1 **alpha-2** codes (`"NL"`). The `world-atlas` TopoJSON keys countries by ISO **numeric** id (`"528"`). `src/lib/data/countryCodes.ts` holds the `alpha2 -> numeric` lookup that bridges them; `derive.ts` converts each city's country to numeric so it joins to `WorldMap`'s country paths. When adding a country, the alpha-2 code must exist in that table (`schema.ts` validates this via `isValidAlpha2`).

### Map rendering

`src/lib/map/world.ts` loads the TopoJSON, converts to GeoJSON features, and exposes `geoNaturalEarth1` projection fitted to the viewport plus `totalCountries`. `src/lib/map/WorldMap.svelte` renders SVG paths + pins and handles d3-zoom/pan; pin/border sizes are divided by the zoom factor `k` to stay visually constant. Initial view is zoomed onto Europe (Eindhoven).

## Adding content (the primary task)

1. Drop compressed images under `static/photos/<city-id>/`.
2. If the city is new, add one entry to `src/lib/data/cities.json` (`id`, `name`, alpha-2 `country`, `lat`, `lng`).
3. Add one entry per photo to `src/lib/data/photos.json` (`city` = city id, `src` path under static/, `author`, optional `note`/`date`).
4. `npm run build` to confirm validation passes, then commit + push.

`schema.ts` enforces: valid alpha-2 country code, coordinate ranges, no duplicate city ids, and that every photo references an existing city. (Note: the docs mention validating that the image `src` file exists, but `schema.ts` does not currently check this.)

## Conventions

- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) — not the older stores/`export let` style.
- Tailwind CSS v4 (via `@tailwindcss/vite`). Brand colors are CSS custom properties in `src/app.css` (`--color-ink`, `--color-paper`, `--color-blue`, etc.); reference them as `var(--color-blue)` in SVG and `bg-paper`/`text-ink` utilities elsewhere. Colors/fonts are approximations pending real logo assets.
- Static adapter is in `strict` mode — every route must be prerenderable.

## Docs

`docs/` holds the source-of-truth specs: `DATA-MODEL.md` (schema + admin workflow), `ARCHITECTURE.md`, `REQUIREMENTS.md`, `DESIGN.md` (brand/colors/UX), `ROADMAP.md` (V1 scope vs later).
