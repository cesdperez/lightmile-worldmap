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

- Start on the free Cloudflare Pages subdomain (`<project>.pages.dev`).
- Later: point a custom domain (e.g. `lightmilerunclub.com`) via Cloudflare DNS, free.
