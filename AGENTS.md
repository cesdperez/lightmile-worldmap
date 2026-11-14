# AGENTS.md

## Commands

```bash
pnpm dev        # local dev server (vite)
pnpm check      # type-check: svelte-kit sync && svelte-check
pnpm build      # static site -> build/  (runs prerender; bad data fails here)
pnpm test:run   # run unit tests (Vitest)
pnpm lint       # run ESLint and Prettier checks
pnpm format     # format files with Prettier
pnpm scan       # scan repository for secrets and vulnerable dependencies
pnpm knip       # check for unused files, dependencies, and exports
pnpm preview    # serve the production build locally
pnpm ports      # this checkout's dev and preview URLs
bash scripts/stop-servers.sh  # stop this checkout's servers
```

WORLDMAP_PORT overrides the ports. The stop script finds servers by port, so pass the same WORLDMAP_PORT used to start them. Orca runs it when it removes a worktree.

## Testing

Vitest runs unit tests in `src/**/*.test.ts` and `scripts/**/*.test.ts` with jsdom. ESLint and Prettier run via `pnpm lint`. `pnpm check` (svelte-check) is the type gate, and `pnpm build` fails on invalid data during prerender.

## Code style

- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) rather than the older stores/`export let` style.
- Tailwind CSS v4 (via `@tailwindcss/vite`). Brand colors are CSS custom properties in `src/app.css` (`--color-ink`, `--color-paper`, `--color-blue`, etc.); reference them as `var(--color-blue)` in SVG and `bg-paper`/`text-ink` utilities elsewhere. Colors/fonts are approximations pending real logo assets.
- Static adapter is in `strict` mode, so every route must be prerenderable.
- `lightmile.nl` is canonical for club information. `static/llms.txt` and the JSON-LD in `+page.svelte` describe the map only and link out to the main site; do not copy the run schedule or joining instructions here, they will drift. See `docs/ARCHITECTURE.md`.
- The `og:image` must stay an absolute URL to a PNG. Relative paths and SVG cards both mean no link preview at all. Card source: `tools/social-card.html`.
- Security headers are in `static/_headers`. `csp-script-hashes.ts` adds inline hashes at build time. Keep the R2 origin in sync with `PHOTOS_BASE_URL` in `src/lib/config.ts`.
- `static/404.html` gives unmatched Cloudflare Pages URLs a real 404 instead of the SPA fallback. Verify with `pnpm exec wrangler pages dev build` because a plain static server returns 200.

## Deployment

Cloudflare Pages builds with `pnpm build` on push to `main`. The Pages dashboard injects Cloudflare Web Analytics, so the CSP allows `static.cloudflareinsights.com` and `cloudflareinsights.com`.

## Checks

Pre-commit: `pnpm exec lint-staged && pnpm scan:staged`. Pre-push: `pnpm check && pnpm test:run && pnpm scan && pnpm knip`.

Trivy scans only `dependencies`, so a package whose code ships in the site belongs there. Gitleaks and trivy come from Homebrew. `csp-script-hashes.ts` is in `.prettierignore` because it is kept byte-identical with the other repos' copies.

After changes, run `pnpm check && pnpm test:run && pnpm lint`.

## Context

A public, read-only static site for the Lightmile Run Club: wherever a club photo is taken, that place lights up on a world map. There is no backend and no submission flow. Content is added by the admin editing two JSON files + committing images, then pushing. Cloudflare Pages auto-builds and deploys.

### Architecture: everything is derived from two JSON files

The entire map (country fills, pins, carousels, progress bar, counters) is computed from `src/lib/data/cities.json` + `src/lib/data/photos.json`. Nothing about "conquered" state is hand-set or stored.

Data flow:

1. `src/routes/+page.ts` (`load`, runs at prerender time since `+layout.ts` sets `prerender = true`) imports both JSON files and calls `parseData` from `src/lib/data/schema.ts`. Invalid or inconsistent data throws here and fails `pnpm build`, the intentional guardrail.
2. `src/lib/state/derive.ts#buildMapData` turns cities + photos into the view model: a city is conquered iff it has ≥1 photo (cities with no photos are dropped, no pin); a country is conquered iff ≥1 of its cities is. `computeProgress` = conquered countries / total countries.
3. `src/routes/+page.svelte` wires the derived data into `WorldMap`, `ProgressBar`, and `Carousel`.

#### Country code join

Data files use friendly ISO 3166-1 alpha-2 codes (`"NL"`). The `world-atlas` TopoJSON keys countries by ISO numeric id (`"528"`). `src/lib/data/countryCodes.ts` holds the `alpha2 -> numeric` lookup that bridges them; `derive.ts` converts each city's country to numeric so it joins to `WorldMap`'s country paths. When adding a country, the alpha-2 code must exist in that table (`schema.ts` validates this via `isValidAlpha2`).

#### Map rendering

`src/lib/map/world.ts` loads the TopoJSON, converts to GeoJSON features, and exposes `geoNaturalEarth1` projection fitted to the viewport plus `totalCountries`. `src/lib/map/WorldMap.svelte` renders SVG paths + pins and handles d3-zoom/pan; pin/border sizes are divided by the zoom factor `k` to stay visually constant. Initial view is zoomed onto Europe (Eindhoven).

### Adding content (the primary task)

Photos are hosted in a public Cloudflare R2 bucket (`lightmile-worldmap-photos`), not committed to the repo. They are served via the bucket's r2.dev URL, set in `src/lib/config.ts` (`PHOTOS_BASE_URL`). `photos.json` `src` values are the R2 object keys (`photos/<city-id>/<file>`).

1. Upload the compressed image to R2 (requires `wrangler login` once):
   `wrangler r2 object put lightmile-worldmap-photos/photos/<city-id>/<file> --file=<localpath> --remote --content-type=image/jpeg --cache-control="public, max-age=31536000, immutable"`
2. If the city is new, add one entry to `src/lib/data/cities.json` (`id`, `name`, alpha-2 `country`, `lat`, `lng`).
3. Add one entry per photo to `src/lib/data/photos.json` (`city` = city id, `src` = R2 key `photos/<city-id>/<file>`, `author`, optional `note`/`date`, and `width`/`height` so the carousel can reserve the box before the file loads).
4. `pnpm build` to confirm validation passes, then commit + push.

`schema.ts` enforces: valid alpha-2 country code, coordinate ranges, no duplicate city ids, and that every photo references an existing city. It does not currently check whether the image `src` file exists.

### Docs

`docs/` holds the source-of-truth specs: `DATA-MODEL.md` (schema + admin workflow), `ARCHITECTURE.md`, `REQUIREMENTS.md`, `DESIGN.md` (brand/colors/UX), `ROADMAP.md` (V1 scope vs later).

## Git

Rebase on origin/main right before merging or pushing to main; never force-push main.
