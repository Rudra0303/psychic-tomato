/**
 * Renders a full page (head + body markup) from src/content.js.
 * Runs in Node at dev/build time via the plugin in vite.config.js. No browser APIs here.
 */
import * as C from '../content.js';
import { renderPanel, esc } from './panels.js';
import { icon, logomark } from './icons.js';

const PERSONA_LEN = 240; // section length (in viewport heights x100) per persona moment

function makeHref(root) {
  return (href) => {
    if (!href) return '#';
    if (href === 'demo') return C.links.demo;
    if (href === 'start') return C.links.getStarted;
    if (href.startsWith('page:')) return pageUrl(root, href.slice(5));
    return href;
  };
}

function pageUrl(root, page) {
  if (page === 'home') return root;
  return `${root}${C.personas[page].slug}/`;
}

const btn = (label, href, cls = 'btn--lime', arrow = true) =>
  `<a class="btn ${cls}" href="${esc(href)}"><span>${esc(label)}</span>${arrow ? icon('arrow', 'icon btn__icon') : ''}</a>`;

/* ------------------------------- shared chrome ------------------------------- */

function head(page, meta, root) {
  const slug = page === 'home' ? '' : `${C.personas[page].slug}/`;
  const url = `${C.site.url}/${slug}`;
  const img = `${C.site.url}/${C.site.ogImage}`;
  return `<meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${esc(meta.title)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <meta name="theme-color" content="${C.site.themeColor}" />
    <meta name="color-scheme" content="dark light" />
    <link rel="canonical" href="${esc(url)}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(C.site.name)}" />
    <meta property="og:title" content="${esc(meta.title)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(img)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="A white HaulerHub tractor-trailer on a night highway, connected by lime lines" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(meta.title)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <meta name="twitter:image" content="${esc(img)}" />
    <script>document.documentElement.classList.replace('no-js','js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced-motion')}catch(e){}</script>`;
}

function nav(page, root, href) {
  const items = C.personaOrder
    .map((k) => {
      const p = C.personas[k];
      const current = k === page ? ' aria-current="page"' : '';
      return `<li><a href="${pageUrl(root, k)}"${current}>${icon(k, 'icon menu__icon')}<span><b>${esc(p.plural)}</b><small>${esc(p.menuNote)}</small></span></a></li>`;
    })
    .join('');
  return `<a class="skip-link" href="#main">${esc(C.nav.skip)}</a>
  <header class="nav" data-nav>
    <div class="nav__bar">
      <a class="nav__logo" href="${root}" aria-label="HaulerHub home">${logomark(30)}<span>HaulerHub</span></a>
      <nav class="nav__links" aria-label="Primary">
        <div class="nav__menu" data-menu>
          <button class="nav__trigger" type="button" aria-expanded="false" aria-controls="menu-solutions">${esc(C.nav.menuLabel)}${icon('chevron', 'icon nav__chev')}</button>
          <div class="nav__dropdown" id="menu-solutions" data-dropdown>
            <ul class="menu">${items}</ul>
          </div>
        </div>
        <a class="nav__link" href="${root}#fragment">${esc(C.nav.howItWorks)}</a>
      </nav>
      <a class="btn btn--lime btn--sm nav__cta" href="${esc(href('demo'))}"><span>${esc(C.nav.demo)}</span></a>
      <button class="nav__burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="${esc(C.ui.menuOpen)}" data-burger>${icon('menu')}${icon('close', 'icon icon--close')}</button>
    </div>
    <div class="nav__mobile" id="mobile-menu" data-mobile-menu>
      <ul class="menu">${items}</ul>
      <a class="nav__link" href="${root}#fragment">${esc(C.nav.howItWorks)}</a>
      ${btn(C.nav.demo, href('demo'))}
    </div>
  </header>`;
}

function stage(withNodes) {
  const labels = withNodes
    ? C.personaOrder
        .map((k) => `<span class="node-label" data-node="${k}">${icon(k)}<b>${esc(C.personas[k].node)}</b></span>`)
        .join('')
    : '';
  return `<div class="stage" aria-hidden="true">
    <canvas class="stage__canvas" data-canvas></canvas>
    <div class="stage__fallback"></div>
    <div class="stage__labels" data-labels>${labels}</div>
    <svg class="stage__connector" data-connector><path d="" /><circle r="4" /><circle class="ring" r="9" /></svg>
    <div class="stage__grade"></div>
  </div>`;
}

