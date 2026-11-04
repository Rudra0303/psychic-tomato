/** DOM-driven sections: hero tilt, reveals, problem collapse, platform browser, counts, footer particles. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ------------------------------------------------------------------ reveals */
export function setupReveals(reduced) {
  const api = { heroIn: () => {} };
  const heroSplit = [];
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (reduced) return;
    const s = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: false });
    s.masks?.forEach((m) => m.classList.add('split-mask'));
    const inHero = el.closest('.hero, .phero');
    gsap.set(s.lines, { yPercent: 110 });
    if (inHero) heroSplit.push(s.lines);
    else
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(s.lines, { yPercent: 0, duration: 1.2, stagger: 0.09, ease: 'expo.out' }),
      });
  });
  const rv = [...document.querySelectorAll('[data-rv]')];
  if (!reduced) gsap.set(rv, { y: 24, autoAlpha: 0 });
  api.heroIn = () => {
    if (reduced) return;
    heroSplit.forEach((lines) => gsap.to(lines, { yPercent: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' }));
    gsap.to(rv, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out', delay: 0.35 });
  };
  return api;
}

/* ------------------------------------------------------------------ product hero */
export function setupHero(reduced) {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return { intro() {} };
  const tilt = hero.querySelector('[data-hero-tilt]');
  const floats = [...hero.querySelectorAll('[data-float]')];
  const ptr = { x: 0, y: 0 };
  if (!reduced) {
    gsap.set(tilt, { '--tilt': '24deg', '--sc': 0.9, '--ty': '80px', opacity: 0 });
    gsap.set(floats, { opacity: 0, scale: 0.9 });
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom 40%',
      scrub: true,
      onUpdate: (self) => {
        const p = ease(seg(self.progress, 0, 0.55));
        tilt.style.setProperty('--tilt', `${24 * (1 - p)}deg`);
        tilt.style.setProperty('--sc', String(0.9 + 0.1 * p));
      },
    });
    window.addEventListener('pointermove', (e) => {
      ptr.x = e.clientX / innerWidth - 0.5;
      ptr.y = e.clientY / innerHeight - 0.5;
    });
    gsap.ticker.add(() => {
      floats.forEach((f, i) => {
        const k = (i + 1) * 10;
        const cx = parseFloat(f.style.getPropertyValue('--fx')) || 0;
        const cy = parseFloat(f.style.getPropertyValue('--fy')) || 0;
        f.style.setProperty('--fx', `${cx + (ptr.x * k - cx) * 0.06}px`);
        f.style.setProperty('--fy', `${cy + (ptr.y * k - cy) * 0.06}px`);
      });
    });
  }
  return {
    intro() {
      if (reduced) return;
      gsap.to(tilt, { '--ty': '0px', opacity: 1, duration: 1.6, ease: 'expo.out', delay: 0.25 });
      gsap.to(floats, { opacity: 1, scale: 1, duration: 0.9, stagger: 0.25, ease: 'back.out(1.6)', delay: 1.1 });
    },
  };
}

/* ------------------------------------------------------------------ problem → record */
export function setupProblem(reduced) {
  const sec = document.querySelector('[data-problem]');
  if (!sec) return;
  const frags = [...sec.querySelectorAll('[data-frag]')];
  const record = sec.querySelector('[data-record]');
  const field = sec.querySelector('[data-field]');
  const svg = sec.querySelector('[data-plines]');
  const A = sec.querySelector('[data-pa]');
  const B = sec.querySelector('[data-pb]');
  const counts = [...sec.querySelectorAll('[data-count]')];
  const rot = frags.map((_, i) => ((i * 37) % 9) - 4);
  let centers = [];
  let counted = false;

  const layout = () => {
    const fr = field.getBoundingClientRect();
    centers = frags.map((f) => ({ x: f.offsetLeft + f.offsetWidth / 2, y: f.offsetTop + f.offsetHeight / 2 }));
    const c = { x: fr.width / 2, y: fr.height / 2 };
    const pairs = [[0, 2], [2, 1], [1, 3], [2, 4], [4, 5], [5, 3], [4, 6], [5, 7], [6, 7], [0, 4]];
    svg.setAttribute('viewBox', `0 0 ${fr.width} ${fr.height}`);
    svg.innerHTML =
      pairs.map(([a, b]) => `<path class="chaos" d="M${centers[a].x},${centers[a].y} Q${(centers[a].x + centers[b].x) / 2 + 30},${(centers[a].y + centers[b].y) / 2 - 30} ${centers[b].x},${centers[b].y}"/>`).join('') +
      centers.map((p) => `<path class="to-record" d="M${p.x},${p.y} L${c.x},${c.y}"/>`).join('');
    frags.forEach((f, i) => {
      f._dx = c.x - centers[i].x;
      f._dy = c.y - centers[i].y;
    });
  };
  layout();
  window.addEventListener('resize', layout);

  const apply = (p, t) => {
    const appear = seg(p, 0.0, 0.18);
    const merge = ease(seg(p, 0.4, 0.7));
    frags.forEach((f, i) => {
      const a = clamp(appear * frags.length - i * 0.6);
      const bob = reduced ? 0 : Math.sin(t * 1.2 + i) * 4 * (1 - merge);
      f.style.opacity = String(a * (1 - seg(merge, 0.75, 1)));
      f.style.transform = `translate(${f._dx * merge}px, ${f._dy * merge + (1 - a) * 30 + bob}px) rotate(${rot[i] * (1 - merge)}deg) scale(${1 - 0.65 * merge})`;
    });
    svg.querySelectorAll('.chaos').forEach((l) => (l.style.opacity = String(appear * (1 - seg(p, 0.38, 0.5)))));
    svg.querySelectorAll('.to-record').forEach((l) => (l.style.opacity = String(seg(p, 0.42, 0.5) * (1 - seg(p, 0.66, 0.74)))));
    const r = ease(seg(p, 0.55, 0.78));
    record.style.opacity = String(r);
    record.style.transform = `translate(-50%, -50%) scale(${0.6 + 0.4 * r})`;
    const fa = 1 - seg(p, 0.42, 0.52);
    const fb = seg(p, 0.6, 0.72);
    A.style.opacity = String(fa);
    A.style.visibility = fa > 0.01 ? 'visible' : 'hidden';
    A.style.transform = `translateY(${-20 * (1 - fa)}px)`;
    B.style.opacity = String(fb);
    B.style.visibility = fb > 0.01 ? 'visible' : 'hidden';
    B.style.transform = `translateY(${20 * (1 - fb)}px)`;
    if (fb > 0.8 && !counted) {
      counted = true;
      countUp(counts, reduced);
    }
  };
  let prog = 0;
  ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => (prog = s.progress) });
  gsap.ticker.add((t) => apply(prog, t));
}

