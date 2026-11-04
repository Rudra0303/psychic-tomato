/**
 * Page bootstrap shared by every page:
 * preloader -> fonts -> 3D stage (lazy chunk) -> scroll director -> reveals -> intro.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { setupNav, setupSwitcher, createPreloader } from './ui.js';

gsap.registerPlugin(ScrollTrigger);

const html = document.documentElement;
const params = new URLSearchParams(location.search);

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export async function boot() {
  const reduced = html.classList.contains('reduced-motion') || params.has('reduced');
  if (reduced) html.classList.add('reduced-motion');
  const root = html.dataset.root || './';
  const pre = createPreloader();
  pre.set(0.05);

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // smooth scroll (desktop wheel; native touch scrolling is kept)
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true });
    lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  setupNav({ lenis });

  // fonts first so canvas text (truck livery) and line splitting use the real faces
  const fonts = Promise.race([
    Promise.all([document.fonts.load('700 100px Satoshi'), document.fonts.load('500 16px "DM Sans Variable"')]).then(() => document.fonts.ready),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
  await fonts;
  pre.set(0.18);

  // 3D stage (code-split, so text and styles are never blocked by three.js)
  const stageEl = document.querySelector('.stage');
  const canvas = document.querySelector('[data-canvas]');
  let stage = null;
  let director = null;
  let overlays = null;
  if (canvas && webglAvailable()) {
    try {
      const [{ createStage }, { detectQuality }, { Director }, { createOverlays }] = await Promise.all([
        import('../scene/stage.js'),
        import('../scene/quality.js'),
        import('./director.js'),
        import('./overlays.js'),
      ]);
      pre.set(0.3);
      const quality = detectQuality();
      stage = await createStage({ canvas, quality, root, onProgress: (p) => pre.set(0.3 + p * 0.65) });
      director = new Director(stage, { reduced });
      overlays = createOverlays({ stage, director, reduced });
    } catch (err) {
      console.error('[HaulerHub] 3D scene failed to start', err);
      html.classList.add('no-webgl');
    }
  } else {
    html.classList.add('no-webgl');
  }

  // fallback director (no WebGL): still drives switcher state from scroll
  if (!director) {
    const { Director } = await import('./director.js');
    const fake = { camera: { up: { x: 0, y: 1, z: 0 } }, setView() {}, story: {}, network: { state: {} } };
    director = new Director(fake, { reduced: true });
    director.update = function update(dt, y = window.scrollY) {
      this.state.persona = this.nearestPersona(y);
      this.state.lightCover = Math.min(1, Math.max(0, 1 - (this.lightTop - y) / this.vh));
    };
  }

  const { setupReveals } = await import('./reveal.js');
  const switcher = setupSwitcher({ director, lenis, reduced });

  // first frame before revealing
  director.update(0);
  if (stage) stage.render(0.016);
  await pre.done();

  // main loop (one rAF for scroll, camera, scene and overlays)
  let last = performance.now();
  const debug = params.has('debug') ? makeDebug() : null;
  gsap.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (lenis) lenis.raf(now);
    director.update(dt);
    if (stage) {
      const covered = director.state.inLight && director.state.lightCover >= 1;
      stage.render(dt, { draw: !covered });
      overlays.update(dt);
    }
    switcher.update();
    debug?.(dt, stage);
  });

  const onResize = () => {
    stage?.resize();
    director.measure();
    ScrollTrigger.refresh();
    switcher.relayout?.();
  };
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(onResize, 120);
  });
  ScrollTrigger.addEventListener('refreshInit', () => director.measure());

  // intro: preloader wipes away, canvas fades in, hero copy reveals
  const reveals = setupReveals({ director, reduced });
  html.classList.add('is-ready');
  stageEl?.classList.add('is-ready');
  const intro = gsap.timeline();
  if (pre.el) {
    intro.to(pre.el.querySelector('.preloader__inner'), { autoAlpha: 0, y: -20, duration: reduced ? 0.01 : 0.6, ease: 'power2.in' });
    intro.to(pre.el, { clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0.01 : 1.15, ease: 'expo.inOut' }, '-=0.15');
    intro.set(pre.el, { display: 'none' });
  }
  intro.add(() => {
    reveals.hero?.play();
    lenis?.start();
  }, reduced ? 0 : '-=0.7');
  ScrollTrigger.refresh();

  // jump to a hash target (e.g. /#carrier from another page)
  if (location.hash && location.hash.length > 1) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) {
      const r = director.range(t.id);
      const y = r ? r[0] + (r[1] - r[0]) * 0.18 : t.offsetTop;
      setTimeout(() => (lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), 50);
    }
  }

  // in-page anchor links use the smooth scroller
  document.querySelectorAll('a[href^="#"]:not([data-target])').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const t = id && document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      const r = director.range(id);
      const y = r ? r[0] + (r[1] - r[0]) * 0.2 : t.offsetTop;
      if (lenis) lenis.scrollTo(y, { duration: 2 });
      else window.scrollTo(0, y);
      if (id === 'main') t.focus({ preventScroll: true });
    });
  });

  // expose for screenshots and debugging
  window.__hh = { stage, director, lenis, gsap, ScrollTrigger };
}

function makeDebug() {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:8px;top:80px;z-index:999;font:12px/1.4 monospace;background:rgba(0,0,0,.6);color:#a6f24a;padding:6px 8px;border-radius:6px;pointer-events:none';
  document.body.appendChild(el);
  let acc = 0;
  let n = 0;
  return (dt, stage) => {
    acc += dt;
    n++;
    if (acc > 0.5) {
      const info = stage ? stage.renderer.info.render : {};
      el.textContent = `${Math.round(n / acc)} fps · ${info.calls ?? '-'} calls · ${info.triangles ?? '-'} tris · dpr ${stage?.renderer.getPixelRatio().toFixed(2)} · ${stage?.Q.tier}`;
      acc = 0;
      n = 0;
    }
  };
}
