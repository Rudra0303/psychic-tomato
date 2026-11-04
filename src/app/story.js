/**
 * Connects the DOM sections to the 3D scenes:
 *  - #network: Emons-style stations. Scroll bands select a station; the camera flies there over a
 *    fixed duration. Tabs jump, hotspots open cards, party labels follow the 3D actors.
 *  - #journey: United-Carriers-style scroll-scrubbed journey (see gl/journey.js).
 *  - persona pages: the network world framed on that role's station.
 *  - role tiles: model thumbnails rendered once.
 */
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createEngine, detectQuality } from '../gl/engine.js';
import { buildWorld, stationPose, STATIONS } from '../gl/world.js';
import { renderThumbs } from '../gl/thumbs.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function start({ lenis, reduced }) {
  const canvas = document.querySelector('[data-gl]');
  if (!canvas || !window.WebGL2RenderingContext) return {};
  const Q = detectQuality();
  const E = createEngine(canvas, Q);
  const cam = E.camera;

  const world = buildWorld();
  const wl = E.addLights(world.scene);

  // journey loads lazily (big)
  let journey = null;
  const journeyEl = document.querySelector('[data-journey]');
  const journeyMod = journeyEl ? import('../gl/journey.js') : null;

  // role thumbnails
  renderThumbs(E.renderer).catch(() => {});

  /* ---------------- network section ---------------- */
  const net = document.querySelector('[data-network]');
  const phero = document.querySelector('[data-phero]');
  const view = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 22 };
  let flight = null;
  let station = 0;
  const netUI = net ? setupNetworkUI(net, world, lenis, reduced) : null;

  if (phero) {
    station = Math.max(0, STATIONS.findIndex((s) => s.key === phero.dataset.stationKey));
  }
  const pose0 = stationPose(station, innerWidth / innerHeight);
  view.pos.copy(pose0.pos);
  view.target.copy(pose0.target);
  view.fov = pose0.fov;
  world.state.station = station;

  function flyTo(i) {
    if (i === station && !flight) return;
    const from = { pos: view.pos.clone(), target: view.target.clone(), fov: view.fov };
    station = i;
    world.state.station = i;
    world.state.link = 0;
    flight = { from, t: 0, dur: reduced ? 0.001 : 1.7 };
    netUI?.setStation(i);
  }

  // which scene is active
  const active = { net: false, journey: false, phero: !!phero };
  if (net) {
    ScrollTrigger.create({
      trigger: net,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (s) => (active.net = s.isActive),
      onUpdate: (s) => {
        const pin = net.offsetHeight - innerHeight;
        const y = clamp((scrollY - net.offsetTop) / pin);
        const i = Math.min(STATIONS.length - 1, Math.floor(y * STATIONS.length * 0.9999));
        if (i !== station) flyTo(i);
        netUI?.progress(y);
      },
    });
  }
  if (phero) {
    ScrollTrigger.create({ trigger: phero, start: 'top top', end: 'bottom top', onToggle: (s) => (active.phero = s.isActive || scrollY < 10) });
  }
  if (journeyEl) {
    ScrollTrigger.create({ trigger: journeyEl, start: 'top bottom', end: 'bottom top', onToggle: (s) => (active.journey = s.isActive) });
  }

  /* ---------------- loop ---------------- */
  const tmpPos = new THREE.Vector3();
  const tmpTgt = new THREE.Vector3();
  let t = 0;
  let drift = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  });

  function frameNetwork(dt) {
    const pose = stationPose(station, innerWidth / innerHeight);
    if (flight) {
      flight.t += dt / flight.dur;
      const k = easeIO(clamp(flight.t));
      tmpTgt.lerpVectors(flight.from.target, pose.target, k);
      const lift = Math.sin(Math.PI * k) * 0.28;
      tmpPos.lerpVectors(flight.from.pos, pose.pos, k).sub(tmpTgt).multiplyScalar(1 + lift).add(tmpTgt);
      view.pos.copy(tmpPos);
      view.target.copy(tmpTgt);
      view.fov = flight.from.fov + (pose.fov - flight.from.fov) * k;
      if (flight.t >= 1) {
        flight = null;
      }
    } else {
      view.pos.lerp(pose.pos, 0.08);
      view.target.lerp(pose.target, 0.08);
      view.fov += (pose.fov - view.fov) * 0.08;
      world.state.link = Math.min(1, world.state.link + dt * 1.2);
    }
    if (!flight && world.state.link === 0) world.state.link = 0.001;
    // gentle orbit drift + pointer parallax
    drift += dt;
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    const ang = reduced ? 0 : Math.sin(drift * 0.12) * 0.05 + pointer.sx * 0.06;
    const off = view.pos.clone().sub(view.target);
    off.applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
    off.y += reduced ? 0 : -pointer.sy * 8;
    cam.position.copy(view.target).add(off);
    cam.lookAt(view.target);
    if (Math.abs(cam.fov - view.fov) > 0.01) {
      cam.fov = view.fov;
      cam.updateProjectionMatrix();
    }
    wl.follow(view.target);
    world.update(t, dt);
    E.render(world.scene, dt);
    netUI?.frame(cam, flight, t);
  }

  function frame(dt) {
    t += dt;
    const anyNet = active.net || active.phero;
    if (active.journey && journey) {
      canvas.classList.add('is-on');
      journey.frame(dt, t);
    } else if (anyNet) {
      canvas.classList.add('is-on');
      frameNetwork(dt);
    } else {
      canvas.classList.remove('is-on');
      journey?.idle();
    }
    if (!active.journey) journey?.hideDom();
  }
  let last = performance.now();
  gsap.ticker.add(() => {
    if (window.__hhFreeze) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frame(dt);
  });
  addEventListener('resize', () => {
    E.resize();
    journey?.resize();
  });

  if (journeyMod) {
    const mod = await journeyMod;
    journey = mod.createJourney({ E, section: journeyEl, reduced, Q });
  }

  return {
    stage: { renderer: E.renderer },
    frame() {
      for (let i = 0; i < 50; i++) frame(0.05);
      E.renderer.getContext().finish();
    },
  };
}