function preloader() {
  return `<div class="preloader" data-preloader>
    <div class="preloader__inner">
      ${logomark(56)}
      <p class="preloader__word">HaulerHub</p>
      <div class="preloader__bar" role="progressbar" aria-label="${esc(C.ui.loading)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-bar></span></div>
      <p class="preloader__meta"><span>${esc(C.site.tagline)}</span><span><b data-pct>0</b>%</span></p>
    </div>
  </div>`;
}

function switcher(page, root, onLanding) {
  const items = C.personaOrder
    .map((k) => {
      const p = C.personas[k];
      const h = onLanding ? `#${k}` : pageUrl(root, k);
      const current = !onLanding && k === page ? ' aria-current="page"' : '';
      return `<li><a href="${h}" data-target="${k}"${current}>${icon(k)}<span>${esc(p.label)}</span></a></li>`;
    })
    .join('');
  return `<nav class="switcher" aria-label="${esc(C.ui.switcherLabel)}" data-switcher${onLanding ? '' : ' data-static'}>
    <p class="switcher__label">${esc(C.ui.switcherLabel)}</p>
    <ul>${items}</ul>
    <span class="switcher__glider" aria-hidden="true"></span>
  </nav>`;
}

function capabilities() {
  const cap = C.capabilities;
  return `<div class="capabilities">
      <h2 class="h3">${esc(cap.title)}</h2>
      <ul class="cap-list">${cap.items
        .map(([t, d]) => `<li data-reveal><span class="cap-list__mark"></span><b>${esc(t)}</b><span>${esc(d)}</span></li>`)
        .join('')}</ul>
      <div class="figures" data-placeholder="figures">
        ${cap.figures
          .map((f) => `<div class="figure" data-reveal><b data-count="${f.value}">${f.value}</b><span>${esc(f.label)}</span></div>`)
          .join('')}
      </div>
      <p class="placeholder-note">${icon('info')} ${esc(cap.figuresNote)}</p>
    </div>`;
}

function footer(root) {
  const f = C.footer;
  const items = C.personaOrder.map((k) => `<li><a href="${pageUrl(root, k)}">${esc(C.personas[k].plural)}</a></li>`).join('');
  return `<footer class="footer">
    <div class="footer__top">
      <div>
        <a class="nav__logo" href="${root}" aria-label="HaulerHub home">${logomark(30)}<span>HaulerHub</span></a>
        <p class="footer__line">${esc(f.line)}</p>
      </div>
      <nav aria-label="Footer"><p class="footer__h">${esc(C.nav.menuLabel)}</p><ul>${items}</ul></nav>
      <div><p class="footer__h">${esc(C.site.tagline)}</p><p>${esc(f.location)}</p><p>${esc(f.company)}</p></div>
    </div>
    <div class="footer__bottom"><span>${esc(f.copyright)}</span><span>${esc(f.disclaimer)}</span></div>
  </footer>`;
}

/* ------------------------------- moments ------------------------------- */

function heroMoment(h, href, id = 'top') {
  const [l1, l2] = h.title;
  return `<section class="moment moment--hero" id="${id}" data-shot="${h.shot}" data-speed="1" style="--len:170">
    <div class="moment__inner">
      <div class="moment__copy copy--hero">
        <p class="eyebrow" data-reveal><span class="eyebrow__dot"></span>${esc(h.eyebrow)}</p>
        <h1 class="display" data-split><span class="display__l1">${esc(l1)}</span> <span class="display__l2">${esc(l2)}</span></h1>
        <p class="lede" data-reveal>${esc(h.body)}</p>
        <div class="cta-row" data-reveal>
          ${btn(h.primary.label, href(h.primary.href))}
          ${h.secondary ? btn(h.secondary.label, href(h.secondary.href), 'btn--ghost', false) : ''}
        </div>
      </div>
      ${h.scrollHint ? `<p class="scroll-hint" data-hint><span class="scroll-hint__line"></span>${esc(h.scrollHint)}</p>` : ''}
    </div>
  </section>`;
}

