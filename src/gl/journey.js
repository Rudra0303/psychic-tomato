/**
 * The shipment journey, scrubbed by scroll (p = 0..1 across the pinned #journey section).
 * One container is followed through every handoff:
 *   dock (side view) → truck (camera turns top-down) → rail terminal (gantry) → train →
 *   port (ship-to-shore crane) → ship at sea → plane above the clouds → delivered at the hub.
 */
import * as THREE from 'three';
import * as M from './models.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sm = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

// chapter windows (must match content.journey.chapters order)
export const CH = [
  [0.0, 0.14],
  [0.14, 0.3],
  [0.3, 0.46],
  [0.46, 0.66],
  [0.66, 0.84],
  [0.84, 1.0],
];

const X = { dock: 0, gantry: 380, quay: 730, hub: 1560 };
const SHIP_Z = -42;
const TRACK_Z = -14;

function softTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const blob = (x, y, r, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${a})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  };
  blob(128, 128, 120, 0.9);
  blob(90, 140, 70, 0.8);
  blob(170, 120, 80, 0.8);
  blob(130, 90, 60, 0.7);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function waterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      varying vec3 vW; uniform float time;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      void main(){
        vec2 p = vW.xz * 0.045;
        float a = n(p + vec2(time*0.15, time*0.05)) * 0.6 + n(p*2.3 - vec2(time*0.1, -time*0.12)) * 0.4;
        float crest = smoothstep(0.72, 0.9, a);
        vec3 deep = vec3(0.035, 0.09, 0.17);
        vec3 mid = vec3(0.07, 0.19, 0.33);
        vec3 c = mix(deep, mid, a) + crest * 0.22;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

export function createJourney({ E, section, reduced }) {
  const scene = new THREE.Scene();
  const lights = E.addLights(scene, { sun: 2.4, hemi: 1.5 });
  const cam = E.camera;

  /* ---------------- ground, road, rails, water ---------------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 1200), new THREE.MeshStandardMaterial({ color: 0xebe8e1, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.x = 1000;
  ground.receiveShadow = true;
  scene.add(ground);

  const road = M.road(420, 11);
  road.position.set(190, 0.02, 0);
  scene.add(road);
  const track = M.track(420);
  track.position.set(X.gantry + 180, 0, TRACK_Z);
  scene.add(track);
  const quay = M.box(80, 1.2, 3, M.mat('sand'));
  quay.position.set(X.quay + 10, 0.5, -24);
  scene.add(quay);

  // port basin (beside the quay) + open sea that runs until the coast before the hub
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 600), waterMaterial());
  water.rotation.x = -Math.PI / 2;
  water.position.set(X.quay + 20, 0.08, -325);
  scene.add(water);
  const water2 = new THREE.Mesh(new THREE.PlaneGeometry(X.hub - 80 - (X.quay + 80), 1200), water.material);
  water2.rotation.x = -Math.PI / 2;
  water2.position.set((X.quay + 80 + X.hub - 80) / 2, 0.08, 0);
  scene.add(water2);

  /* ---------------- dock scene ---------------- */
  const dockWh = M.warehouse({ w: 40, d: 18, h: 11, docks: 5 });
  dockWh.position.set(-6, 0, -22);
  M.bake(dockWh);
  scene.add(dockWh);
  const stack = new THREE.Group();
  [0x1b1d22, 0xcfc8b8].forEach((c, i) => {
    const k = M.container(c);
    k.position.y = i * 2.62;
    stack.add(k);
  });
  const s2 = M.container(0x5a6270);
  s2.position.set(0, 0, -3);
  stack.add(s2);
  stack.position.set(-18, 0, 0);
  scene.add(stack);
  const stacker = M.reachStacker();
  scene.add(stacker);

  /* ---------------- vehicles ---------------- */
  const truck = M.truck({ kind: 'chassis' });
  scene.add(truck);
  const cont = M.container(0xff5a1f);
  // brand mark on the container: a dark band
  const band = M.box(12.24, 0.4, 2.48, M.mat('ink'));
  band.position.y = 2.2;
  cont.add(band);
  scene.add(cont);

  const gan = M.gantry({ span: 26, h: 15, len: 6 });
  gan.position.set(X.gantry, 0, -7);
  scene.add(gan);
  const train = M.train(8, { first: 'empty' });
  scene.add(train);
  const car0 = train.userData.cars[0];

  const sts = M.stsCrane({ h: 32, reach: 34 });
  sts.position.set(X.quay, 0, -12);
  scene.add(sts);
  const ship = M.ship({ len: 92, beam: 15, stacks: 10 });
  scene.add(ship);
  const SLOT = new THREE.Vector3(10, 2.9 + 2.62 * 4, 0); // container slot on deck (local)
  // wake
  const wakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
  const wakeGeo = new THREE.PlaneGeometry(1, 1);
  const wake = new THREE.Mesh(wakeGeo, wakeMat);
  wake.rotation.x = -Math.PI / 2;
  scene.add(wake);

  const plane = M.plane({ scale: 1.5 });
  scene.add(plane);

  /* ---------------- scenery along the road ---------------- */
  const pts = [];
  for (let i = 0; i < 70; i++) {
    const x = 30 + i * 5 + ((i * 37) % 7);
    const side = i % 2 ? 1 : -1;
    pts.push([x, side * (14 + ((i * 13) % 12))]);
  }
  scene.add(M.trees(pts));
  [[80, 30], [150, -34], [230, 32], [300, -30]].forEach(([x, z], i) => {
    const w = M.warehouse({ w: 24, d: 14, h: 7, docks: 3, dockSide: z > 0 ? -1 : 1 });
    w.position.set(x, 0, z);
    M.bake(w);
    scene.add(w);
  });
  const traffic = [M.truck({ kind: 'box' }), M.truck({ kind: 'box' })];
  traffic.forEach((t) => {
    t.rotation.y = Math.PI;
    scene.add(t);
  });
  scene.add(M.containerStacks([X.gantry + 22, 10], 4, 3, 3, 4));
  scene.add(M.containerStacks([X.quay - 70, 14], 5, 3, 4, 9));

  /* ---------------- clouds (air chapter) ---------------- */
  const cloudTex = softTexture();
  const clouds = [];
  for (let i = 0; i < 70; i++) {
    const m = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: 0 });
    const s = new THREE.Sprite(m);
    const sc = 60 + ((i * 53) % 70);
    s.scale.set(sc, sc * 0.75, 1);
    s.position.set(1060 + ((i * 97) % 520), 95 + ((i * 7) % 26), -130 + ((i * 61) % 260));
    s.userData.z0 = s.position.z;
    scene.add(s);
    clouds.push(s);
  }

  /* ---------------- delivery hub ---------------- */
  const hubWh = M.warehouse({ w: 46, d: 22, h: 11, docks: 6 });
  hubWh.position.set(X.hub, 0, -16);
  M.bake(hubWh);
  scene.add(hubWh);
  const hq = M.tower({ w: 14, d: 14, h: 34 });
  hq.position.set(X.hub - 40, 0, -12);
  M.bake(hq);
  scene.add(hq);
  scene.add(M.trees([[X.hub + 34, -36], [X.hub + 40, -30], [X.hub - 60, 10], [X.hub - 54, 18], [X.hub + 30, 26]]));
  const hubRoad = M.road(160, 11);
  hubRoad.position.set(X.hub - 20, 0.02, 22);
  scene.add(hubRoad);
  const delTruck = M.truck({ kind: 'chassis' });
  delTruck.rotation.y = -Math.PI / 2;
  scene.add(delTruck);
  const delCont = M.container(0xff5a1f);
  delCont.position.set(-0.5, 1.4, 0);
  delTruck.add(delCont);
  const ring = new THREE.Mesh(new THREE.RingGeometry(9, 10, 64), new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(X.hub + 2, 0.25, 2);
  scene.add(ring);

  /* ---------------- choreography ---------------- */
  const tmp = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const lastFocus = new THREE.Vector3();
  let speed = 0;

  function truckX(p) {
    return lerp(10, X.gantry, io(seg(p, 0.11, 0.29)));
  }
  function trainCarX(p) {
    return lerp(X.gantry, X.quay, io(seg(p, 0.36, 0.455)));
  }
  function shipX(p) {
    return lerp(X.quay + 10, X.quay + 520, sm(seg(p, 0.52, 0.7)) * 0.7 + seg(p, 0.52, 0.7) * 0.3);
  }

  function place(p, t) {
    // truck
    const tx = truckX(p);
    truck.position.set(tx, 0, 0);
    truck.userData.wheels.forEach((w) => (w.rotation.z = -tx / 0.52));
    // train (car0 under gantry until 0.36, then to quay)
    const cx = trainCarX(p);
    train.position.set(cx - car0.position.x, 0, TRACK_Z);
    // ship
    const sx = shipX(p);
    ship.position.set(sx, Math.sin(t * 0.8) * 0.12, SHIP_Z);
    const sailing = seg(p, 0.52, 0.56);
    wake.position.set(sx - 46 - 40, 0.12, SHIP_Z);
    wake.scale.set(90, 14 + 10 * sailing, 1);
    wakeMat.opacity = 0.3 * sailing;
    // plane above the clouds
    const pa = seg(p, 0.66, 0.86);
    plane.position.set(lerp(1080, 1440, pa), 140 - 30 * seg(p, 0.8, 0.9), 0);
    plane.visible = p > 0.62 && p < 0.92;
    // clouds fade in for the air chapter
    const cl = seg(p, 0.6, 0.68) * (1 - seg(p, 0.82, 0.88));
    clouds.forEach((c, i) => {
      c.material.opacity = cl * 0.95;
      c.position.z = c.userData.z0 + Math.sin(t * 0.05 + i) * 4;
      c.visible = cl > 0.01;
    });
    // traffic during the road chapter
    traffic.forEach((tr, i) => tr.position.set(lerp(420 + i * 90, -60 + i * 90, seg(p, 0.1, 0.32)), 0, 4.5));
    // delivery at the hub
    const d = io(seg(p, 0.86, 0.94));
    delTruck.position.set(X.hub + 2, 0, lerp(46, 2.5, d));
    const r = seg(p, 0.93, 1);
    ring.material.opacity = r * (0.6 + 0.4 * Math.sin(t * 3));
    ring.scale.setScalar(0.9 + 0.1 * r);

    // ---- the container ----
    const deck = new THREE.Vector3(tx - 0.5, 1.4, 0);
    if (p < 0.105) {
      const k = seg(p, 0.02, 0.1);
      const from = new THREE.Vector3(-18, 5.24, 0);
      const up = sm(seg(k, 0, 0.3));
      const mv = io(seg(k, 0.3, 0.75));
      const dn = sm(seg(k, 0.75, 1));
      cont.position.set(lerp(from.x, deck.x, mv), lerp(lerp(from.y, 9, up), deck.y, dn), 0);
    } else if (p < 0.3) {
      cont.position.copy(deck);
    } else if (p < 0.36) {
      const k = seg(p, 0.3, 0.36);
      const up = sm(seg(k, 0, 0.3));
      const mv = io(seg(k, 0.3, 0.7));
      const dn = sm(seg(k, 0.7, 1));
      const to = new THREE.Vector3(X.gantry, 1.5, TRACK_Z);
      cont.position.set(lerp(deck.x, to.x, mv), lerp(lerp(deck.y, 9.5, up), to.y, dn), lerp(0, TRACK_Z, mv));
    } else if (p < 0.46) {
      cont.position.set(cx, 1.5, TRACK_Z);
    } else if (p < 0.52) {
      const k = seg(p, 0.46, 0.52);
      const up = sm(seg(k, 0, 0.3));
      const mv = io(seg(k, 0.3, 0.7));
      const dn = sm(seg(k, 0.7, 1));
      tmp.copy(SLOT).add(new THREE.Vector3(X.quay + 10, 0, SHIP_Z));
      cont.position.set(lerp(X.quay, tmp.x, mv), lerp(lerp(1.5, 30, up), tmp.y, dn), lerp(TRACK_Z, SHIP_Z, mv));
    } else {
      cont.position.copy(SLOT).add(ship.position);
    }
    cont.visible = p < 0.84;

    // ---- reach stacker follows the container during loading ----
    const sx2 = p < 0.105 ? cont.position.x - 11.5 : lerp(-29.5, -40, seg(p, 0.105, 0.14));
    stacker.position.set(sx2, 0, 0);
    stacker.userData.boom.rotation.z = Math.atan2((p < 0.105 ? cont.position.y : 1.4) + 1.2 - 3, 11);
    stacker.userData.wheels.forEach((w) => (w.rotation.z = -sx2 / 0.9));

    // ---- gantry trolley + spreader track the container ----
    const gt = gan.userData.trolley;
    const gk = seg(p, 0.29, 0.37);
    gt.position.z = gk > 0 && gk < 1 ? cont.position.z + 7 : p < 0.3 ? 7 : TRACK_Z + 7;
    gt.userData.spreader.position.y = gk > 0 && gk < 1 ? cont.position.y + 2.8 : gt.userData.h - 3;
    gt.userData.cable.scale.y = 1;
    // ---- ship-to-shore crane ----
    const st = sts.userData.trolley;
    const sk = seg(p, 0.455, 0.525);
    st.position.z = sk > 0 && sk < 1 ? cont.position.z + 12 : p < 0.46 ? -2 : SHIP_Z + 12;
    st.userData.spreader.position.y = sk > 0 && sk < 1 ? cont.position.y + 2.8 : sts.userData.h - 8;
    st.userData.spreader.rotation.y = Math.PI / 2;

    // focus = the shipment
    if (p < 0.66) focus.copy(cont.position);
    else if (p < 0.86) focus.copy(plane.position);
    else focus.set(X.hub, 0, 0);
  }

  /* ---------------- camera ---------------- */
  const up = new THREE.Vector3();
  const pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(), fov: 20 };
  const side = (x, o) => ((o.pos.set(x, 8, 120), o.target.set(x, 15, 0), o.up.set(0, 1, 0), (o.fov = 18)), o);
  const top = (x, z, h, o) => ((o.pos.set(x, h, z + 0.01), o.target.set(x, 0, z), o.up.set(0, 0, -1), (o.fov = 30)), o);
  const iso = (o) => ((o.target.set(X.hub - 6, 4, 2), o.pos.copy(o.target).add(new THREE.Vector3(88, 92, 118)), o.up.set(0, 1, 0), (o.fov = 24)), o);
  const A = { pos: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(), fov: 0 };
  const B = { pos: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(), fov: 0 };
  const mix = (a, b, k) => {
    pose.pos.lerpVectors(a.pos, b.pos, k);
    pose.target.lerpVectors(a.target, b.target, k);
    pose.up.lerpVectors(a.up, b.up, k).normalize();
    pose.fov = lerp(a.fov, b.fov, k);
  };
  const portrait = () => innerWidth / innerHeight < 0.9;

  function cameraAt(p) {
    const fx = focus.x;
    const fz = focus.z;
    const pk = portrait() ? 1.7 : 1;
    if (p < 0.11) {
      side(lerp(-2, 6, seg(p, 0, 0.11)) + (portrait() ? 0 : -14), A);
      if (portrait()) A.pos.z *= 1.9;
      mix(A, A, 0);
    } else if (p < 0.2) {
      side(fx, A);
      top(fx, 0, 76 * pk, B);
      mix(A, B, io(seg(p, 0.11, 0.2)));
    } else if (p < 0.66) {
      // altitude rises with the scale of each leg
      const h = lerp(76, 96, seg(p, 0.28, 0.34)) + lerp(0, 34, seg(p, 0.52, 0.62));
      top(fx, lerp(0, fz * 0.6, seg(p, 0.3, 0.5)) + (p > 0.46 ? lerp(fz * 0.6, fz, seg(p, 0.46, 0.52)) - fz * 0.6 : 0), h * pk, A);
      mix(A, A, 0);
    } else if (p < 0.84) {
      const h = lerp(130, 330, sm(seg(p, 0.64, 0.72)));
      top(fx, 0, h * pk, A);
      mix(A, A, 0);
    } else {
      top(focus.x, 0, 330 * pk, A);
      iso(B);
      if (portrait()) B.pos.sub(B.target).multiplyScalar(1.5).add(B.target);
      mix(A, B, io(seg(p, 0.84, 0.92)));
    }
  }

  /* ---------------- DOM ---------------- */
  const pin = section.querySelector('.journey__pin');
  const chapters = [...section.querySelectorAll('[data-chapter]')];
  const jcards = section.querySelector('[data-jcards]');
  const flowItems = [...section.querySelectorAll('.jflow li')];
  const rec = section.querySelector('[data-jrec]');
  const evs = [...section.querySelectorAll('[data-ev]')];
  const legs = [...section.querySelectorAll('[data-jleg]')];
  const hudSpeed = section.querySelector('[data-speed]');
  const hudLeg = section.querySelector('[data-leg]');
  const hudMode = section.querySelector('[data-mode]');
  const intro = section.querySelector('[data-jintro]');
  const under = document.querySelector('[data-under]');
  const marquee = under?.querySelector('[data-marquee]');
  const labels = chapters.map((c) => c.querySelector('.chapter__n').textContent.replace(/^\d+/, '').trim());
  let lastCh = -1;
  let lastEv = -1;

  function dom(p, dt) {
    let ch = CH.findIndex(([a, b]) => p >= a && p < b);
    if (ch < 0) ch = p >= 1 ? 5 : 0;
    chapters.forEach((el, i) => {
      const [a, b] = CH[i];
      const fin = i === 0 ? 1 : seg(p, a + 0.004, a + 0.02);
      const fout = i === 5 ? 1 : 1 - seg(p, b - 0.018, b - 0.004);
      const o = Math.min(fin, fout);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      el.style.transform = `translateY(${((1 - o) * (p < a + 0.02 ? 30 : -30)).toFixed(1)}px)`;
    });
    section.classList.toggle('on-dark', p > 0.505 && p < 0.69);
    if (jcards) jcards.style.transform = `translateX(${(-io(seg(p, 0.015, 0.125)) * (jcards.scrollWidth + innerWidth * 0.1)).toFixed(1)}px)`;
    flowItems.forEach((li, i) => li.classList.toggle('is-on', p > 0.9 + i * 0.022));
    // shipment record log
    const evOn = Math.floor(seg(p, 0.0, 1) * 1000);
    let idx = 0;
    evs.forEach((el) => {
      const c = +el.dataset.ev;
      const k = +getComputedStyle(el).getPropertyValue('--k') || 0;
      const at = CH[c][0] + (CH[c][1] - CH[c][0]) * (0.25 + k * 0.22);
      const on = p >= at;
      el.classList.toggle('is-on', on);
      el.classList.toggle('is-new', on && p < at + 0.03);
      if (on) idx++;
    });
    rec?.classList.toggle('is-on', p > 0.125);
    legs.forEach((el, i) => {
      el.classList.toggle('is-done', i < ch - 0 && ch > 0 && i < ch);
      el.classList.toggle('is-on', i === Math.max(0, ch - 1) && ch > 0 && ch < 5);
    });
    if (ch !== lastCh) {
      lastCh = ch;
      hudLeg.textContent = String(ch + 1).padStart(2, '0');
      hudMode.textContent = labels[ch];
    }
    const kmh = Math.min(999, Math.round(speed * 3.6 * 0.6));
    hudSpeed.textContent = String(kmh).padStart(2, '0');
    intro.style.opacity = String(1 - seg(p, 0.01, 0.03));
    if (under) {
      const r = pin.getBoundingClientRect();
      under.classList.toggle('is-on', p < 0.14);
      under.style.clipPath = `inset(${Math.max(0, r.top)}px 0 ${Math.max(0, innerHeight - r.bottom)}px 0)`;
      marquee.style.transform = `translateX(${(-p * 3000 - 200).toFixed(1)}px)`;
      marquee.style.opacity = String(1 - seg(p, 0.1, 0.14));
    }
  }

  function progress() {
    const top = section.getBoundingClientRect().top;
    return clamp(-top / (section.offsetHeight - innerHeight));
  }

  return {
    scene,
    pin,
    frame(dt, t) {
      const p = progress();
      place(p, t);
      if (dt > 0) {
        speed = lerp(speed, focus.distanceTo(lastFocus) / dt, 0.15);
        lastFocus.copy(focus);
      }
      cameraAt(p);
      cam.position.copy(pose.pos);
      cam.up.copy(pose.up);
      cam.lookAt(pose.target);
      if (Math.abs(cam.fov - pose.fov) > 0.01) {
        cam.fov = pose.fov;
        cam.updateProjectionMatrix();
      }
      lights.follow(p > 0.64 && p < 0.86 ? tmp.set(pose.target.x, 0, 0) : pose.target);
      water.material.uniforms.time.value = t;
      dom(p, dt);
      return scene;
    },
    hideDom() {
      under?.classList.remove('is-on');
    },
    idle() {},
    resize() {},
  };
}
