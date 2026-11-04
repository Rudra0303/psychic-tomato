/**
 * Navigation, persona switcher and preloader.
 */
export function setupNav({ lenis } = {}) {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const menu = nav.querySelector('[data-menu]');
  const trigger = menu?.querySelector('.nav__trigger');
  const burger = nav.querySelector('[data-burger]');

  const setMenu = (open) => {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  };
  trigger?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu?.addEventListener('focusout', (e) => {
    if (!menu.contains(e.relatedTarget)) setMenu(false);
  });
  document.addEventListener('click', (e) => {
    if (menu && !menu.contains(e.target)) setMenu(false);
  });

  const setMobile = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger?.addEventListener('click', () => setMobile(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__mobile a').forEach((a) => a.addEventListener('click', () => setMobile(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu?.classList.contains('is-open')) {
      setMenu(false);
      trigger.focus();
    }
    if (nav.classList.contains('is-open')) {
      setMobile(false);
      burger.focus();
    }
  });

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

export function setupSwitcher({ director, lenis, reduced }) {
  const el = document.querySelector('[data-switcher]');
  if (!el) return { update() {} };
  const links = [...el.querySelectorAll('a[data-target]')];
  const glider = el.querySelector('.switcher__glider');
  const isStatic = el.hasAttribute('data-static');
  let current = null;

  if (!isStatic) {
    links.forEach((a) => {
      a.addEventListener('click', (e) => {
        const sec = document.getElementById(a.dataset.target);
        if (!sec) return;
        e.preventDefault();
        const r = director.range(sec.id);
        const y = r ? r[0] + (r[1] - r[0]) * 0.18 : sec.offsetTop;
        const focusHeading = () => {
          const h = sec.querySelector('h2');
          if (h) {
            h.setAttribute('tabindex', '-1');
            h.focus({ preventScroll: true });
          }
        };
        if (lenis && !reduced) {
          const dist = Math.abs(y - window.scrollY) / window.innerHeight;
          lenis.scrollTo(y, { duration: Math.min(3.2, Math.max(1.4, 0.9 + dist * 0.22)), easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), onComplete: focusHeading });
        } else {
          window.scrollTo(0, y);
          focusHeading();
        }
      });
    });
  }

  const place = (a) => {
    if (!a) {
      el.classList.remove('has-active');
      return;
    }
    const ul = a.closest('ul');
    glider.style.width = `${a.offsetWidth}px`;
    glider.style.transform = `translateX(${a.offsetLeft + ul.offsetLeft}px)`;
    el.classList.add('has-active');
  };
  if (isStatic) {
    const cur = links.find((a) => a.getAttribute('aria-current') === 'page');
    requestAnimationFrame(() => place(cur));
    window.addEventListener('resize', () => place(cur));
  }

  return {
    update() {
      const st = director.state;
      const firstHold = director.holds[0];
      const visible = window.scrollY > (firstHold ? firstHold.end * 0.55 : 100) && st.lightCover < 0.5;
      el.classList.toggle('is-visible', visible);
      document.querySelector('[data-nav]')?.classList.toggle('on-light', st.lightCover > 0.92);
      if (isStatic) return;
      if (st.persona !== current) {
        current = st.persona;
        links.forEach((a) => a.classList.toggle('is-active', a.dataset.target === current));
        place(links.find((a) => a.dataset.target === current));
      }
    },
    relayout() {
      if (!isStatic) place(links.find((a) => a.dataset.target === current));
    },
  };
}

export function createPreloader() {
  const el = document.querySelector('[data-preloader]');
  const bar = el?.querySelector('[data-bar]');
  const pct = el?.querySelector('[data-pct]');
  const pb = el?.querySelector('[role="progressbar"]');
  let shown = 0;
  let target = 0;
  let raf = 0;
  const tick = () => {
    shown += (target - shown) * 0.12;
    if (Math.abs(target - shown) < 0.002) shown = target;
    if (bar) bar.style.transform = `scaleX(${shown})`;
    if (pct) pct.textContent = String(Math.round(shown * 100));
    if (pb) pb.setAttribute('aria-valuenow', String(Math.round(shown * 100)));
    raf = shown < 1 ? requestAnimationFrame(tick) : 0;
  };
  return {
    el,
    set(v) {
      target = Math.max(target, Math.min(1, v));
      if (!raf) raf = requestAnimationFrame(tick);
    },
    async done() {
      this.set(1);
      await new Promise((r) => {
        const wait = () => (shown >= 1 ? r() : requestAnimationFrame(wait));
        wait();
      });
    },
  };
}
