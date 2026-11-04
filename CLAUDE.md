# CLAUDE.md

Marketing site for **HaulerHub**, a connected freight platform (road, rail, sea, air). Static site:
Vite + Three.js + GSAP (ScrollTrigger, SplitText) + Lenis. No backend, no API keys.

## Commands

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static output in dist/ (relative paths)
npm run preview   # serve dist/ on :4173
```

URL flags: `?quality=high|medium|low`, `?reduced` (reduced-motion preview), `?noadapt` (no auto
resolution scaling).

## How the site is built

- **Copy lives only in `src/content.js`.** `src/templates/render.js` turns it into static HTML at
  dev/build time through the plugin in `vite.config.js` (pages listed in `PAGES`). Never hardcode
  copy in templates or JS.
- Page shells (`index.html`, `shippers/index.html`, …) only contain `<!--hh:head-->` / `<!--hh:body-->`
  placeholders.
- Landing order: product hero → problem → `#network` (3D stations) → `#journey` (3D scroll story)
  → `#platform` → roles → FAQ → CTA → footer. The product comes first; the 3D sections explain how
  HaulerHub connects parties, they are not decoration.
- Persona pages reuse the network world, framed on the station named in `pages.<role>.hero.station`.

### Key files

| File | Role |
|---|---|
| `src/app/boot.js` | Loader → chrome → sections → lazy-loads `story.js` |
| `src/app/sections.js` | Hero tilt, reveals, problem collapse, platform list, footer particles |
| `src/app/chrome.js` | Header states, menu, custom cursor, page transition |
| `src/app/story.js` | Wires scroll + DOM to 3D: station flights, hotspots, party labels, journey |
| `src/gl/world.js` | Five-station network world (`STATIONS`, `actors`, `hotspots`, `stationPose`) |
| `src/gl/journey.js` | Scroll-scrubbed journey; chapter windows in `CH` |
| `src/gl/models.js` | Procedural models + shared materials, `bake()` merges static meshes |
| `src/gl/links.js` | Connection arcs (shader ribbons) and the record beacon |
| `src/gl/engine.js` | Renderer, light rig, quality tiers |

### Rules that are easy to break

- `CH` in `journey.js` must stay in the same order and count as `journey.chapters` in `content.js`.
- Station order in `world.js` `STATIONS` must match `network.stations` in `content.js`;
  `hotspots[i][j]` must match `network.stations[i].hotspots[j]`.
- One shared WebGL canvas. Each scene renders only inside its pinned section via scissored
  viewport (`draw()` / `region()` in `story.js`). New 3D sections must follow that pattern.
- Use `gsap.ticker` for per-frame work (Lenis is driven from it). Don't add separate rAF loops.

## Brand and content rules

- Identity: paper `#F2F0EB`, ink `#0E0F12`, signal orange `#FF5A1F`. Archivo Expanded (display,
  uppercase), Geist (text), Geist Mono (labels). Fonts are self-hosted via `@fontsource-variable`.
- No fake testimonials, customer logos or performance statistics. Product UI is illustrative and
  must keep its "Illustrative interface · sample data" caption.
- Items marked `PLACEHOLDER` in `content.js` (site URL, demo/start links, catalog figures) must be
  confirmed before launch.
- No manufacturer logos on vehicles.
- `reference/brand-notes.md` is the source for tone and product facts.

## Known issues (next work)

- **Performance**: 3D lags in places. Main suspects: per-frame work for off-screen sections
  (`setupProblem`, hero floats and footer particles all run on `gsap.ticker` unconditionally), per-frame
  `getComputedStyle` in the journey activity log (`dom()` in `journey.js`), `backdrop-filter` blur on
  `.station` / `.jrec` over the canvas, and shadow maps re-rendered every frame in both scenes.
- **Visual detail**: models are procedural low-poly. `assets/truck.glb` exists but is not used yet.

## Testing notes

- Headless Chromium needs `--use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL, and
  frames are very slow there. `window.__hhFreeze = true` pauses the loop; `window.__hh.frame()`
  renders a settled frame for screenshots; `window.__hh.lenis.scrollTo(y, { immediate: true })` jumps.
- Software rendering says nothing about real frame rate; check performance on a real GPU.
- Before finishing UI work, check desktop (1440×900) and mobile (390×844) plus `?reduced`.
