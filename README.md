# HaulerHub: immersive 3D marketing site

A scroll-driven 3D site for HaulerHub, the connected freight platform. One white American Class 8
tractor-trailer drives a night highway while the camera follows "one shipment, one journey":
the problem, the connected ecosystem, one moment per persona with an illustrative product UI
panel, then delivery, proof and payment.

- **Landing page** (`/`): the full journey.
- **Persona pages**: `/shippers/`, `/carriers/`, `/drivers/`, `/forwarders/`, `/logistics-providers/`.
  Shorter journeys on the same truck scene, with copy, panels and CTAs for that role.

Static build (Vite + Three.js + GSAP ScrollTrigger + Lenis). No backend, no API keys.

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. Useful URL flags while developing:

| Flag | Effect |
|------|--------|
| `?debug` | FPS, draw calls, triangles, pixel ratio, quality tier |
| `?quality=high\|medium\|low` | Force a quality tier (default is detected) |
| `?reduced` | Preview the reduced-motion experience |
| `?noadapt` | Turn off automatic resolution scaling |

```bash
npm run build
```

```bash
npm run preview
```

## Project structure

```
index.html, shippers/ … logistics-providers/   Page shells (filled in at build time)
src/content.js            ALL copy, personas, panels, links and placeholder figures
src/templates/            Renders content.js into static HTML (runs in Node via vite.config.js)
  render.js               Page layouts: nav, moments, light section, footer
  panels.js               Illustrative UI panels built from simple blocks
  icons.js                Line icons + HaulerHub logomark
src/styles/               base (tokens, type, buttons), chrome (nav, preloader, switcher),
                          moments (scroll sections), panels (glass UI), light (closing + footer)
src/app/                  Browser runtime
  boot.js                 Preloader → fonts → 3D stage → scroll director → reveals
  director.js             Maps scroll position to camera shots and story state
  reveal.js               Text line reveals, panel assembly, count-ups (GSAP)
  overlays.js             Node labels, panel → truck connector line, payoff flow
  ui.js                   Navigation menus, persona switcher, preloader
src/scene/                Shared Three.js scene (lazy-loaded chunk)
  stage.js                Renderer, lights, bloom, adaptive resolution, optional .glb loader
  truck.js                Procedural tractor-trailer (merged geometry, instanced wheels)
  world.js                Sky, wet road with reflections, streetlights, skyline, port, traffic
  network.js              Persona nodes and lime connection arcs
  shots.js                Camera shots used by pages (positions, drift, phone overrides)
  textures.js             Canvas textures: trailer livery, road markings, grille, glow
  quality.js              Quality tiers
public/                   favicon, social image, Draco decoder (only used with a .glb)
docs/scroll-timeline.md   The scroll timeline and pacing rules
reference/brand-notes.md  Brand and content reference (source for copy)
```

The HTML text is real, static markup generated from `src/content.js`, so it is readable without
JavaScript, by screen readers and by search engines. The 3D canvas is decorative
(`aria-hidden`).

## Editing copy

Everything a visitor reads is in **`src/content.js`**:

- `landing`: hero, fragmentation steps, one block per persona, payoff, statement, closing cards.
- `pages.<persona>`: each persona page (hero, three moments, features, CTA).
- `panels`: the illustrative UI mockups. Each panel is a list of blocks (`header`, `route`,
  `fields`, `chips`, `checks`, `steps`, `legs`, `breakdown`, `alert`, `actions`, `map`, `chat`,
  `slots`, `meter`). All values are sample data.
- `links`: the demo and get-started URLs. **These are placeholders**, see below.

Save the file and the dev server reloads.

To move a moment's camera, change its `shot` to another name from `src/scene/shots.js`, or edit
the numbers there. `side: 'left' | 'right'` puts the copy on that side (the panel takes the
other). `anchor` is where the panel's connector line meets the truck (`door`, `cab`, `roof`,
`trailerMid`, `trailerRear`, `rearDoors`, `hub`).

### Placeholders to replace before launch

Search for `PLACEHOLDER` in `src/content.js`:

- `site.url`: the production domain (used for canonical and social-preview URLs).
- `links.demo` and `links.getStarted`: currently `mailto:` addresses on `haulerhub.example`.
- `capabilities.figures`: catalog counts (21 services, 13 equipment categories) as stated on
  the current site. They are labelled on the page as placeholder figures; confirm or remove.

There are no testimonials, customer logos or performance statistics. Panel values (rates,
load IDs, cities, names) are illustrative and each panel is captioned "Illustrative interface ·
sample data".

## Swapping in a truck model (.glb)

The procedural truck is used unless a model file exists at either:

- `public/assets/truck.glb` (recommended), or
- `assets/truck.glb` at the repo root.

The file is detected at build/dev-server start (restart `npm run dev` after adding it).

Model guidelines:

- One white American Class 8 long-hood sleeper tractor with a 53 ft dry van. No manufacturer
  logos or badges.
- Y-up, facing +X if possible (the loader rotates it if the longest side runs along Z).
- It is scaled to 22.9 m overall and placed like the procedural rig, wheels on the ground.
- Compress it: Draco or Meshopt both work (decoders are bundled; Draco files live in
  `public/draco/`). For example with [gltf-transform](https://gltf-transform.dev):

```bash
npx @gltf-transform/cli optimize truck-source.glb public/assets/truck.glb --compress meshopt --texture-compress webp
```

- The HaulerHub livery decals are overlaid on the trailer sides by default. If the model already
  carries the livery, set `overlayLivery: false` in `GLB_OPTIONS` in `src/scene/stage.js`.
- Wheels of a .glb are not animated. Panel connector points (`anchors` in `src/scene/truck.js`)
  assume the standard rig proportions.

## Performance

- Three.js and the scene are a separate chunk, loaded in parallel with fonts while the
  preloader runs. Text and styles never wait for WebGL.
- Static truck parts are merged per material (~25 draw calls for the rig), wheels are instanced,
  streetlights and reflectors are instanced and streamed.
- Pixel ratio is capped per tier (1.75 high, 1.25 medium, 1.5 low) and drops automatically if
  frames run slow; road reflections switch off first on struggling GPUs.
- Tiers: **high** (desktop) bloom, MSAA, real-time road reflections, 2048 shadows;
  **medium** bloom, no reflections; **low** (phones) no post-processing, one moving light,
  1024 shadows. Same story on every tier.
- Rendering stops while the light closing section covers the screen.

## Accessibility

- Real HTML text, semantic headings, skip link, visible focus rings, keyboard-operable menus
  (Escape closes) and persona switcher (moves focus to the chosen moment's heading).
- `prefers-reduced-motion`: no smooth scrolling, no camera travel (hard cuts between shots),
  no parallax, the truck stands still and all text is shown without animation.
- Without WebGL or JavaScript the page still reads top to bottom.

## Deploying

The build output in `dist/` is fully static and uses relative paths, so it works at a domain
root or in a sub-folder (GitHub Pages project sites).

**Netlify**: build command `npm run build`, publish directory `dist`. A `netlify.toml` is
included.

**GitHub Pages**: a workflow is included at `.github/workflows/deploy.yml`. In the repository
settings, set Pages → Source to "GitHub Actions"; every push to `main` deploys.

After deploying, set `site.url` in `src/content.js` to the live URL so `og:image` and canonical
links resolve, and rebuild.

## Social preview

`public/og-image.png` (1200×630) is a render of the hero. To regenerate it, run the dev server
and capture `/?quality=high` at 1200×630 with any headless browser.
