# Architecture

## Summary

| Concern | Decision |
| --- | --- |
| Framework | **SvelteKit** (Svelte 5) |
| Output | **Static site** via `@sveltejs/adapter-static` (fully prerendered) |
| Hosting | **Cloudflare Pages** (free tier) |
| Map | **Vector map**: D3-geo projection + TopoJSON country shapes, rendered to SVG/Canvas. No map tiles, no API keys. |
| Data | A committed data file (JSON or TS) in the repo |
| Images | Committed to the repo under `static/`, web-optimized at build time |
| Backend | **None** for V1 |
| Styling | Tailwind CSS v4 |

## Why a vector map (not Google / Mapbox / Leaflet tiles)

The "conquer the world" mechanic needs us to **fill whole countries** based on our own
data, and the brand is flat and graphic, not photo-realistic. Tile-based maps
(Google, Mapbox, raster Leaflet) are the wrong tool:

- They cost money / need API keys and have usage limits (breaks NFR-1).
- Coloring an entire country by our own rule is awkward on raster tiles.
- They pull lots of tile imagery on mobile (breaks NFR-3) and look generic.

A **vector world map** solves all of this:

- Country borders come from **TopoJSON** (e.g. Natural Earth via `world-atlas`),
  bundled with the site. Each country is a path we can fill blue or leave paper.
- City pins are just points projected with the same `d3-geo` projection.
- Zero tiles, zero keys, zero cost, tiny payload, fully static, and it matches the
  stylized Lightmile look.

