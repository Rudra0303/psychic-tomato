/**
 * Renders each page from src/content.js at dev/build time (see vite.config.js).
 * Node only: no browser APIs here.
 */
import * as C from '../content.js';
import { icon, mark, logo } from './icons.js';
import { renderUI, esc } from './ui.js';

const lines = (arr, cls = '') => arr.map((l, i) => `<span class="ln${i ? ' ' + cls : ''}">${esc(l)}</span>`).join(' ');
const pageUrl = (root, k) => (k === 'home' ? root : `${root}${C.roles[k].slug}/`);
const btn = (label, href, cls = 'btn--accent', extra = '') =>
  `<a class="btn ${cls}" href="${esc(href)}" ${extra}><span>${esc(label)}</span>${icon('arrow')}</a>`;
const modeIcon = { road: 'truck', rail: 'rail', sea: 'sea', air: 'air', hub: 'hub' };

/* ------------------------------------------------------------------ head */
function head(page, meta) {
  const slug = page === 'home' ? '' : `${C.roles[page].slug}/`;
  const url = `${C.site.url}/${slug}`;
  const img = `${C.site.url}/og-image.png`;
  return `<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <meta name="theme-color" content="#F2F0EB" />
    <link rel="canonical" href="${esc(url)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="HaulerHub" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(img)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <meta name="twitter:image" content="${esc(img)}" />
    <script>document.documentElement.classList.replace('no-js','js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches||location.search.indexOf('reduced')>-1)document.documentElement.classList.add('rm')}catch(e){}</script>`;
}

/* ------------------------------------------------------------------ chrome */
function chrome(page, root) {
  const home = page === 'home';
  const navHref = (h) => (home ? h : `${root}${h}`);
  const roleLinks = C.roleOrder
    .map((k) => `<li><a href="${pageUrl(root, k)}"${k === page ? ' aria-current="page"' : ''}><span>${esc(C.roles[k].label)}</span><small>${esc(C.roles[k].line)}</small></a></li>`)
    .join('');
  const ticker = esc(C.nav.ticker.repeat(4));
  return `
  <div class="loader" data-loader aria-hidden="true">
    <div class="loader__rings">${'<i></i>'.repeat(6)}</div>
    <div class="loader__center">${mark(40)}<p class="loader__word" data-loader-word>${esc(C.loader.words[0])}</p></div>
    <p class="loader__count mono"><span data-loader-count>00</span></p>
  </div>
  <div class="curtain" data-curtain aria-hidden="true"></div>
  <div class="cursor" data-cursor aria-hidden="true"><span class="cursor__ring"></span><span class="cursor__dot"></span><span class="cursor__label" data-cursor-label></span></div>
  <a class="skip" href="#main">Skip to content</a>
  <header class="hdr" data-hdr>
    <a class="hdr__logo" href="${root}" aria-label="HaulerHub home">${logo()}</a>
    <nav class="hdr__nav" aria-label="Primary">
      ${C.nav.items.map(([l, h]) => `<a href="${navHref(h)}">${esc(l)}</a>`).join('')}
      <div class="hdr__roles" data-dd>
        <button type="button" aria-expanded="false" aria-controls="dd-roles">${esc(C.nav.roles)}${icon('arrowDown')}</button>
        <ul id="dd-roles" class="dd">${roleLinks}</ul>
      </div>
    </nav>
    <button class="hdr__menu mono" type="button" data-menu-open aria-expanded="false" aria-controls="menu">${icon('arrow')}<span>${esc(C.nav.menu)}</span></button>
    <div class="hdr__ticker mono" aria-hidden="true"><span>${ticker}</span></div>
    <a class="btn btn--ink btn--sm hdr__cta" href="${esc(C.links.demo)}"><span>${esc(C.nav.demo)}</span></a>
  </header>
  <div class="menu" id="menu" data-menu hidden>
    <div class="menu__inner">
      <button class="menu__close mono" type="button" data-menu-close>${icon('close')}<span>${esc(C.nav.close)}</span></button>
      <nav class="menu__big" aria-label="Sections">${C.nav.items.map(([l, h], i) => `<a href="${navHref(h)}"><span class="mono">0${i + 1}</span>${esc(l)}</a>`).join('')}</nav>
      <div class="menu__roles"><p class="mono">${esc(C.nav.roles)}</p><ul>${roleLinks}</ul></div>
      ${btn(C.nav.demo, C.links.demo)}
    </div>
  </div>
  <div class="gl-under" data-under aria-hidden="true"><div class="marquee-xl" data-marquee><span>${esc(C.journey.marquee.repeat(6))}</span></div></div>
  <canvas class="gl" data-gl aria-hidden="true"></canvas>`;
}

