# Roadmap

## V1 — the cool map (must-have)

Goal: a public, mobile-friendly map that shows photos, conquered countries, and
progress. Visitors only view. Admin adds photos by committing to the repo.

- [ ] SvelteKit + adapter-static project, deployed to Cloudflare Pages (`*.pages.dev`).
- [ ] Brand theme: colors, fonts, paper texture, header with logo.
- [ ] Vector world map (D3-geo + TopoJSON), pan + pinch-zoom, mobile-smooth.
- [ ] Country fill: blue when conquered (derived from data).
- [ ] City pins from data; tap → photo carousel (image, author tag, optional note).
- [ ] Progress bar + counters (countries / cities conquered).
- [ ] Data files (`cities.json`, `photos.json`) + build-time validation.
- [ ] Image handling: web-optimized, lazy-loaded.
- [ ] Seed with real Lightmile photos (Eindhoven + wherever else exists today).
- [ ] Basic SEO/share: title, description, social preview image.

### Definition of done for V1

On a phone, a stranger lands on the site, sees a striking branded world map with some
countries glowing blue, taps a pin, swipes through photos with author tags, and sees a
progress bar toward "conquer the world". Cost to run: $0.

## V1.x — admin quality of life

- [ ] `incoming/` folder + `sharp` script to auto-resize/compress originals.
- [ ] A short ADD-A-PHOTO.md cheat sheet for non-technical club members.
- [ ] Coordinate helper (paste a place name → get lat/lng) to speed up new cities.

## V2 — more site, easier admin

- [ ] Custom domain (e.g. `lightmilerunclub.com`).
- [ ] "About the club" + how to join + links to Instagram/WhatsApp.
- [ ] Conquered-places list / leaderboard of authors.
- [ ] Move images to Cloudflare R2 / Cloudflare Images if repo size grows.
- [ ] Optional simple admin page (Cloudflare Access + Pages Functions) instead of git edits.

## Later / maybe

- [ ] Run schedule / events.
- [ ] Visitor photo submission (with moderation) — only if wanted; adds a backend + abuse surface.
- [ ] Instagram sync.
- [ ] Landmass-weighted "% of world conquered" metric and richer stats.

## Non-goals (keep saying no in V1)

- Accounts, comments, likes, RSVPs.
- Anything that costs money or needs a server to stay online.
