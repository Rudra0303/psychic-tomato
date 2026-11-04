# HaulerHub: marketing site

A product-first, scroll-driven site for HaulerHub, the connected freight platform for road, rail,
sea and air. Static build: Vite + Three.js + GSAP ScrollTrigger + Lenis. No backend.

## The page, top to bottom

| Section | What it does | Inspired by |
|---|---|---|
| Loader | Iris wipe with the four modes cycling | United Carriers |
| **Product hero** (`#product`) | The app first: a live shipment record (route, legs, connected parties, documents, costs) tilting into place, with floating match / driver-app / settlement cards | product-led SaaS heroes (Linear, Railway on Mobbin) |
| **Problem → one record** (`#problem`) | Scattered emails, calls, spreadsheets and PDFs collapse into one shipment record; catalog figures count up | Ramp "systems that never spoke" (Mobbin) |
| **How it connects** (`#network`) | Emons-style pinned 3D world with five stations (road depot, rail terminal, sea port, airport, delivery hub). Scroll or the 01–05 tabs fly the camera between stations at a fixed pace. At each station the parties working there are labelled and linked by orange arcs to a floating shipment-record beacon; "+" hotspots open product cards | Emons hero |
| **Journey** (`#journey`) | United-Carriers-style scroll-scrubbed story: one container is loaded at a dock (side view), the camera turns top-down to follow the truck, a gantry moves it to rail, a ship-to-shore crane loads it on a ship, the camera climbs over the ocean and above the clouds with a plane, then descends to the hub for delivery. A live "shipment record" panel logs each party's action; a HUD shows speed and leg | United Carriers services/why sections |
| **Platform** (`#platform`) | Dark pinned browser: six modules (matching, pricing, tracking, documents, exceptions, settlement) with illustrative UI | United Carriers services page |
| Roles | Tiles with rendered 3D models, orange hover fill, links to persona pages | Emons services grid |
| F.A.Q, CTA, footer | Accordion; dark CTA where the cursor becomes a "Book a demo" disc; footer with a particle wordmark that scatters from the cursor | United Carriers |

Persona pages (`/shippers/`, `/carriers/`, `/drivers/`, `/forwarders/`, `/logistics-providers/`) open on
the same 3D world framed on that role's station, then a four-step workflow browser, other roles and CTA.

## Run

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

URL flags: `?quality=high|medium|low`, `?reduced` (reduced-motion preview), `?noadapt` (no
automatic resolution scaling).

## Structure

```
src/content.js          ALL copy: hero app data, problem, stations, journey chapters, platform modules, FAQ, persona pages
src/templates/          Renders content.js into static HTML at build time (render.js, ui.js, icons.js)
src/styles/             base (tokens, type, buttons) · chrome (loader, header, menu, cursor) · hero · sections · ui
src/app/boot.js         Loader → header/cursor/transitions → hero → sections → lazy 3D
src/app/sections.js     Hero tilt, reveals, problem collapse, platform browser, footer particles
src/app/chrome.js       Header states, full-screen menu, cursor, page transition
src/app/story.js        Connects scroll + DOM to the 3D scenes (stations, hotspots, labels, journey)
src/gl/models.js        Procedural models: trucks, containers, trains, ships, planes, cranes, buildings, trees
src/gl/world.js         The five-station network world
src/gl/journey.js       The scroll-scrubbed shipment journey
src/gl/links.js         Connection arcs + shipment-record beacon
src/gl/thumbs.js        Role tile thumbnails
src/gl/engine.js        Renderer, lights, quality tiers
```

Each 3D scene renders only inside its own pinned section (scissored viewport), so sections slide
in and out like normal page content.

## Editing

- Copy: edit `src/content.js`; the dev server reloads.
- Station hotspots and party lists: `network.stations` in `content.js`. Their 3D positions live in
  `src/gl/world.js` (`hotspots[...]`, `actors`).
- Journey timing: chapter windows `CH` in `src/gl/journey.js` must stay in the same order as
  `journey.chapters` in `content.js`.

### Placeholders to replace before launch

Search `PLACEHOLDER` in `src/content.js`: `site.url`, `links.demo`, `links.start`, and the catalog
figures in the problem section. All product UI is illustrative and captioned as sample data. There
are no testimonials, customer logos or performance statistics.

## Design

Own identity: warm paper `#F2F0EB`, ink `#0E0F12`, signal orange `#FF5A1F`. Archivo Expanded for
display, Geist for text, Geist Mono for labels. Self-hosted fonts.

## Performance and accessibility

- Three.js loads as a separate chunk in parallel with the loader; text never waits for WebGL.
- Quality tiers cap pixel ratio and shadow size; resolution drops automatically if frames are slow.
- Real HTML text throughout, keyboard-operable menu, tabs, hotspots and FAQ, visible focus.
- `prefers-reduced-motion`: no smooth scroll, no loader animation, no cursor, instant camera cuts.

## Deploy

Static output in `dist/` uses relative paths. Netlify: `netlify.toml` included. GitHub Pages:
`.github/workflows/deploy.yml` deploys on push to `main` (set Pages source to GitHub Actions).