/* ------------------------------------------------------------------ hero (product) */
function heroApp() {
  const a = C.hero.app;
  const st = (s) => (s === 'done' ? `<i class="dot dot--done">${icon('check')}</i>` : s === 'active' ? '<i class="dot dot--active"></i>' : s === 'warn' ? '<i class="dot dot--warn">!</i>' : '<i class="dot"></i>');
  const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return `<div class="app" data-app aria-label="Illustrative HaulerHub shipment record" role="img">
    <aside class="app__side" aria-hidden="true">
      <span class="app__mark">${mark(22)}</span>
      <ul>${a.nav.map((n, i) => `<li class="${i === 0 ? 'is-on' : ''}"><i></i>${esc(n)}</li>`).join('')}</ul>
    </aside>
    <div class="app__main">
      <div class="app__top"><span class="mono">Shipments / <b>${esc(a.id)}</b></span><span class="app__search">Search shipments, parties, documents</span><span class="app__avatars">${a.parties.map(([r, n]) => `<i title="${esc(r)}">${esc(initials(n))}</i>`).join('')}</span></div>
      <div class="app__title"><div><p class="mono">${esc(a.id)} · Multimodal · 4 legs</p><h3>${esc(a.route[0])} <span>→</span> ${esc(a.route[1])}</h3></div><span class="pill pill--accent">${esc(a.status)}</span></div>
      <div class="app__grid">
        <div class="app__card app__map">
          <p class="app__label">Route</p>
          <svg viewBox="0 0 480 170" aria-hidden="true">
            <defs><pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" fill="currentColor" opacity=".16"/></pattern></defs>
            <rect width="480" height="170" fill="url(#dots)"/>
            <path class="rt rt--road" d="M40 112 C 70 104, 92 100, 118 98"/>
            <path class="rt rt--sea" d="M118 98 C 190 40, 270 44, 318 82"/>
            <path class="rt rt--rail" d="M318 82 C 340 90, 356 92, 378 88"/>
            <path class="rt rt--air" d="M378 88 C 400 50, 428 46, 446 62"/>
            ${[[40, 112, 'Chicago'], [118, 98, 'New York'], [318, 82, 'Istanbul'], [378, 88, 'Baku'], [446, 62, 'Tashkent']].map(([x, y, n], i) => `<g class="node${i === 4 ? ' node--end' : ''}"><circle cx="${x}" cy="${y}" r="4.5"/><text x="${x}" y="${y + 18}">${n}</text></g>`).join('')}
            <circle class="rt-dot" r="5" cx="230" cy="52"/>
          </svg>
        </div>
        <div class="app__card app__legs">
          <p class="app__label">Legs</p>
          <ol>${a.legs.map(([m, l, r, s, state]) => `<li class="is-${state}">${st(state)}<span class="app__mode">${icon(modeIcon[m])}</span><div><b>${esc(l)} · ${esc(r)}</b><span>${esc(s)}</span></div></li>`).join('')}</ol>
        </div>
        <div class="app__card app__parties">
          <p class="app__label">Connected parties <span class="live"><i></i>Live</span></p>
          <ul>${a.parties.map(([r, n, s]) => `<li><i class="av">${esc(initials(n))}</i><div><b>${esc(n)}</b><span>${esc(r)} · ${esc(s)}</span></div><i class="link"></i></li>`).join('')}</ul>
        </div>
        <div class="app__card app__docs">
          <p class="app__label">Documents</p>
          <ul>${a.docs.map(([d, s]) => `<li>${st(s)}<span>${esc(d)}</span></li>`).join('')}</ul>
        </div>
        <div class="app__card app__cost">
          <p class="app__label">Costs</p>
          <dl>${a.cost.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </div>
      </div>
    </div>
  </div>`;
}