**Projection:** start with `geoNaturalEarth1` or `geoEqualEarth` (nice world view,
avoids Mercator's polar distortion). Pan/zoom via `d3-zoom` or a lightweight
transform on the SVG group.

**Render target:** SVG is simplest (each country a `<path>`, easy hit-testing and
hover/tap). If performance on low-end phones suffers with full-detail borders, switch
to Canvas or use a lower-resolution TopoJSON (110m instead of 50m).

## Data flow

```
data file (cities + photos)  ──┐
                               ├─►  build (prerender)  ─►  static HTML/CSS/JS  ─►  Cloudflare Pages
images in static/  ────────────┘
        │
        └─ country "conquered" set is DERIVED at build/runtime from which
           countries the cities belong to
```

Country fill state is never stored by hand. We compute: a country is conquered iff at
least one city in the data with ≥ 1 photo maps to that country's ISO code.

## Cloudflare Pages: free-tier constraints to respect

- **Unlimited** requests and bandwidth (good for a public site).
- **25 MB** max per file → keep each image well under this; we target a few hundred KB.
- **20,000 files** max per deployment → at ~5–10 photos per city this is plenty of
  runway; revisit only if we ever approach it.
- **500 builds/month** → fine for manual pushes.
- Static deploy uses `adapter-static`. If we later add server logic (e.g. an admin
  endpoint), switch to `@sveltejs/adapter-cloudflare` and use Pages Functions.

## Image strategy

- Source photos arrive via WhatsApp (often large). Before committing, downscale to a
  web size (e.g. max ~1600px long edge) and compress to WebP/JPEG (~200–400 KB).
- A build/preprocess script (e.g. `sharp`) can automate this so the admin just drops
  originals into an `incoming/` folder. (V1 can start manual; script is a fast follow.)
- Lazy-load images; only the carousel for the tapped city loads full-size.

## If/when we outgrow "commit to repo"

Documented escape hatches, **not** needed for V1:

- **Cloudflare R2** (object storage, free tier) for images + keep the small JSON in repo.
- **Cloudflare Images** for automatic resizing/CDN.
- A tiny **admin page** behind Cloudflare Access, writing to R2 / a KV store.

Keep V1 as plain static until volume actually demands more.

## Domain

Live at [worldmap.lightmile.nl](https://worldmap.lightmile.nl) since 2026-07-30. The
Pages project `lightmile-worldmap` keeps `lightmile-worldmap.pages.dev` as its default
subdomain; `worldmap.lightmile.nl` is a custom domain on top of it.

DNS lives in the `lightmile.nl` Cloudflare zone (`8c70129690be65171df143fd8ddd4bac`),
which belongs to the main site's repo (`cesdperez/lightmile`), not this one. The record
is a proxied (orange cloud) `CNAME worldmap -> lightmile-worldmap.pages.dev`, matching
how the apex and `www` point at the main site. Cloudflare issued the edge certificate
over HTTP validation.

Two things to know before touching this:

- **The zone is shared.** Read `lightmile/docs/ARCHITECTURE.md` before editing DNS. The
  zone also carries iCloud mail records that must stay DNS only (grey cloud), and DNSSEC
  is half-enabled pending the registrar publishing the DS.
- **The subdomain must stay proxied.** An unproxied CNAME to `pages.dev` does not get a
  Cloudflare-issued certificate for `worldmap.lightmile.nl`.

The main site links here with `target="_blank"` and `rel="noopener"`; the two deployments
stay independent on purpose.

## Discoverability and sharing

This site is intentionally crawlable, by search engines and by AI assistants:
`static/robots.txt`, `static/sitemap.xml`, `static/llms.txt`, plus a `WebSite` JSON-LD block
generated in `+page.svelte` from the same constants the page renders.

The rule for all of it is that **`lightmile.nl` stays canonical for club information**. This
site owns only what the map is and how it works. `llms.txt` deliberately does not repeat the
run schedule, meeting points, or joining instructions; it points at the main site instead, so
there is nothing here to drift out of date. The JSON-LD says the same thing structurally via
`isPartOf` and `publisher`, so the two domains read as one entity rather than two brands. The
header wordmark links to `lightmile.nl`, which is also the only user-visible way back.

Social previews use `static/social-card.png` (1200x630). Two constraints that are easy to
regress, and did exist as bugs before 2026-07-30:

- **The URL must be absolute.** Link-preview scrapers do not resolve relative paths.
- **The card must be a PNG.** Facebook, WhatsApp, LinkedIn, Slack, and X all refuse to render
  an SVG `og:image`, so an SVG card means no preview at all.

The card's source is `tools/social-card.html`, which uses the real logo wordmark, the real
Archivo and Geist Mono files from `static/fonts`, and the brand tokens from `src/app.css`. To
regenerate after a brand change, run `npm run dev` (the fonts and logo load by absolute path,
and headless Chrome blocks `file:`), open `/tools/social-card.html` at 1200x630, screenshot it,
and save over `static/social-card.png`.

## Security headers

Mirrors the main site, and like it the posture lives in two places by necessity. Keep both
in sync when changing it.

- `svelte.config.js` emits a hash-mode `<meta>` CSP. Prerendered pages have no server to
  set the header, so SvelteKit hashes its own hydration bootstrap and inlines the policy.
- `static/_headers` carries what a `<meta>` CSP cannot (`frame-ancestors`,
  `Permissions-Policy`, HSTS, `X-Frame-Options`) plus immutable cache rules for `/fonts`
  and `/logos`.

Three things this project needs that the main site does not:

- **`img-src` and `media-src` allow the R2 photo origin.** Photos and videos are served
  from the public bucket, not this origin. The origin is duplicated in `svelte.config.js`
  as `PHOTOS_ORIGIN`; if `PHOTOS_BASE_URL` in `src/lib/config.ts` ever changes, change both
  or all media 404s silently behind a CSP block.
- **The pre-paint theme script is `static/theme-init.js`, not inline.** An inline script in
  `app.html` is not covered by SvelteKit's hashing and would need `unsafe-inline`, which
  would defeat the point of a hash-locked `script-src`.
- **`style-src` allows `unsafe-inline`.** The route announcer, the progress bar width, and
  the d3 zoom transform all set style attributes at runtime. `script-src` stays hash-locked.

Cloudflare Web Analytics is enabled on this project, so the CSP allowlists
`static.cloudflareinsights.com` (script) and `cloudflareinsights.com` (RUM beacon). Removing
those breaks analytics silently.