/* ------------------------------------------------------------------ network DOM */
function setupNetworkUI(sec, world, lenis, reduced) {
  const tabs = [...sec.querySelectorAll('[data-tab]')];
  const fill = sec.querySelector('[data-tabs-fill]');
  const panels = [...sec.querySelectorAll('[data-station-panel]')];
  const hs = [...sec.querySelectorAll('[data-hs]')];
  const head = sec.querySelector('[data-nhead]');
  const pin = sec.querySelector('.network__pin');
  // party labels
  const labels = world.actors.map((a) => {
    const el = document.createElement('span');
    el.className = 'actor';
    el.innerHTML = `<i></i>${a.label}`;
    el.setAttribute('aria-hidden', 'true');
    pin.appendChild(el);
    return el;
  });
  let cur = -1;
  const v = new THREE.Vector3();

  tabs.forEach((b, i) =>
    b.addEventListener('click', () => {
      const pinH = sec.offsetHeight - innerHeight;
      const y = sec.offsetTop + (pinH * (i + 0.5)) / tabs.length;
      lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo(0, y);
    }),
  );
  hs.forEach((h) => {
    const btn = h.querySelector('.hs__btn');
    btn.addEventListener('click', () => {
      const open = !h.classList.contains('is-open');
      hs.forEach((o) => {
        o.classList.remove('is-open');
        o.querySelector('.hs__btn').setAttribute('aria-expanded', 'false');
      });
      h.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hs')) hs.forEach((o) => o.classList.remove('is-open'));
  });

  return {
    setStation(i) {
      if (i === cur) return;
      cur = i;
      tabs.forEach((b, k) => b.classList.toggle('is-on', k === i));
      panels.forEach((p, k) => {
        p.classList.toggle('is-on', k === i);
        p.setAttribute('aria-hidden', String(k !== i));
      });
      hs.forEach((h) => h.classList.remove('is-open'));
      fill.style.transform = `scaleX(${(i + 1) / tabs.length})`;
    },
    progress(y) {
      head.style.opacity = String(1 - clamp((y - 0.02) / 0.1));
    },
    frame(camera, flight, t) {
      if (cur < 0) this.setStation(world.state.station);
      const w = innerWidth;
      const h = innerHeight;
      // hotspots
      hs.forEach((el) => {
        const [s, j] = el.dataset.hs.split('-').map(Number);
        const getter = world.hotspots[s]?.[j];
        const show = s === world.state.station && !flight && getter;
        if (show) {
          v.copy(getter()).project(camera);
          const x = (v.x * 0.5 + 0.5) * w;
          const y = (-v.y * 0.5 + 0.5) * h;
          el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          el.classList.toggle('flip', x > w * 0.62);
        }
        el.classList.toggle('is-vis', !!show);
      });
      // party labels
      world.actors.forEach((a, k) => {
        const el = labels[k];
        const show = a.s === world.state.station && !flight;
        if (show) {
          v.copy(a.get()).project(camera);
          el.style.transform = `translate(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%, -140%)`;
        }
        el.classList.toggle('is-vis', show && world.state.link > 0.3);
      });
    },
  };
}
