/**
 * Text and panel reveals. Each moment builds one paused GSAP timeline; a ScrollTrigger plays
 * it when the moment's sticky inner settles into view and reverses it on the way out.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

function splitLines(el) {
  const s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
  return s.lines;
}

function buildTimeline(scope, { panel } = {}) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  const eyebrow = scope.querySelector('.eyebrow[data-reveal]');
  const heads = [...scope.querySelectorAll('[data-split]')];
  const rest = [...scope.querySelectorAll('[data-reveal]')].filter((e) => e !== eyebrow);
  if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, y: 14, duration: 0.9 }, 0);
  heads.forEach((h, i) => {
    const lines = splitLines(h);
    tl.from(lines, { yPercent: 118, duration: 1.25, stagger: 0.085 }, 0.06 + i * 0.1);
  });
  if (rest.length) tl.from(rest, { autoAlpha: 0, y: 26, duration: 1.05, stagger: 0.075 }, 0.32);
  if (panel) {
    const blocks = panel.querySelectorAll('[data-pb]');
    tl.from(panel, { autoAlpha: 0, y: 46, rotateX: 14, scale: 0.95, transformOrigin: '50% 100%', duration: 1.4 }, 0.22);
    tl.from(blocks, { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.45);
  }
  return tl;
}

export function setupReveals({ director, reduced }) {
  const api = { hero: null, timelines: [] };
  if (reduced) {
    document.querySelectorAll('[data-count]').forEach((el) => (el.textContent = el.dataset.count));
    return api;
  }

  const toggler = (tl) => (self) => {
    if (self.isActive) tl.timeScale(1).play();
    else tl.timeScale(1.9).reverse();
  };

  document.querySelectorAll('.moment').forEach((sec) => {
    const inner = sec.querySelector('.moment__inner');
    const steps = [...sec.querySelectorAll('[data-step]')];
    if (steps.length) {
      // fragment: two copy blocks in the same place, swapped by scroll progress
      steps.forEach((step, i) => {
        const tl = buildTimeline(step);
        api.timelines.push(tl);
        const r = () => director.range(sec.id);
        ScrollTrigger.create({
          trigger: sec,
          start: () => (i === 0 ? r()[0] - director.vh * 0.7 : r()[0] + (r()[1] - r()[0]) * 0.56),
          end: () => (i === 0 ? r()[0] + (r()[1] - r()[0]) * 0.44 : r()[1] + director.vh * 0.15),
          onToggle: toggler(tl),
        });
      });
      return;
    }
    const panel = sec.querySelector('.moment__panel');
    const tl = buildTimeline(inner, { panel });
    api.timelines.push(tl);
    if (sec.classList.contains('moment--hero')) {
      api.hero = tl;
      ScrollTrigger.create({ trigger: sec, start: -1, end: 'bottom 115%', onToggle: (self) => (self.isActive ? tl.timeScale(1).play() : tl.timeScale(1.9).reverse()) });
      return;
    }
    if (sec.classList.contains('moment--payoff')) {
      const values = sec.querySelectorAll('[data-value]');
      tl.from(values, { autoAlpha: 0, y: 20, duration: 1, stagger: 0.08 }, 0.6);
      tl.from(sec.querySelectorAll('.flow__step'), { autoAlpha: 0, y: 30, duration: 1, stagger: 0.08 }, 0.3);
    }
    ScrollTrigger.create({ trigger: sec, start: 'top 32%', end: 'bottom 112%', onToggle: toggler(tl) });
  });

  // light section: one-shot reveals
  const light = document.querySelector('[data-light]');
  if (light) {
    light.querySelectorAll('[data-split]').forEach((h) => {
      const lines = splitLines(h);
      gsap.from(lines, { yPercent: 118, duration: 1.2, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
    const items = [...light.querySelectorAll('[data-reveal]')];
    gsap.set(items, { autoAlpha: 0, y: 32 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.07 }),
    });
    // count-up (placeholder figures)
    light.querySelectorAll('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count);
      const o = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) }),
      });
    });
  }
  return api;
}