function heroFloats() {
  const f = C.hero.app.floats;
  return `<div class="float float--match" data-float aria-hidden="true"><p class="mono">${esc(f.match.tag)}</p><b>${esc(f.match.title)}</b><ul>${f.match.items.map((i) => `<li>${icon('check')}${esc(i)}</li>`).join('')}</ul></div>
  <div class="float float--toast" data-float aria-hidden="true"><span class="float__ic">${icon('check')}</span><div><p class="mono">${esc(f.toast.tag)}</p><b>${esc(f.toast.title)}</b><span>${esc(f.toast.meta)}</span></div></div>
  <div class="float float--paid" data-float aria-hidden="true"><span class="float__ic float__ic--accent">${icon('check')}</span><div><p class="mono">${esc(f.paid.tag)}</p><b>${esc(f.paid.title)}</b><span>${esc(f.paid.meta)}</span></div></div>`;
}

function hero() {
  const h = C.hero;
  return `<section class="hero" id="product" data-theme="light" data-hero>
    <div class="hero__copy">
      <p class="eyebrow" data-rv><i></i>${esc(h.eyebrow)}</p>
      <h1 class="h-xl" data-split>${lines(h.title, 'muted')}</h1>
      <p class="lede" data-rv>${esc(h.body)}</p>
      <div class="ctas" data-rv>${btn(h.primary, C.links.demo)}${btn(h.secondary, '#network', 'btn--ghost')}</div>
    </div>
    <div class="hero__stage" data-hero-stage>
      <div class="hero__tilt" data-hero-tilt>${heroApp()}${heroFloats()}</div>
      <p class="caption mono">${esc(h.app.caption)}</p>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ problem */
function problem() {
  const p = C.problem;
  const ic = { mail: '✉', call: '☏', sheet: '▦', pdf: 'PDF', chat: '❝', portal: '⎆' };
  return `<section class="problem" id="problem" data-theme="light" data-problem>
    <div class="problem__pin">
      <div class="problem__copy problem__copy--a" data-pa>
        <p class="eyebrow"><i></i>${esc(p.eyebrow)}</p>
        <h2 class="h-lg">${lines(p.title, 'muted')}</h2>
        <p class="lede">${esc(p.body)}</p>
      </div>
      <div class="problem__copy problem__copy--b" data-pb>
        <p class="eyebrow"><i></i>${esc(p.after.eyebrow)}</p>
        <h2 class="h-lg">${lines(p.after.title, 'muted')}</h2>
        <p class="lede">${esc(p.after.body)}</p>
        <dl class="figs">${p.after.figures.map((f) => `<div><dt data-count="${f.value}">${f.value}</dt><dd>${esc(f.label)}</dd></div>`).join('')}</dl>
        <p class="note mono">${esc(p.after.figuresNote)}</p>
      </div>
      <div class="problem__field" data-field aria-hidden="true">
        <svg class="problem__lines" data-plines></svg>
        ${p.fragments.map(([t, title, meta], i) => `<div class="frag frag--${t}" data-frag="${i}"><span class="frag__ic">${ic[t]}</span><div><b>${esc(title)}</b><span>${esc(meta)}</span></div></div>`).join('')}
        <div class="record" data-record>
          <div class="record__head">${mark(18)}<span class="mono">Shipment record</span><b>HH-20418</b></div>
          <ul>${['Requirements', 'Parties & roles', 'Milestones', 'Documents', 'Costs & settlement'].map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ network (3D) */
function network() {
  const n = C.network;
  const stations = n.stations;
  const panels = stations
    .map(
      (s, i) => `<article class="station" data-station-panel="${i}" ${i ? 'aria-hidden="true"' : ''}>
        <p class="station__n mono"><span>0${i + 1}</span> / 0${stations.length} · ${esc(s.label)}</p>
        <h3 class="h-md">${esc(s.caption)}</h3>
        <p class="station__label mono">Who is here</p>
        <ul class="chips">${s.parties.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <p class="station__label mono">What HaulerHub does</p>
        <ul class="does">${s.does.map((d) => `<li>${icon('check')}<span>${esc(d)}</span></li>`).join('')}</ul>
      </article>`,
    )
    .join('');
  const hotspots = stations
    .flatMap((s, i) =>
      s.hotspots.map(
        (h, j) => `<div class="hs" data-hs="${i}-${j}" data-station="${i}">
          <button class="hs__btn" type="button" aria-expanded="false" aria-controls="hs-${i}-${j}"><span class="sr-only">${esc(h.title)}</span>${icon('plus')}</button>
          <div class="hs__card" id="hs-${i}-${j}" role="group" aria-label="${esc(h.title)}">
            <p class="hs__tag mono">${esc(h.tag)}</p>
            <p class="hs__title">${esc(h.title)}</p>
            <ul class="hs__chips">${h.chips.map((c, k) => `<li class="c${k}">${esc(c)}</li>`).join('')}</ul>
            <p class="hs__text">${esc(h.text)}</p>
            <dl>${h.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
            ${h.role ? `<a class="hs__link" href="./${C.roles[h.role].slug}/">For ${esc(C.roles[h.role].label.toLowerCase())} ${icon('arrow')}</a>` : ''}
          </div>
        </div>`,
      ),
    )
    .join('');
  return `<section class="network" id="network" data-theme="light" data-network style="--bands:${stations.length + 1}">
    <div class="network__pin">
      <header class="network__head" data-nhead>
        <p class="eyebrow"><i></i>${esc(n.eyebrow)}</p>
        <h2 class="h-lg">${lines(n.title, 'muted')}</h2>
      </header>
      <div class="network__panels">${panels}</div>
      <div class="network__hs" data-hotspots>${hotspots}</div>
      <nav class="tabs" aria-label="Stations" data-tabs>
        <span class="tabs__line"><i data-tabs-fill></i></span>
        ${stations.map((s, i) => `<button type="button" data-tab="${i}" class="${i ? '' : 'is-on'}"><span class="mono">0${i + 1}</span>${icon(modeIcon[s.key])}<b>${esc(s.label)}</b></button>`).join('')}
      </nav>
      <p class="network__hint mono" data-nhint>${esc(n.hint)}</p>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ journey */
function journey() {
  const j = C.journey;
  const chapters = j.chapters
    .map((c, i) => {
      let extra = '';
      if (c.cards) extra = `<div class="jcards" data-jcards>${c.cards.map(([who, t, b], k) => `<div class="jcard"><span class="mono">${esc(who)}</span><b>0${k + 1} ${esc(t)}</b><p>${esc(b)}</p></div>`).join('')}</div>`;
      if (c.points) extra = `<ul class="jpoints">${c.points.map((p) => `<li>${icon('check')}${esc(p)}</li>`).join('')}</ul>`;
      if (c.flow) extra = `<ol class="jflow">${c.flow.map((f) => `<li><i>${icon('check')}</i>${esc(f)}</li>`).join('')}</ol>`;
      return `<article class="chapter chapter--${c.key}" data-chapter="${i}">
        <p class="chapter__n mono"><span>${c.n}</span>${esc(c.label)}</p>
        <h2 class="h-lg">${lines(c.title, 'muted')}</h2>
        <p class="chapter__body">${esc(c.body)}</p>
        ${extra}
      </article>`;
    })
    .join('');
  const log = j.chapters.flatMap((c, i) => c.events.map(([who, what], k) => `<li data-ev="${i}" style="--k:${k}"><i class="av">${esc(who.split(' ').map((w) => w[0]).join('').slice(0, 2))}</i><div><b>${esc(what)}</b><span>${esc(who)}</span></div><span class="mono t">${esc(c.label)}</span></li>`)).join('');
  return `<section class="journey" id="journey" data-theme="light" data-journey>
    <div class="journey__pin">
      <div class="journey__intro" data-jintro><p class="eyebrow"><i></i>${esc(j.eyebrow)}</p></div>
      <div class="hud mono" data-hud aria-hidden="true"><span>${esc(j.hud.speed)} <b data-speed>00</b> km/h</span><span>${esc(j.hud.leg)} <b data-leg>01</b>/06</span><span data-mode>${esc(j.chapters[0].label)}</span></div>
      <div class="chapters">${chapters}</div>
      <aside class="jrec" data-jrec aria-label="Shipment record activity (illustrative)">
        <div class="jrec__head">${mark(16)}<span class="mono">HH-20418 · Activity</span><span class="live"><i></i>Live</span></div>
        <ol class="jrec__log" data-jlog>${log}</ol>
        <div class="jrec__legs">${['road', 'rail', 'sea', 'air', 'hub'].map((m, i) => `<span data-jleg="${i}">${icon(modeIcon[m])}</span>`).join('<i></i>')}</div>
      </aside>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ platform */
function platformSection(eyebrow, title, items, id = 'platform', theme = 'dark') {
  return `<section class="platform" id="${id}" data-theme="${theme}" data-platform style="--n:${items.length}">
    <header class="platform__head">
      <p class="eyebrow"><i></i>${esc(eyebrow)}</p>
      <h2 class="h-lg" data-split>${lines(title, 'muted')}</h2>
    </header>
    <div class="platform__pin">
      <ol class="plist" data-plist>${items.map((m, i) => `<li><button type="button" data-pi="${i}" class="${i ? '' : 'is-on'}"><span class="mono">0${i + 1}</span>${esc(m.label)}</button></li>`).join('')}</ol>
      <div class="pstage">${items
        .map(
          (m, i) => `<article class="pmod${i ? '' : ' is-on'}" data-pmod="${i}">
          <div class="pmod__text"><p class="mono">0${i + 1} · ${esc(m.label)}</p><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>${btn(C.nav.demo, C.links.demo, 'btn--line')}</div>
          <div class="pmod__ui">${renderUI(m.ui)}</div>
        </article>`,
        )
        .join('')}</div>
      <div class="pbar"><i data-pbar></i></div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ roles grid */
function rolesGrid(root, exclude) {
  const g = C.rolesGrid;
  const keys = C.roleOrder.filter((k) => k !== exclude);
  return `<section class="roles" id="roles" data-theme="light">
    <header class="roles__head"><p class="eyebrow"><i></i>${esc(g.eyebrow)}</p><h2 class="h-lg" data-split>${lines(g.title, 'muted')}</h2></header>
    <ul class="rtiles">${keys
      .map(
        (k, i) => `<li><a class="rtile" href="${pageUrl(root, k)}" data-transition>
        <span class="rtile__n mono">0${i + 1}</span>
        <span class="rtile__img"><img data-thumb="${C.roles[k].thumb}" alt="" width="320" height="220" /></span>
        <b>${esc(C.roles[k].label)}</b><span class="rtile__line">${esc(C.roles[k].line)}</span>
        <span class="rtile__go mono">${esc(g.explore)} ${icon('arrow')}</span>
      </a></li>`,
      )
      .join('')}
      <li><a class="rtile rtile--demo" href="${esc(C.links.demo)}"><span class="rtile__n mono">${mark(18)}</span><b>${esc(g.demo.title)}</b><span class="rtile__line">${esc(g.demo.body)}</span><span class="rtile__go mono">${esc(g.demo.cta)} ${icon('arrow')}</span></a></li>
    </ul>
  </section>`;
}

/* ------------------------------------------------------------------ faq, cta, footer */
function faq() {
  const f = C.faq;
  return `<section class="faq" id="faq" data-theme="light">
    <header><h2 class="h-lg">${esc(f.title)}</h2><p>${esc(f.sub)}</p></header>
    <div class="faq__list">${f.items.map(([q, a], i) => `<details><summary><span class="mono">0${i + 1}</span>${esc(q)}<i>${icon('plus')}</i></summary><p>${esc(a)}</p></details>`).join('')}</div>
  </section>`;
}

function cta() {
  return `<section class="cta" data-theme="dark" data-cursor-zone="${esc(C.cta.cursor)}" data-cursor-href="${esc(C.links.demo)}">
    <div class="cta__rings" aria-hidden="true">${'<i></i>'.repeat(5)}</div>
    <h2 class="h-xl" data-split>${lines(C.cta.title, 'muted')}</h2>
    <p class="lede">${esc(C.cta.body)}</p>
    ${btn(C.cta.button, C.links.demo)}
  </section>`;
}

function footer(root, page) {
  const f = C.footer;
  const home = page === 'home';
  const navHref = (h) => (home ? h : `${root}${h}`);
  return `<footer class="footer" data-theme="light">
    <div class="footer__marquee mono" aria-hidden="true"><span>${f.marquee.map((m) => `${esc(m)} <i>●</i> `).join('').repeat(3)}</span></div>
    <div class="footer__grid">
      <div class="footer__brand">${logo()}<p>${esc(C.site.tagline)}</p>${btn(C.nav.demo, C.links.demo)}</div>
      <nav aria-label="${esc(f.cols.site)}"><p class="mono">${esc(f.cols.site)}</p><ul>${C.nav.items.map(([l, h]) => `<li><a href="${navHref(h)}">${esc(l)}</a></li>`).join('')}<li><a href="${navHref('#faq')}">F.A.Q</a></li></ul></nav>
      <nav aria-label="${esc(f.cols.roles)}"><p class="mono">${esc(f.cols.roles)}</p><ul>${C.roleOrder.map((k) => `<li><a href="${pageUrl(root, k)}">${esc(C.roles[k].label)}</a></li>`).join('')}</ul></nav>
      <div><p class="mono">${esc(f.cols.company)}</p><p>${esc(f.location)}</p><p>${esc(f.company)}</p></div>
    </div>
    <div class="footer__word"><canvas data-particles aria-hidden="true"></canvas><span class="footer__word-fallback" aria-hidden="true">HAULERHUB</span></div>
    <div class="footer__legal mono"><span>${esc(f.copyright)}</span><span>${esc(f.disclaimer)}</span></div>
  </footer>`;
}

/* ------------------------------------------------------------------ persona hero */
function personaHero(page, root) {
  const P = C.pages[page];
  const h = P.hero;
  return `<section class="phero" id="product" data-theme="light" data-phero data-station-key="${h.station}">
    <div class="phero__copy">
      <p class="crumbs mono"><a href="${root}">HaulerHub</a> / ${esc(C.roles[page].label)}</p>
      <p class="eyebrow" data-rv><i></i>${esc(h.eyebrow)}</p>
      <h1 class="h-xl" data-split>${lines(h.title, 'muted')}</h1>
      <p class="lede" data-rv>${esc(h.body)}</p>
      <div class="ctas" data-rv>${btn(h.primary, C.links.start)}${btn(C.nav.demo, C.links.demo, 'btn--ghost')}</div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ pages */
export function renderPage(page, { depth = 0 } = {}) {
  const root = depth ? '../'.repeat(depth) : './';
  let main;
  let meta;
  if (page === 'home') {
    meta = { title: 'HaulerHub · Every mode. Every party. One shipment record.', description: C.site.description };
    main = [
      hero(),
      problem(),
      network(),
      journey(),
      platformSection(C.platform.eyebrow, C.platform.title, C.platform.modules),
      rolesGrid(root),
      faq(),
      cta(),
    ].join('');
  } else {
    const P = C.pages[page];
    meta = P.meta;
    main = [
      personaHero(page, root),
      platformSection(C.personaPage.stepsEyebrow, P.hero.title, P.steps, 'steps', 'dark'),
      rolesGrid(root, page),
      cta(),
    ].join('');
  }
  const body = `${chrome(page, root)}
  <main id="main" tabindex="-1">${main}</main>
  ${footer(root, page)}`;
  return { htmlAttrs: `class="no-js" data-page="${page}" data-root="${root}"`, head: head(page, meta), body };
}
