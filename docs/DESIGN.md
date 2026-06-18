# Design & UX

## Brand cues (from the logo)

The Lightmile logo is a **heavy italic sans-serif** wordmark in **electric
indigo-blue** on a **textured cream / paper** background. The feel is sporty, bold,
energetic, slightly zine/print. The map should feel like that poster, not like Google
Maps.

### Color palette (starting point — tune against the real logo file)

| Token | Hex (approx) | Use |
| --- | --- | --- |
| `blue` (brand) | `#3D2BFF` | Conquered countries, pins, progress bar, accents, links |
| `paper` | `#F2EEE4` | Background, unconquered countries (with subtle paper texture) |
| `ink` | `#14110E` | Text, borders |
| `blue-deep` | `#2A1FB8` | Hover/active states, pin centers |
| `paper-line` | `#D9D3C4` | Country borders, dividers |

Use a **subtle paper/grain texture** behind the map to echo the logo background.
Keep it light so it never hurts contrast or photo legibility.

### Typography

Match the logo's heavy expanded italic for headings; clean neutral sans for body.

- **Display / headings:** a free heavy condensed/expanded italic. Candidates:
  **Archivo (Black, italic)** or **Anton** (Google Fonts, free). Pick whichever sits
  closest to the wordmark.
- **Body / UI:** **Inter** (free, highly legible on mobile).
- Confirm the actual logo font later; for now we approximate with the closest free face.

## The map screen (V1 layout, mobile-first)

```
┌───────────────────────────────┐
│  LIGHTMILE  · logo            │  ← compact header
├───────────────────────────────┤
│                               │
│        [ world map ]          │  ← fills the screen; pan + pinch-zoom
│     blue = conquered          │     pins on conquered cities
│                               │
├───────────────────────────────┤
│ ▓▓▓▓▓▓░░░░░░  12/195 countries │  ← progress bar + counters
│ 12 countries · 34 cities      │     (overlay, not a separate page)
└───────────────────────────────┘
```

- **Map dominates.** Progress bar + counters as a slim overlay (bottom on mobile,
  corner on desktop). No multi-page nav for V1.
- **Pins:** small Lightmile-blue dots/markers. Cluster or scale gracefully when zoomed
  out so dense regions (e.g. NL) stay readable.
- **Country fills:** conquered = brand blue; unconquered = paper. Subtle border between.
- **Tap a pin → carousel.** A bottom sheet (mobile) / centered modal (desktop) with:
  the photo, author tag chip (`@handle`), optional note, swipe/arrow nav, dot
  indicators, close button.
- **Empty/first-run state:** even with one photo the map should feel intentional, e.g.
  start zoomed on Europe / Eindhoven.

## Progress metric

V1 keeps it simple and legible: **count of conquered countries / total countries**
shown as a bar plus `N/Total`. (Total = the country set in the TopoJSON; decide whether
to count tiny states/territories. Pick one total and stick to it so the number is
stable.) A landmass-weighted "% of the world" is a possible later refinement; a plain
count is more motivating and easier to reason about for V1.

## Motion

- Smooth zoom-to-country and a quick "fill" animation when relevant.
- A subtle celebratory touch when the bar moves is nice-to-have, not V1-critical.
- Respect `prefers-reduced-motion`.

## Accessibility

- Brand blue on paper must hit WCAG AA for text; if not, use `ink` for text and reserve
  blue for fills/accents.
- Carousel: keyboard navigable, focus-trapped, `Esc` to close, alt text per photo.
- Pins reachable by keyboard / have accessible labels (city name + photo count).

## Assets needed from the club

- The logo in **SVG** (or high-res PNG) + any brand guide.
- Confirmation of the **exact blue** and the **logo font**.
- A favicon / social share image.
