/**
 * Scroll -> camera + story.
 *
 * Every element with [data-shot] is a "hold": while its sticky inner fills the viewport the
 * camera holds that shot (with a slow orbit/dolly drift). In the scroll gap between two holds
 * the camera travels, eased, around the truck to the next shot. Sections with
 * [data-shot-b] split their hold into two shots.
 */
import * as THREE from 'three';
import { SHOTS, PIVOT } from '../scene/shots.js';

const PIV = new THREE.Vector3(...PIVOT);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

function cyl(p) {
  const dx = p.x - PIV.x;
  const dz = p.z - PIV.z;
  return { r: Math.hypot(dx, dz), a: Math.atan2(dz, dx), y: p.y };
}

export class Director {
  constructor(stage, { reduced = false } = {}) {
    this.stage = stage;
    this.reduced = reduced;
    this.main = document.querySelector('main');
    this.sections = [...document.querySelectorAll('[data-shot]')];
    this.light = document.querySelector('[data-light]');
    this.pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    this.cur = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35 };
    this.des = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35 };
    this.first = true;
    this.state = { active: null, persona: null, progress: {}, lightCover: 0, speed: 0, inLight: false };
    this.measure();
    if (!reduced && matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', (e) => {
        this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }
  }

  shot(name) {
    const portrait = window.innerWidth / window.innerHeight < 0.9;
    const s = SHOTS[name] || SHOTS.hero;
    const m = portrait && s.m ? s.m : {};
    const pos = new THREE.Vector3(...(m.pos || s.pos));
    const target = new THREE.Vector3(...(m.target || s.target));
    let fov = m.fov || s.fov;
    if (!m.fov) {
      const aspect = window.innerWidth / window.innerHeight;
      if (aspect < 1.3) fov = Math.min(68, fov * (1 + (1.3 - aspect) * 0.7));
    }
    return { name, pos, target, fov, c: cyl(pos), orbit: s.orbit || 0, dolly: s.dolly || 0, rise: s.rise || 0 };
  }

  measure() {
    const vh = window.innerHeight;
    this.vh = vh;
    const mainTop = this.main ? this.main.offsetTop : 0;
    const holds = [];
    this.sections.forEach((el) => {
      const top = el.offsetTop + mainTop;
      const h = el.offsetHeight;
      const start = el === this.sections[0] ? 0 : top;
      const end = Math.max(start + 1, top + h - vh);
      const speed = parseFloat(el.dataset.speed || '1');
      const id = el.id;
      const base = { el, id, speed, persona: el.dataset.persona || null, top, end: top + h };
      if (el.dataset.shotB) {
        const mid = start + (end - start) * 0.42;
        const mid2 = start + (end - start) * 0.62;
        holds.push({ ...base, start, end: mid, s: this.shot(el.dataset.shot), whole: [start, end] });
        holds.push({ ...base, start: mid2, end, s: this.shot(el.dataset.shotB), whole: [start, end] });
      } else {
        holds.push({ ...base, start, end, s: this.shot(el.dataset.shot), whole: [start, end] });
      }
    });
    this.holds = holds;
    this.lightTop = this.light ? this.light.offsetTop + (this.light.offsetParent === this.main ? mainTop : 0) : Infinity;
  }

  /** absolute scroll range [start, end] of a section's hold */
  range(id) {
    const hs = this.holds.filter((h) => h.id === id);
    if (!hs.length) return null;
    return hs[0].whole;
  }

  progressOf(id, y = window.scrollY) {
    const r = this.range(id);
    if (!r) return 0;
    return clamp((y - r[0]) / (r[1] - r[0]));
  }

  evalShot(s, u, out) {
    const c = s.c;
    const k = this.reduced ? 0 : u - 0.5;
    const a = c.a + THREE.MathUtils.degToRad(s.orbit) * k;
    const r = c.r - s.dolly * k;
    out.pos.set(PIV.x + Math.cos(a) * r, c.y + s.rise * k, PIV.z + Math.sin(a) * r);
    out.target.copy(s.target);
    out.fov = s.fov;
    return out;
  }

  update(dt, y = window.scrollY) {
    const H = this.holds;
    if (!H.length) return;
    const A = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 0 };
    const B = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 0 };
    let speed = H[0].speed;
    let active = H[0];
    let i = H.findIndex((h, k) => y < h.start || (y >= h.start && y <= h.end) || k === H.length - 1);
    const h = H[i];
    if (y >= h.start && y <= h.end) {
      this.evalShot(h.s, (y - h.start) / (h.end - h.start), this.des);
      speed = h.speed;
      active = h;
    } else if (y > h.end) {
      // past the last hold: keep drifting
      this.evalShot(h.s, 1 + (y - h.end) / (this.vh * 3), this.des);
      speed = h.speed;
      active = h;
    } else {
      // in the gap between H[i-1] and H[i]
      const p = H[i - 1];
      const tRaw = clamp((y - p.end) / (h.start - p.end));
      const t = this.reduced ? (tRaw < 0.5 ? 0 : 1) : easeIO(tRaw);
      this.evalShot(p.s, 1, A);
      this.evalShot(h.s, 0, B);
      const ca = cyl(A.pos);
      const cb = cyl(B.pos);
      let da = cb.a - ca.a;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      const ang = ca.a + da * t;
      const rad = lerp(ca.r, cb.r, t);
      const lift = Math.min(10, Math.abs(da) * 4 + Math.abs(ca.r - cb.r) * 0.12) * Math.sin(Math.PI * t);
      this.des.pos.set(PIV.x + Math.cos(ang) * rad, lerp(ca.y, cb.y, t) + lift, PIV.z + Math.sin(ang) * rad);
      this.des.target.lerpVectors(A.target, B.target, t);
      this.des.fov = lerp(A.fov, B.fov, t);
      speed = lerp(p.speed, h.speed, t);
      active = tRaw < 0.5 ? p : h;
    }

    // pointer parallax (desktop only)
    const P = this.pointer;
    const pk = 1 - Math.exp(-dt * 3);
    P.sx += (P.x - P.sx) * pk;
    P.sy += (P.y - P.sy) * pk;
    const cam = this.stage.camera;
    const dist = this.des.pos.distanceTo(this.des.target);
    if (!this.reduced) {
      const right = new THREE.Vector3().subVectors(this.des.target, this.des.pos).cross(cam.up).normalize();
      this.des.pos.addScaledVector(right, P.sx * dist * 0.018);
      this.des.pos.y += -P.sy * dist * 0.01;
    }

    // damping gives the camera weight
    const k = this.first || this.reduced ? 1 : 1 - Math.exp(-dt * 5);
    this.first = false;
    this.cur.pos.lerp(this.des.pos, k);
    this.cur.target.lerp(this.des.target, k);
    this.cur.fov += (this.des.fov - this.cur.fov) * k;
    this.stage.setView(this.cur.pos, this.cur.target, this.cur.fov);

    // story state
    const st = this.state;
    st.active = active.id;
    st.persona = this.nearestPersona(y);
    st.speed = speed;
    st.inLight = y > this.lightTop + 2;
    st.lightCover = clamp(1 - (this.lightTop - y) / this.vh);
    this.stage.story.targetSpeed = this.reduced ? 0 : speed * 22;
    this.applyNetwork(y);
  }

  nearestPersona(y) {
    let best = null;
    let bd = Infinity;
    for (const h of this.holds) {
      if (!h.persona) continue;
      const mid = (h.start + h.end) / 2;
      const d = Math.abs(y - mid);
      if (y >= h.start - this.vh * 0.6 && y <= h.end + this.vh * 0.6 && d < bd) {
        bd = d;
        best = h.persona;
      }
    }
    return best;
  }

  applyNetwork(y) {
    const net = this.stage.network.state;
    const frag = this.range('fragment');
    if (!frag) {
      // persona pages: a quiet, connected network
      net.visible = 0.0;
      return;
    }
    const u = clamp((y - frag[0] + this.vh * 0.6) / (frag[1] - frag[0] + this.vh * 0.6));
    const after = y > frag[1];
    const payoff = this.range('payoff');
    const late = payoff ? smooth(payoff[0] - this.vh, payoff[0], y) : 0;
    if (this.reduced) {
      net.visible = y > frag[0] - this.vh * 0.5 ? 1 : 0;
      net.gather = u > 0.55 || after ? 1 : 0;
      net.draw = net.gather;
      net.links = net.gather;
    } else {
      net.visible = smooth(0.05, 0.2, u);
      net.gather = smooth(0.44, 0.7, u);
      net.draw = smooth(0.48, 0.8, u);
      net.links = smooth(0.66, 0.92, u);
    }
    net.highlight = after ? this.state.persona : null;
    if (after && !this.state.persona) net.highlight = null;
    // during persona moments the network recedes; it returns, fully lit, for the payoff
    if (after) net.visible = 1 - 0.0 * late;
  }
}
