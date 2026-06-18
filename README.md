# Lightmile World Map

An interactive world map for the **Lightmile Run Club** (Eindhoven).
[@lightmilerunclub](https://www.instagram.com/lightmilerunclub/)

## The idea

Wherever a Lightmile photo is taken, that place lights up on a world map. A photo
counts whenever the **Lightmile logo appears in it**: a sticker, someone wearing a
club t-shirt, a flag, anything. These are *not* running-stat photos, so there are no
distances or times. It is about presence: "we were here".

The game is to **conquer the whole world**:

- Drop at least one photo in a city → a **pin** appears there.
- Drop at least one photo in a country → the whole **country turns blue**.
- A **progress bar** tracks how much of the world is conquered.

Visitors browse the map, tap a city to open a **carousel** of every photo from that
place. Each photo shows a small **author tag** (e.g. `@cesar`) and an optional note.

## How it works (short version)

- Public, read-only website. Anyone can view it; nobody can submit anything.
- People send photos to the admin (Cesar) over WhatsApp.
- The admin adds them to the site by committing image files + a data entry, then pushing.
- The site is a **static** site hosted free on **Cloudflare Pages**.

## Docs

| Doc | What's in it |
| --- | --- |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | Functional + non-functional requirements |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, map approach, hosting, constraints |
| [docs/DATA-MODEL.md](docs/DATA-MODEL.md) | Data schema + the admin "add a photo" workflow |
| [docs/DESIGN.md](docs/DESIGN.md) | Brand, colors, typography, UX of the map |
| [docs/ROADMAP.md](docs/ROADMAP.md) | V1 scope and what comes later |

## Status

Pre-build. These docs capture the plan before any code is written.