function fragmentMoment(f) {
  const step = (s, k) => `<div class="moment__copy copy--story" data-step="${k}">
      <p class="eyebrow" data-reveal><span class="eyebrow__dot"></span>${esc(s.eyebrow)}</p>
      <h2 class="h2" data-split>${esc(s.title)}</h2>
      <p class="lede" data-reveal>${esc(s.body)}</p>
    </div>`;
  return `<section class="moment moment--fragment" id="fragment" data-shot="${f.shot}" data-shot-b="${f.shotB}" data-story="fragment" data-speed="0.8" style="--len:380">
    <div class="moment__inner">
      ${step(f.a, 'a')}
      ${step(f.b, 'b')}
      <p class="sr-only">${C.personaOrder.map((k) => esc(C.personas[k].node)).join(', ')}.</p>
    </div>
  </section>`;
}

function personaMoment({ id, m, index, href, persona, len = PERSONA_LEN }) {
  const points = (m.points || [])
    .map((p) =>
      Array.isArray(p)
        ? `<li data-reveal>${icon('check', 'icon points__icon')}<span><b>${esc(p[0])}</b> ${esc(p[1])}</span></li>`
        : `<li data-reveal>${icon('check', 'icon points__icon')}<span>${esc(p)}</span></li>`,
    )
    .join('');
  return `<section class="moment moment--persona side-${m.side}" id="${id}" data-shot="${m.shot}" data-anchor="${m.anchor}"${persona ? ` data-persona="${persona}"` : ''} data-speed="0.7" style="--len:${len}">
    <div class="moment__inner">
      <div class="moment__copy copy--persona">
        <p class="eyebrow" data-reveal>${index ? `<span class="eyebrow__index">${esc(index)}</span>` : '<span class="eyebrow__dot"></span>'}${esc(m.eyebrow)}</p>
        <h2 class="h2" data-split>${esc(m.title)}</h2>
        ${m.body ? `<p class="lede" data-reveal>${esc(m.body)}</p>` : ''}
        <ul class="points">${points}</ul>
        ${m.cta ? `<div class="cta-row" data-reveal>${btn(m.cta.label, href(m.cta.href))}</div>` : ''}
      </div>
      <div class="moment__panel">${renderPanel(C.panels[m.panel], m.panel)}</div>
    </div>
  </section>`;
}

