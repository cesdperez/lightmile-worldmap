# Requirements

## Personas

- **Visitor** (public): browses the map, opens photos. No account, no input. The vast
  majority of traffic, mostly on mobile.
- **Admin** (Cesar / club organizers): adds photos and places. Comfortable with a
  technical-ish workflow (editing a data file, pushing to git). One or a few people.

## Functional requirements

### Map (visitor)

- **FR-1** Show a world map with all countries.
- **FR-2** A country with ≥ 1 photo is filled the Lightmile blue ("conquered").
  Countries with no photos use a neutral/paper fill.
- **FR-3** A city with ≥ 1 photo shows a pin at its coordinates.
- **FR-4** Tapping/clicking a city pin opens a **carousel** of all photos for that city.
- **FR-5** Each photo in the carousel shows:
  - the image,
  - an **author tag** (e.g. `@cesar`),
  - an **optional note** (short caption).
- **FR-6** Carousel supports swipe (touch) and arrows/keys (desktop), and a close action.
- **FR-7** Map supports pan and zoom, smoothly on mobile (pinch + drag).

### Progress / "conquer the world" (visitor)

- **FR-8** A **progress bar** shows world conquest. Define the metric explicitly:
  default = `countries conquered / total countries`. (See DESIGN for whether we weight
  by landmass or just count; V1 = simple count.)
- **FR-9** Show counters: **countries conquered** and **cities conquered** (e.g. "12
  countries · 34 cities").
- **FR-10** (Nice to have) A list/scroll of conquered places.

### Admin (content management)

- **FR-11** Adding a photo must not require a running server or a CMS login for V1. It is
  done by adding image files + a data entry and deploying (see DATA-MODEL.md).
- **FR-12** A photo entry must capture: city (with country + coordinates), image file,
  author handle, optional note. Date optional.
- **FR-13** Country "conquered" state is **derived** from the data (≥ 1 photo in any city
  of that country), never hand-maintained.
- **FR-14** Adding a brand-new city should be low-friction: provide city name, country,
  and lat/long once; subsequent photos just reference that city.

## Non-functional requirements

- **NFR-1 Cost:** $0. Free Cloudflare hosting, no paid map tiles, no paid APIs, no
  paid storage for V1.
- **NFR-2 Mobile-first:** designed for phones first; must look and feel great on a
  small screen and on touch.
- **NFR-3 Performance:** fast first load on mobile data. Images lazy-loaded and
  web-optimized. Map renders without heavy tile downloads.
- **NFR-4 Static & simple:** no backend to operate for V1. Deploy = push to git.
- **NFR-5 Public & read-only:** no user input, no auth for visitors → small attack
  surface.
- **NFR-6 Accessibility:** sufficient color contrast, keyboard navigable carousel,
  alt text on images, respects reduced-motion.
- **NFR-7 Maintainability:** the admin workflow is documented and repeatable by a
  non-author club member if needed.

## Explicitly out of scope for V1

- Visitor photo submission, RSVPs, accounts, comments, likes.
- Automatic Instagram sync.
- Run schedule / events / "about the club" pages (can come later).
- Per-photo geolocation from EXIF (admin assigns the city manually).
