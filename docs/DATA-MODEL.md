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
    "src": "photos/eindhoven/strijp-s-01.webp",  // under static/
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

## Admin workflow: "add photos from a new run"

1. Receive photos over WhatsApp; pick the ones with a visible Lightmile logo.
2. Resize/compress them (build script can do this; or manual export ~1600px WebP).
3. Drop the files into `static/photos/<city-id>/`.
4. In `data/cities.json`: if the city is new, add one entry (name, country code,
   lat/lng). Look up coordinates once (e.g. from any maps search).
5. In `data/photos.json`: add one entry per photo (city id, src path, author, optional note).
6. `git commit` + `git push`. Cloudflare Pages auto-builds and deploys.

That's it. New countries turn blue automatically; pins, carousels, counters, and the
progress bar all update from the data.

## Validation (build-time guardrails)

To keep the data honest, the build should fail (or warn loudly) if:

- a photo references a `city` id that doesn't exist,
- an image `src` file is missing,
- a city has an unknown/invalid country code,
- coordinates are out of range.

## Open question

- **JSON vs TS data file:** JSON is simplest to hand-edit; a `.ts` file gives type
  safety and editor autocomplete. Leaning JSON + a Zod/TS schema validated at build.