function payoffMoment(p) {
  return `<section class="moment moment--payoff" id="payoff" data-shot="${p.shot}" data-story="payoff" data-speed="0" style="--len:320">
    <div class="moment__inner">
      <div class="payoff__head">
        <p class="eyebrow" data-reveal><span class="eyebrow__dot"></span>${esc(p.eyebrow)}</p>
        <h2 class="h2" data-split>${esc(p.title)}</h2>
        <p class="lede" data-reveal>${esc(p.body)}</p>
      </div>
      <div class="payoff__flow">
        <ol class="flow" data-flow>${p.flow
          .map((s, i) => `<li class="flow__step" data-flow-step="${i}"><span class="flow__dot">${icon('check')}</span><b>${esc(s.label)}</b><span>${esc(s.note)}</span></li>`)
          .join('')}<span class="flow__rail" aria-hidden="true"><i></i></span></ol>
        <p class="caption">${esc(p.flowCaption)}</p>
      </div>
      <dl class="values">${p.values
        .map(([k, v]) => `<div data-value><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join('')}</dl>
    </div>
  </section>`;
}

function statementMoment(s, href) {
  return `<section class="moment moment--statement" id="statement" data-shot="${s.shot}" data-speed="1.2" style="--len:180">
    <div class="moment__inner">
      <div class="moment__copy copy--center">
        <h2 class="display display--statement" data-split>${s.title.map((l) => `<span>${esc(l)}</span>`).join(' ')}</h2>
        <p class="lede" data-reveal>${esc(s.body)}</p>
        <div class="cta-row" data-reveal>${btn(s.primary.label, href(s.primary.href))}</div>
      </div>
    </div>
  </section>`;
}

function roleCards(root, exclude) {
  const cards = C.landing.closing.cards;
  return C.personaOrder
    .filter((k) => k !== exclude)
    .map(
      (k) => `<li class="role-card" data-reveal>
        <a href="${pageUrl(root, k)}">
          <span class="role-card__icon">${icon(k)}</span>
          <span class="role-card__who">${esc(C.personas[k].plural)}</span>
          <b>${esc(cards[k].title)}</b>
          <span class="role-card__cta">${esc(cards[k].cta)} ${icon('arrow')}</span>
        </a>
      </li>`,
    )
    .join('');
}

function closingLanding(root, href) {
  const c = C.landing.closing;
  return `<section class="light" id="start" data-light>
    <div class="light__wrap">
      <header class="light__head">
        <p class="eyebrow eyebrow--dark" data-reveal><span class="eyebrow__dot"></span>${esc(c.eyebrow)}</p>
        <h2 class="h2" data-split>${esc(c.title)}</h2>
        <p class="lede" data-reveal>${esc(c.body)}</p>
      </header>
      <ul class="role-cards">${roleCards(root)}
        <li class="role-card role-card--demo" data-reveal>
          <a href="${esc(href('demo'))}">
            <span class="role-card__icon">${icon('link')}</span>
            <span class="role-card__who">${esc(C.nav.demo)}</span>
            <b>${esc(c.demo.title)}</b>
            <span class="role-card__body">${esc(c.demo.body)}</span>
            <span class="role-card__cta">${esc(c.demo.cta)} ${icon('arrow')}</span>
          </a>
        </li>
      </ul>
      ${capabilities()}
    </div>
    ${footer(root)}
  </section>`;
}

function closingPersona(page, root, href) {
  const P = C.pages[page];
  const j = C.journey;
  return `<section class="light" id="start" data-light>
    <div class="light__wrap">
      <header class="light__head">
        <p class="eyebrow eyebrow--dark" data-reveal><span class="eyebrow__dot"></span>${esc(C.personas[page].plural)}</p>
        <h2 class="h2" data-split>${esc(j.title)}</h2>
      </header>
      <ol class="journey">${j.steps
        .map(([t, d], i) => `<li data-reveal><span class="journey__n">0${i + 1}</span><b>${esc(t)}</b><span>${esc(d)}</span></li>`)
        .join('')}</ol>
      <ul class="feature-grid">${P.features
        .map(([t, d]) => `<li data-reveal><span class="cap-list__mark"></span><b>${esc(t)}</b><span>${esc(d)}</span></li>`)
        .join('')}</ul>
      <div class="cta-band" data-reveal>
        <div><h2 class="h3">${esc(P.cta.title)}</h2><p>${esc(P.cta.body)}</p></div>
        <div class="cta-row">${btn(P.cta.primary.label, href(P.cta.primary.href), 'btn--navy')}${btn(P.cta.secondary.label, href(P.cta.secondary.href), 'btn--outline', false)}</div>
      </div>
      <div class="other-roles">
        <p class="eyebrow eyebrow--dark"><span class="eyebrow__dot"></span>${esc(C.ui.otherRoles)}</p>
        <ul class="role-cards role-cards--compact">${roleCards(root, page)}</ul>
        <p><a class="text-link" href="${root}">${esc(C.ui.backHome)} ${icon('arrow')}</a></p>
      </div>
    </div>
    ${footer(root)}
  </section>`;
}

/* ------------------------------- pages ------------------------------- */

export function renderPage(page, { depth = 0 } = {}) {
  const root = depth ? '../'.repeat(depth) : './';
  const href = makeHref(root);
  const onLanding = page === 'home';
  let main;
  let meta;

  if (onLanding) {
    const L = C.landing;
    meta = L.meta;
    const personas = C.personaOrder
      .map((k, i) =>
        personaMoment({
          id: k,
          persona: k,
          index: `0${i + 1}`,
          href,
          m: { ...L.personas[k], cta: { label: L.personas[k].cta.label, href: `page:${L.personas[k].cta.page}` } },
        }),
      )
      .join('');
    main = [heroMoment(L.hero, href), fragmentMoment(L.fragment), personas, payoffMoment(L.payoff), statementMoment(L.statement, href), closingLanding(root, href)].join('');
  } else {
    const P = C.pages[page];
    meta = P.meta;
    const moments = P.moments
      .map((m, i) => personaMoment({ id: `step-${i + 1}`, m, href, len: 220 }))
      .join('');
    main = [heroMoment(P.hero, href), moments, closingPersona(page, root, href)].join('');
  }

  const body = `${preloader()}
  ${nav(page, root, href)}
  ${stage(onLanding)}
  <main id="main" tabindex="-1">${main}</main>
  ${switcher(page, root, onLanding)}`;

  return {
    htmlAttrs: `class="no-js" data-page="${page}" data-root="${root}"`,
    head: head(page, meta, root),
    body,
  };
}
