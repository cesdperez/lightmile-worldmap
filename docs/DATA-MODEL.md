# Data model & admin workflow

## Goals

- Country "conquered" is **derived**, never hand-set.
- Adding a photo to an existing city = a couple of lines + an image file.
- Adding a new city = define its name, country, and coordinates once.

## Shape

Two collections: **cities** and **photos**. Photos reference a city; cities reference a
country by **ISO 3166-1 code** (so they join to the TopoJSON country shapes).

```jsonc
// data/cities.json
[
  {
    "id": "eindhoven",
    "name": "Eindhoven",
    "country": "NL",        // ISO 3166-1 alpha-2 (also keep alpha-3 / numeric if the TopoJSON needs it)
    "lat": 51.4416,
    "lng": 5.4697
  },
  {
    "id": "lisbon",
    "name": "Lisbon",
    "country": "PT",
    "lat": 38.7223,
    "lng": -9.1393
  }
]
```

```jsonc
// data/photos.json
[
  {
    "city": "eindhoven",            // -> cities[].id
    "src": "photos/eindhoven/strijp-s-01.webp",  // R2 object key (see "Where photos live")
    "author": "@cesar",
    "note": "Logo sticker on the canal bridge",  // optional
    "date": "2026-06-14"            // optional
  }
]
```

### Derived data (computed, not stored)

- **City is "conquered"** iff it has ≥ 1 photo.
- **Country is "conquered"** iff ≥ 1 of its cities is conquered.
- **Progress** = conquered countries / total countries (see DESIGN for the exact metric).
- Counters = counts of the above.

> Note on country codes: `world-atlas` TopoJSON keys countries by **ISO numeric** id.
> We keep a small lookup (alpha-2 ↔ numeric) so the data can use friendly `"NL"` while
> the map joins on numeric ids.

## Where photos live (Cloudflare R2)

Images are **not** committed to the repo. They live in the public Cloudflare R2 bucket
`lightmile-worldmap-photos` and are served from its r2.dev URL, set as
`PHOTOS_BASE_URL` in `src/lib/config.ts`. Each `photos.json` `src` is the R2 **object
key** (`photos/<city-id>/<file>`); the app builds the final URL as
`${PHOTOS_BASE_URL}/${src}`.

### One-time setup

```bash
wrangler login   # opens a browser; approve the default scopes (include R2)
```

### Upload an image

Run this once per file. Keep the key as `photos/<city-id>/<file>` so it matches the
`src` you put in `photos.json`.

```bash
wrangler r2 object put \
  lightmile-worldmap-photos/photos/<city-id>/<file> \
  --file=<local-path-to-image> \
  --remote \
  --content-type=image/jpeg \
  --cache-control="public, max-age=31536000, immutable"
```

- `--content-type`: use `image/jpeg`, `image/png`, or `image/webp` to match the file.
- `--remote`: required, writes to the real bucket (not the local dev cache).
- Verify it is live: `curl -I "$PHOTOS_BASE_URL/photos/<city-id>/<file>"` → `200`.

## Admin workflow: "add photos from a new run"

1. Receive photos over WhatsApp; pick the ones with a visible Lightmile logo.
2. Resize/compress them (manual export ~1600px JPEG/WebP).
3. Upload each file to R2 with the `wrangler r2 object put ...` command above.
4. In `data/cities.json`: if the city is new, add one entry (name, country code,
   lat/lng). Look up coordinates once (e.g. from any maps search).
5. In `data/photos.json`: add one entry per photo — `city` id, `src` = the R2 key
   `photos/<city-id>/<file>`, `author`, optional `note`/`date`.
6. `npm run build` to confirm validation passes, then `git commit` + `git push`.
   Cloudflare Pages auto-builds and deploys.

That's it. New countries turn blue automatically; pins, carousels, counters, and the
progress bar all update from the data.

## Validation (build-time guardrails)

To keep the data honest, the build should fail (or warn loudly) if:

- a photo references a `city` id that doesn't exist,
- a city has an unknown/invalid country code,
- coordinates are out of range.

(The `src` is an R2 key, not a local file, so the build does not check that the image
exists. Use the `curl -I` check above to confirm an upload before referencing it.)

## Open question

- **JSON vs TS data file:** JSON is simplest to hand-edit; a `.ts` file gives type
  safety and editor autocomplete. Leaning JSON + a Zod/TS schema validated at build.
