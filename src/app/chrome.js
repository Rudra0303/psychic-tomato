/** Header, menu, dropdown, cursor and page transitions. */
import { gsap } from 'gsap';

export function setupHeader(lenis) {
  const hdr = document.querySelector('[data-hdr]');
  if (!hdr) return { update() {} };
  const dd = hdr.querySelector('[data-dd]');
  const ddBtn = dd?.querySelector('button');
  ddBtn?.addEventListener('click', () => {
    const open = !dd.classList.contains('is-open');
    dd.classList.toggle('is-open', open);
    ddBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (dd && !dd.contains(e.target)) {
      dd.classList.remove('is-open');
      ddBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  const menu = document.querySelector('[data-menu]');
  const openBtn = hdr.querySelector('[data-menu-open]');
  const setMenu = (open) => {
    if (!menu) return;
    if (open) {
      menu.hidden = false;
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' });
      gsap.from(menu.querySelectorAll('.menu__big a, .menu__roles li'), { y: 40, opacity: 0, duration: 0.9, stagger: 0.04, ease: 'expo.out', delay: 0.3 });
      lenis?.stop();
      menu.querySelector('[data-menu-close]')?.focus();
    } else {
      gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut', onComplete: () => (menu.hidden = true) });
      lenis?.start();
      openBtn?.focus();
    }
    openBtn?.setAttribute('aria-expanded', String(open));
  };
  openBtn?.addEventListener('click', () => setMenu(true));
  menu?.querySelector('[data-menu-close]')?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu && !menu.hidden) setMenu(false);
    dd?.classList.remove('is-open');
  });

  const themed = [...document.querySelectorAll('[data-theme]')];
  let lastY = 0;
  return {
    update(y) {
      const dy = y - lastY;
      if (Math.abs(dy) > 4) {
        hdr.classList.toggle('is-hidden', dy > 0 && y > 400 && !(menu && !menu.hidden));
        lastY = y;
      }
      hdr.classList.toggle('is-compact', y > 120);
      // color by the section under the header
      let dark = false;
      for (const s of themed) {
        const r = s.getBoundingClientRect();
        if (r.top <= 36 && r.bottom > 36) dark = s.dataset.theme === 'dark';
      }
      hdr.classList.toggle('on-dark', dark);
    },
  };
}

export function setupCursor(reduced) {
  const el = document.querySelector('[data-cursor]');
  if (!el || reduced || !matchMedia('(pointer: fine)').matches) return;
  const label = el.querySelector('[data-cursor-label]');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const qx = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
  const qy = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    qx(pos.x);
    qy(pos.y);
    const t = e.target;
    const zone = t.closest?.('[data-cursor-zone]');
    const overBtn = t.closest?.('.btn, .hs__btn');
    el.classList.toggle('is-zone', !!zone && !overBtn);
    if (zone) label.textContent = zone.dataset.cursorZone;
    el.classList.toggle('is-hover', !zone && !!t.closest?.('a, button, summary'));
  });
  document.addEventListener('pointerleave', () => el.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => el.classList.remove('is-hidden'));
  document.querySelectorAll('[data-cursor-zone]').forEach((z) =>
    z.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      if (z.dataset.cursorHref) location.href = z.dataset.cursorHref;
    }),
  );
}

/** Ink iris transition between pages. */
export function setupTransitions(reduced) {
  const curtain = document.querySelector('[data-curtain]');
  if (!curtain) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || url.protocol.startsWith('mailto')) return;
    const samePage = url.pathname === location.pathname;
    if (samePage) return;
    e.preventDefault();
    if (reduced) {
      location.href = url.href;
      return;
    }
    curtain.style.setProperty('--cx', `${e.clientX}px`);
    curtain.style.setProperty('--cy', `${e.clientY}px`);
    try {
      sessionStorage.setItem('hh-trans', '1');
    } catch {}
    gsap.fromTo(curtain, { clipPath: `circle(0% at ${e.clientX}px ${e.clientY}px)` }, { clipPath: `circle(150% at ${e.clientX}px ${e.clientY}px)`, duration: 0.8, ease: 'expo.inOut', onComplete: () => (location.href = url.href) });
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) gsap.set(curtain, { clipPath: 'circle(0% at 50% 50%)' });
  });
}

export function cameFromTransition() {
  try {
    const v = sessionStorage.getItem('hh-trans');
    sessionStorage.removeItem('hh-trans');
    return v === '1';
  } catch {
    return false;
  }
}