function countUp(els, reduced) {
  els.forEach((el) => {
    const to = Number(el.dataset.count);
    if (reduced) return (el.textContent = to);
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
  });
}

/* ------------------------------------------------------------------ platform list browser */
export function setupPlatforms(lenis) {
  document.querySelectorAll('[data-platform]').forEach((sec) => {
    const pin = sec.querySelector('.platform__pin');
    const btns = [...sec.querySelectorAll('[data-pi]')];
    const mods = [...sec.querySelectorAll('[data-pmod]')];
    const bar = sec.querySelector('[data-pbar]');
    const n = mods.length;
    let cur = 0;
    const range = () => {
      const top = sec.offsetTop + pin.offsetTop;
      return [top, sec.offsetTop + sec.offsetHeight - innerHeight];
    };
    const set = (i) => {
      if (i === cur) return;
      cur = i;
      btns.forEach((b, k) => b.classList.toggle('is-on', k === i));
      mods.forEach((m, k) => m.classList.toggle('is-on', k === i));
    };
    ScrollTrigger.create({
      trigger: sec,
      start: () => range()[0],
      end: () => range()[1],
      onUpdate: (s) => {
        bar.style.transform = `scaleX(${s.progress})`;
        set(Math.min(n - 1, Math.floor(s.progress * n * 0.999)));
      },
    });
    btns.forEach((b, i) =>
      b.addEventListener('click', () => {
        const [a, z] = range();
        const y = a + ((z - a) * (i + 0.5)) / n;
        lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo(0, y);
      }),
    );
  });
}

/* ------------------------------------------------------------------ footer particle wordmark */
export function setupParticles(reduced) {
  const canvas = document.querySelector('[data-particles]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let pts = [];
  let W = 0;
  let H = 0;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const mouse = { x: -1e4, y: -1e4 };
  const build = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const o = off.getContext('2d');
    let size = H * 1.02;
    o.font = `800 ${size}px "Archivo Variable", Archivo, sans-serif`;
    try {
      o.fontStretch = 'expanded';
    } catch {}
    const tw = o.measureText('HAULERHUB').width;
    size *= Math.min(1, W / tw);
    o.font = `800 ${size}px "Archivo Variable", Archivo, sans-serif`;
    o.textBaseline = 'middle';
    o.fillText('HAULERHUB', (W - o.measureText('HAULERHUB').width) / 2, H * 0.54);
    const data = o.getImageData(0, 0, W, H).data;
    const step = Math.max(4, Math.round(W / 260));
    pts = [];
    for (let y = 0; y < H; y += step)
      for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 128) pts.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
  };
  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0e0f12';
    for (const p of pts) {
      if (!reduced) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9000) {
          const f = (1 - d2 / 9000) * 3.2;
          const d = Math.sqrt(d2) || 1;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (p.ox - p.x) * 0.06;
        p.vy += (p.oy - p.y) * 0.06;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;
      }
      const moved = Math.abs(p.x - p.ox) + Math.abs(p.y - p.oy);
      ctx.globalAlpha = moved > 2 ? 0.9 : 0.75;
      ctx.fillStyle = moved > 6 ? '#ff5a1f' : '#0e0f12';
      ctx.fillRect(p.x - 1.1, p.y - 1.1, 2.2, 2.2);
    }
  };
  let vis = false;
  new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(canvas);
  canvas.parentElement.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => (mouse.x = mouse.y = -1e4));
  document.fonts.ready.then(() => {
    build();
    draw();
  });
  window.addEventListener('resize', () => {
    build();
    draw();
  });
  gsap.ticker.add(() => vis && draw());
}
