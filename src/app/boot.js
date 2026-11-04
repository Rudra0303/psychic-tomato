/**
 * Boot: loader → header/cursor/transitions → product hero → sections → lazy 3D (network + journey + role thumbnails).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as C from '../content.js';
import { setupHeader, setupCursor, setupTransitions, cameFromTransition } from './chrome.js';
import { setupReveals, setupHero, setupProblem, setupPlatforms, setupParticles } from './sections.js';

gsap.registerPlugin(ScrollTrigger);
const html = document.documentElement;

export async function boot() {
  const reduced = html.classList.contains('rm');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    lenis.stop();
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));

  // 3D chunk starts downloading immediately; it initialises after the loader.
  const glReady = import('./story.js').catch((e) => {
    console.warn('[HaulerHub] 3D unavailable', e);
    return null;
  });

  const header = setupHeader(lenis);
  setupCursor(reduced);
  setupTransitions(reduced);
  const reveals = setupReveals(reduced);
  const hero = setupHero(reduced);
  setupProblem(reduced);
  setupPlatforms(lenis);
  setupParticles(reduced);
  gsap.ticker.add(() => header.update(window.scrollY));

  await runLoader(reduced, document.fonts.ready);
  lenis?.start();
  reveals.heroIn();
  hero.intro();

  const story = await glReady;
  if (story) {
    try {
      const api = await story.start({ lenis, reduced });
      window.__hh = { lenis, gsap, ScrollTrigger, ...api };
    } catch (e) {
      console.error('[HaulerHub] 3D failed to start', e);
      html.classList.add('no-webgl');
    }
  }
  ScrollTrigger.refresh();
  if (location.hash.length > 1) {
    const t = document.querySelector(location.hash);
    if (t) setTimeout(() => (lenis ? lenis.scrollTo(t, { immediate: true }) : t.scrollIntoView()), 60);
  }
  window.__hh = window.__hh || { lenis, gsap, ScrollTrigger };

  // in-page anchors use the smooth scroller
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const t = id.length > 1 && document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (id === '#main') return t.focus();
      lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView();
    }),
  );
}

async function runLoader(reduced, fonts) {
  const el = document.querySelector('[data-loader]');
  if (!el) return;
  const fromPage = cameFromTransition();
  const word = el.querySelector('[data-loader-word]');
  const count = el.querySelector('[data-loader-count]');
  if (reduced) {
    await fonts;
    el.remove();
    return;
  }
  const words = C.loader.words;
  const minTime = fromPage ? 500 : 1700;
  const t0 = performance.now();
  let i = 0;
  const iv = setInterval(() => {
    i = (i + 1) % words.length;
    word.textContent = words[i];
  }, 330);
  const o = { v: 0 };
  const tw = gsap.to(o, { v: 100, duration: minTime / 1000, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(o.v)).padStart(2, '0')) });
  await Promise.race([fonts, new Promise((r) => setTimeout(r, 3000))]);
  const wait = minTime - (performance.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  tw.progress(1);
  clearInterval(iv);
  word.textContent = words[words.length - 1];
  await gsap.to(el, { clipPath: 'circle(0% at 50% 50%)', duration: fromPage ? 0.7 : 1.1, ease: 'expo.inOut' });
  el.remove();
}
