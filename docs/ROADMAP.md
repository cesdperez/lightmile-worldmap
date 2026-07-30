# Roadmap

## V1 — the cool map (must-have)

Goal: a public, mobile-friendly map that shows photos, conquered countries, and
progress. Visitors only view. Admin adds photos by committing to the repo.

- [x] SvelteKit + adapter-static project, deployed to Cloudflare Pages (live at `worldmap.lightmile.nl`).
- [x] Brand theme: ✅ converged onto the landing's design system (shared fonts, palette, and "night run" dark mode with a sliding theme switch); see `docs/DESIGN.md`.
- [ ] Vector world map (D3-geo + TopoJSON), pan + pinch-zoom, mobile-smooth.
- [ ] Country fill: blue when conquered (derived from data).
- [ ] City pins from data; tap → photo carousel (image, author tag, optional note).
- [ ] Progress bar + counters (countries / cities conquered).
- [ ] Data files (`cities.json`, `photos.json`) + build-time validation.
- [ ] Image handling: web-optimized, lazy-loaded.
- [ ] Seed with real Lightmile photos (Eindhoven + wherever else exists today).
- [x] Basic SEO/share: title, description, canonical, Open Graph and Twitter tags, a 1200x630
      PNG social card, `robots.txt`, `sitemap.xml`, `llms.txt`, and `WebSite` JSON-LD that
      declares this site part of `lightmile.nl`. See `docs/ARCHITECTURE.md`.

### Definition of done for V1

On a phone, a stranger lands on the site, sees a striking branded world map with some
countries glowing blue, taps a pin, swipes through photos with author tags, and sees a
progress bar toward "conquer the world". Cost to run: $0.

## V1.x — admin quality of life

- [ ] `incoming/` folder + `sharp` script to auto-resize/compress originals.
- [ ] A short ADD-A-PHOTO.md cheat sheet for non-technical club members.
- [ ] Coordinate helper (paste a place name → get lat/lng) to speed up new cities.

## V2 — more site, easier admin

- [x] Custom domain: live at `worldmap.lightmile.nl` (2026-07-30); see `docs/ARCHITECTURE.md`.
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
