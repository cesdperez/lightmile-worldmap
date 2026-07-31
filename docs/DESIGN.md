# Design & UX

## Source of truth

The **Lightmile landing page** (`lightmile.nl` — see `lightmile/docs/DESIGN.md`) is the design
source of truth. The world map does not invent its own look: it inherits the landing's palette,
fonts, and disciplines and applies them to an interactive map. The map should feel like the
landing page's world-map section made real — the same premium, restrained, editorial system — and
never like Google Maps.

Everything here is committed, not provisional. Earlier drafts of this file hedged the palette and
fonts "pending real logo assets"; those are now settled by inheriting the landing page.

## Foundations (inherited from the landing page)

### Colour

Tokens are Tailwind v4 `@theme` custom properties, re-pointed under `:root.dark`. The core palette
values are identical to the landing page so the two sites are unmistakably one brand; the map adds
two map-only landmass tokens.

| Token                | Light     | Dark      | Use                                                              |
| -------------------- | --------- | --------- | ---------------------------------------------------------------- |
| `--color-paper`      | `#F4F3EF` | `#0E0E10` | Background / the "ocean".                                        |
| `--color-ink`        | `#0A0A0A` | `#F4F3EF` | Text and pins.                                                   |
| `--color-blue`       | `#2438D6` | `#5B6EF2` | Conquered countries, progress fill, the percentage.             |
| `--color-blue-deep`  | `#1B2BA8` | `#4A5CE0` | Hover / active states.                                           |
| `--color-paper-line` | `#E4E3DE` | `#26262A` | Progress track, dividers.                                        |
| `--color-land`       | `#E4E1D7` | `#1A1A1D` | Unconquered landmass (map-only).                                 |
| `--color-land-line`  | `#CBC7BA` | `#34343A` | Country borders (map-only).                                      |

Map-only rationale: `--color-land` is a hair off `--color-paper` so unconquered countries read as
land against the paper "ocean"; conquered countries fill with brand blue — lifted in dark so
conquered territory glows on the near-black ground. Borders are subtle cartographic hairlines.

### Typography

**Archivo** (display + body) + **Geist Mono** (data), self-hosted under `static/fonts/` — the same
four `woff2` files as the landing page. No Google Fonts CDN, no Anton, no Inter. Display headings
are Archivo 900, uppercase, tight tracking. All map **data** — percentages, counts, coordinates,
`@handles`, dates — is set in Geist Mono, uppercase, wide tracking, `tabular-nums`: the
instrument-panel voice a runner reads.

### Shape

Square corners, hairline borders (`border-ink/15`), no soft shadows. Floating controls (zoom `+/−`)
are square with a translucent paper fill and a hairline. The theme toggle is the sliding switch
shared with the landing: a square cobalt knob travels a translucent, blurred groove, sun by day and
moon at night, spring easing that collapses under `prefers-reduced-motion`. This honours the
landing's no-pill / no-shadow rule; nothing here is rounded or drop-shadowed.

### Dark mode

Shared **verbatim** with the landing page — "the night run" (see the landing's `DESIGN.md` for the
concept and the fixed-vs-flipping token split). A `.dark` class on `<html>` is set before first
paint by an inline script in `app.html` (no CSP here, so inline is fine) and toggled at runtime by
`src/lib/state/theme.svelte.ts` via the shared `ThemeToggle`. State persists in
`localStorage['theme']` and defaults to the OS `prefers-color-scheme`; `<meta name="theme-color">`
and `color-scheme` follow. Because every surface is a token, only `:root.dark` re-points them:
conquered countries glow in the lifted cobalt, land sits just above the near-black ocean, and the
ink-bullseye pins flip to a light dot with a dark ring. The dark values equal the landing's dark
tokens exactly.

## The map screen (layout, mobile-first)

```
┌───────────────────────────────┐
│ LIGHTMILE  WORLD MAP 51.44°N…  │  ← wordmark (ink, flips) + mono label & coordinate
│                     [◐]  + −  │  ← sliding theme switch + zoom, top-right
│         [ world map ]          │  ← fills the screen; pan + pinch-zoom
│      blue = conquered          │     ink bullseye pins on conquered cities
│                                │
│  CONQUER THE WORLD        7%   │  ← square, hairline progress overlay
│  17/241 COUNTRIES · 28 CITIES  │     (bottom on mobile, pinned card on desktop)
└───────────────────────────────┘
```

- **Map dominates.** The progress overlay is a slim square, hairline, translucent panel: full-width
  at the bottom on mobile, a pinned card bottom-right on desktop. No multi-page nav.
- **Header.** The `LIGHTMILE` wordmark in `--color-ink`, a Geist-Mono `WORLD MAP` label, and an
  Eindhoven coordinate tick (`51.44°N 5.48°E`) that echoes the landing's wayfinding signature. The
  label and coordinate hide on the narrowest screens; the wordmark always stays.
- **The wordmark is ink, not blue**, for the same two reasons as the pins. Blue is the conquered
  fill and the action colour, so spending it on the brand dilutes both; and the mark floats over a
  pannable map, where a cobalt wordmark drifting over a cobalt country disappears. Ink flips with
  the theme and reads on ocean, land, and conquered fill alike. The landing header carries the same
  mark under the same rule.
- **Pins: an ink "bullseye"** (ink dot, paper ring, paper centre), **not** blue. It reads on both
  blue conquered fills and unconquered land, and it reserves blue for the fill (accent restraint).
  Pins flip with the theme and cluster by continent when zoomed out so dense regions stay readable.
- **Country fills:** conquered = `--color-blue`; unconquered = `--color-land`; subtle
  `--color-land-line` border.
- **Tap a pin → carousel.** A square modal with a hairline border and no shadow: the photo, the
  author as a hairline Geist-Mono tag (`@handle`), an optional note, arrow/swipe navigation, square
  dot ticks grouped by city, and a close button. Keyboard navigable, focus-trapped, `Esc` to close,
  alt text per photo.
- **Empty / first-run:** start zoomed on Europe (around Eindhoven) so even one photo feels
  intentional.

## Progress metric

Count of conquered countries / total, shown as a slim square bar plus `N/Total` and a city count.
The heading `Conquer the world` is Archivo; every number is Geist Mono. (Total = the country set in
the TopoJSON; keep one total so the number is stable.) A landmass-weighted "% of the world" is a
possible later refinement; a plain count is more motivating for V1.

## Motion

- Smooth zoom-to-region and a width transition on the progress bar.
- Respect `prefers-reduced-motion` (handled in `app.css`).

## Accessibility

- **AA in both themes**, verified with **axe-core (WCAG 2.1 A/AA)** at desktop and mobile, light and
  dark, with **zero violations**. Muted Geist-Mono text is kept at ≥ `ink/60` so small type clears
  AA on paper.
- The map is `role="application"` with a descriptive label; each pin cluster is a keyboard-focusable
  button with an `aria-label` (place + photo count). The carousel is focus-trapped, `Esc`-closable,
  with alt text per photo.
- Country borders and hairlines are decorative and exempt from non-text contrast.

## Assets

- **Logo:** `static/logos/lightmile.svg`, tinted via CSS mask with `--color-ink`, which flips with
  the theme. This file is the artwork of record. The landing page carries the same mark inlined in
  its `+page.svelte` (a prerendered header cannot afford a second request for its own brand), so
  changing one means changing the other.
- **Fonts:** self-hosted `archivo-*` + `geistmono-*` `woff2` under `static/fonts/`, the same files as
  the landing page. Keep them in sync when the landing updates them.
- **Favicon / social share image:** `static/favicon.svg`, `static/og-image.svg`.
