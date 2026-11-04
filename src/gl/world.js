/**
 * The network world: one continuous isometric diorama with five stations
 * (road depot, rail terminal, sea port, airport, delivery hub). Each station shows the parties
 * working there, linked by orange connection arcs to a floating "shipment record" beacon.
 */
import * as THREE from 'three';
import * as M from './models.js';
import { makeArc, makeBeacon } from './links.js';

export const STATIONS = [
  { key: 'road', c: [0, 0, 0] },
  { key: 'rail', c: [130, 0, 0] },
  { key: 'sea', c: [260, 0, 0] },
  { key: 'air', c: [390, 0, 0] },
  { key: 'hub', c: [520, 0, 0] },
];

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function buildWorld() {
  const scene = new THREE.Scene();
  const updaters = [];
  const actors = []; // { station, label, get: () => Vector3 }
  const hotspots = []; // index-aligned with content: [station][j] => () => Vector3
  const beacons = [];

  /* ---------------- ground ---------------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 600), new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const pad = (x, z, w, d, m = 'paper', y = 0.02) => {
    const p = M.box(w, 0.05, d, M.mat(m));
    p.position.set(x, y, z);
    p.castShadow = false;
    scene.add(p);
    return p;
  };
  const grass = (x, z, w, d) => pad(x, z, w, d, 'sage', 0.03);

  // the long route road that ties every station together
  const mainRoad = M.road(1200, 10);
  mainRoad.position.set(260, 0, 30);
  scene.add(mainRoad);

  /* ---------------- 01 road depot ---------------- */
  {
    const [cx, , cz] = STATIONS[0].c;
    const g = new THREE.Group();
    g.position.set(cx, 0, cz);
    scene.add(g);
    pad(cx, cz + 2, 96, 44);
    grass(cx - 40, cz + 46, 30, 16);
    grass(cx + 34, cz - 34, 40, 18);
    const wh = M.warehouse({ w: 46, d: 22, h: 11, docks: 7 });
    wh.position.set(0, 0, -14);
    g.add(wh);
    const office = M.tower({ w: 10, d: 10, h: 16 });
    office.position.set(-34, 0, -10);
    g.add(office);
    const parked = [];
    [-15, -3, 9].forEach((x, i) => {
      const t = M.truck({ kind: 'box' });
      t.rotation.y = -Math.PI / 2;
      t.position.set(x, 0, 4.5 + (i === 1 ? 0 : 0));
      g.add(t);
      parked.push(t);
    });
    // yard lines
    for (let i = 0; i < 8; i++) {
      const l = M.box(0.2, 0.02, 14, M.mat('lineWhite'));
      l.position.set(-22 + i * 6, 0.07, 6);
      l.castShadow = false;
      g.add(l);
    }
    M.bake(g);
    scene.add(M.trees([[-48, -24], [-44, -30], [-52, -16], [30, -30], [36, -26], [42, -32], [26, -36], [-40, 44], [-34, 48], [-46, 50], [48, 12], [52, 6]].map(([x, z]) => [x + cx, z + cz])));
    // moving trucks on the route road
    const movers = [M.truck({ kind: 'box' }), M.truck({ kind: 'chassis' })];
    const c2 = M.container(0xff5a1f);
    c2.position.y = 1.4;
    movers[1].add(c2);
    movers.forEach((m, i) => scene.add(m));
    const fl = M.forklift();
    fl.position.set(cx - 22, 0, cz - 1);
    scene.add(fl);
    updaters.push((t) => {
      movers[0].position.set(cx - 70 + ((t * 9) % 150), 0, 27.5);
      movers[1].position.set(cx + 80 - ((t * 7 + 60) % 160), 0, 32.5);
      movers[1].rotation.y = Math.PI;
      fl.position.x = cx - 22 + Math.sin(t * 0.6) * 8;
      fl.rotation.y = Math.cos(t * 0.6) > 0 ? 0 : Math.PI;
    });
    actors.push(
      { s: 0, label: 'Shipper', get: () => V(cx - 34, 19, cz - 10) },
      { s: 0, label: 'Warehouse', get: () => V(cx + 14, 13.5, cz - 14) },
      { s: 0, label: 'Carrier', get: () => V(cx - 3, 5.5, cz + 4.5) },
      { s: 0, label: 'Driver', get: () => movers[0].position.clone().add(V(6, 5, 0)) },
    );
    hotspots[0] = [() => V(cx + 9, 5.5, cz + 4.5), () => movers[0].position.clone().add(V(2, 4.5, 0))];
  }

  /* ---------------- 02 rail terminal ---------------- */
  {
    const [cx, , cz] = STATIONS[1].c;
    pad(cx, cz, 110, 50);
    grass(cx - 30, cz - 40, 50, 16);
    const tr1 = M.track(240);
    tr1.position.set(cx, 0, cz - 12);
    const tr2 = M.track(240);
    tr2.position.set(cx, 0, cz - 6);
    scene.add(tr1, tr2);
    const parkedTrain = M.train(6);
    parkedTrain.position.set(cx + 30, 0, cz - 6);
    scene.add(parkedTrain);
    const moving = M.train(7);
    scene.add(moving);
    const gan = M.gantry({ span: 22, h: 15, len: 5 });
    gan.position.set(cx, 0, cz - 5);
    scene.add(gan);
    const tk = M.truck({ kind: 'chassis' });
    tk.position.set(cx - 4, 0, cz + 6);
    scene.add(tk);
    const lifted = M.container(0x1b1d22);
    scene.add(lifted);
    const stacks = M.containerStacks([cx - 52, cz + 12], 4, 3, 3, 2);
    scene.add(stacks);
    const off = M.warehouse({ w: 18, d: 12, h: 7, docks: 2 });
    off.position.set(cx + 38, 0, cz + 16);
    M.bake(off);
    scene.add(off);
    scene.add(M.trees([[-36, -42], [-28, -46], [-20, -40], [44, 34], [50, 30], [-56, 36]].map(([x, z]) => [x + cx, z + cz])));
    const trolley = gan.userData.trolley;
    updaters.push((t) => {
      // moving train glides through on track 1
      const u = (t * 0.06) % 1;
      moving.position.set(cx - 160 + u * 330, 0, cz - 12);
      // gantry moves a container between truck and parked train
      const k = (Math.sin(t * 0.5) + 1) / 2;
      trolley.position.z = -11 + k * 22;
      const s = trolley.userData.spreader;
      const drop = Math.max(0, Math.sin(t * 1.0)) * 6;
      s.position.y = trolley.userData.h - 6 - drop;
      lifted.position.set(cx, s.position.y - 2.8, cz - 5 + trolley.position.z);
    });
    actors.push(
      { s: 1, label: 'Terminal', get: () => V(cx, 18, cz - 5) },
      { s: 1, label: 'Rail operator', get: () => moving.position.clone().add(V(-2, 7, 0)) },
      { s: 1, label: 'Carrier', get: () => V(cx + 2, 5, cz + 6) },
      { s: 1, label: 'Forwarder', get: () => V(cx + 38, 10, cz + 16) },
    );
    hotspots[1] = [() => V(cx - 4, 16, cz - 5), () => V(cx + 30, 6, cz - 6)];
  }

  /* ---------------- 03 sea port ---------------- */
  {
    const [cx, , cz] = STATIONS[2].c;
    pad(cx, cz + 12, 120, 34);
    // water
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 140, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x9fbcc9, roughness: 0.25, metalness: 0.1 }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(cx, 0.06, cz - 76);
    water.receiveShadow = true;
    scene.add(water);
    const quay = M.box(220, 1.4, 2, M.mat('sand'));
    quay.position.set(cx, 0.5, cz - 6);
    scene.add(quay);
    const sh = M.ship({ len: 86, beam: 14, stacks: 9 });
    sh.position.set(cx, 0, cz - 20);
    scene.add(sh);
    const cr = [M.stsCrane({ h: 30, reach: 34 }), M.stsCrane({ h: 30, reach: 34 })];
    cr[0].position.set(cx - 16, 0, cz + 2);
    cr[1].position.set(cx + 18, 0, cz + 2);
    cr.forEach((c) => scene.add(c));
    scene.add(M.containerStacks([cx - 50, cz + 10], 7, 4, 4, 5));
    const cust = M.warehouse({ w: 14, d: 10, h: 6, docks: 1 });
    cust.position.set(cx + 46, 0, cz + 20);
    M.bake(cust);
    scene.add(cust);
    const t2 = M.truck({ kind: 'chassis' });
    t2.position.set(cx - 30, 0, cz + 2);
    scene.add(t2);
    updaters.push((t) => {
      sh.position.y = Math.sin(t * 0.8) * 0.15;
      sh.rotation.x = Math.sin(t * 0.6) * 0.004;
      cr.forEach((c, i) => {
        const tr = c.userData.trolley;
        tr.position.z = -14 - (Math.sin(t * 0.4 + i * 2) + 1) * 9;
        tr.userData.spreader.position.y = c.userData.h - 8 - Math.max(0, Math.sin(t * 0.8 + i)) * 10;
      });
      t2.position.x = cx - 40 + ((t * 6) % 60);
    });
    actors.push(
      { s: 2, label: 'Ocean line', get: () => V(cx - 38, 14, cz - 20) },
      { s: 2, label: 'Port', get: () => V(cx - 16, 34, cz + 2) },
      { s: 2, label: 'Customs broker', get: () => V(cx + 46, 9, cz + 20) },
      { s: 2, label: 'Forwarder', get: () => t2.position.clone().add(V(0, 6, 0)) },
    );
    hotspots[2] = [() => V(cx + 10, 14, cz - 20), () => V(cx + 46, 8, cz + 20)];
  }

  /* ---------------- 04 airport ---------------- */
  {
    const [cx, , cz] = STATIONS[3].c;
    pad(cx, cz + 4, 130, 50);
    const rw = M.road(220, 16, { dashes: true });
    rw.position.set(cx, 0.02, cz - 16);
    scene.add(rw);
    for (let i = 0; i < 8; i++) {
      const m = M.box(5, 0.02, 0.9, M.mat('lineWhite'));
      m.position.set(cx - 100, 0.14, cz - 21.5 + i * 1.6);
      m.castShadow = false;
      scene.add(m);
    }
    const parked = M.plane({ scale: 0.9 });
    parked.position.set(cx - 6, 0, cz + 12);
    parked.rotation.y = 0.5;
    scene.add(parked);
    const flying = M.plane({ scale: 0.9 });
    scene.add(flying);
    const ct = M.controlTower();
    ct.position.set(cx + 40, 0, cz + 18);
    M.bake(ct);
    scene.add(ct);
    const hg = M.hangar();
    hg.position.set(cx - 44, 0, cz + 16);
    M.bake(hg);
    scene.add(hg);
    const pal = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const p = M.pallet();
      p.scale.setScalar(1.6);
      p.position.set((i % 5) * 2.6, 0, Math.floor(i / 5) * 2.4);
      pal.add(p);
    }
    pal.position.set(cx + 12, 0, cz + 20);
    M.bake(pal);
    scene.add(pal);
    const fk = M.forklift();
    scene.add(fk);
    updaters.push((t) => {
      const u = (t * 0.07) % 1;
      const x = cx - 100 + u * u * 300;
      const lift = Math.max(0, x - (cx + 20)) * 0.22;
      flying.position.set(x, lift, cz - 16);
      flying.rotation.z = lift > 0 ? Math.min(0.18, lift * 0.01) : 0;
      fk.position.set(cx + 6 + Math.sin(t * 0.7) * 6, 0, cz + 26);
      fk.rotation.y = Math.cos(t * 0.7) > 0 ? 0 : Math.PI;
    });
    actors.push(
      { s: 3, label: 'Airline', get: () => V(cx - 6, 10, cz + 12) },
      { s: 3, label: 'Ground handler', get: () => V(cx + 18, 5, cz + 21) },
      { s: 3, label: 'Agent', get: () => V(cx - 44, 14, cz + 16) },
      { s: 3, label: 'Forwarder', get: () => V(cx + 40, 30, cz + 18) },
    );
    hotspots[3] = [() => flying.position.clone().add(V(0, 5, 0)), () => V(cx + 40, 26, cz + 18)];
  }

  /* ---------------- 05 hub ---------------- */
  {
    const [cx, , cz] = STATIONS[4].c;
    pad(cx, cz + 2, 110, 48);
    grass(cx + 50, cz - 30, 40, 20);
    const hq = M.tower({ w: 14, d: 14, h: 36 });
    hq.position.set(cx - 30, 0, cz - 10);
    M.bake(hq);
    scene.add(hq);
    const dc = M.warehouse({ w: 44, d: 22, h: 11, docks: 6 });
    dc.position.set(cx + 10, 0, cz - 12);
    M.bake(dc);
    scene.add(dc);
    scene.add(M.trees([[-48, 20], [-44, 26], [-52, 30], [36, -34], [44, -30], [52, -36], [40, 22], [46, 26]].map(([x, z]) => [x + cx, z + cz])));
    const del = M.truck({ kind: 'box' });
    del.rotation.y = -Math.PI / 2;
    scene.add(del);
    const ring = new THREE.Mesh(new THREE.RingGeometry(6, 6.8, 48), new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cx + 12, 0.2, cz + 5);
    scene.add(ring);
    updaters.push((t) => {
      const u = (t * 0.08) % 1;
      const k = Math.min(1, u / 0.6);
      const e = 1 - Math.pow(1 - k, 3);
      del.position.set(cx + 12, 0, cz + 40 - e * 35);
      ring.material.opacity = u > 0.6 ? 1 - (u - 0.6) / 0.4 : 0;
      ring.scale.setScalar(1 + (u > 0.6 ? (u - 0.6) * 2 : 0));
    });
    actors.push(
      { s: 4, label: 'Shipper', get: () => V(cx - 30, 39, cz - 10) },
      { s: 4, label: 'Receiver', get: () => V(cx + 24, 14, cz - 12) },
      { s: 4, label: 'Finance', get: () => V(cx - 30, 20, cz - 2) },
      { s: 4, label: 'Carrier', get: () => del.position.clone().add(V(0, 6, 0)) },
    );
    hotspots[4] = [() => V(cx - 2, 14, cz - 12), () => del.position.clone().add(V(0, 5, -3))];
  }

  /* ---------------- connections: actors → station record beacon ---------------- */
  const arcs = [];
  STATIONS.forEach((s, i) => {
    const b = makeBeacon();
    b.position.set(s.c[0] + 4, 30, s.c[2] + 6);
    scene.add(b);
    beacons.push(b);
  });
  actors.forEach((a) => {
    const arc = makeArc({ width: 0.22 });
    scene.add(arc.mesh);
    arcs.push({ a, arc });
  });
  // beacon chain: the same record travels between stations
  const chain = [];
  for (let i = 0; i < STATIONS.length - 1; i++) {
    const arc = makeArc({ width: 0.3, speed: 0.6 });
    scene.add(arc.mesh);
    chain.push(arc);
  }

  const state = { station: 0, link: 0 };
  return {
    scene,
    actors,
    hotspots,
    beacons,
    state,
    update(t, dt) {
      for (const u of updaters) u(t, dt);
      beacons.forEach((b, i) => b.userData.update(t, i === state.station ? 1 : 0.4));
      arcs.forEach(({ a, arc }) => {
        const on = a.s === state.station ? state.link : 0.0;
        const p = a.get();
        arc.set(p, beacons[a.s].position, 6, on, t);
      });
      chain.forEach((arc, i) => {
        const from = beacons[i].position;
        const to = beacons[i + 1].position;
        arc.set(from, to, 26, 0.7, t);
      });
    },
  };
}

/** Isometric camera pose for a station. */
export function stationPose(i, aspect) {
  const [x, , z] = STATIONS[i].c;
  const portrait = aspect < 0.9;
  const k = portrait ? 1.25 : aspect < 1.3 ? 1.08 : 1;
  // desktop: push the scene right of the info card (screen-right is roughly (+0.79, 0, -0.61))
  const shift = portrait ? 0 : -20;
  const target = new THREE.Vector3(x + 2 + 0.79 * shift, portrait ? 6 : 2, z + (portrait ? 6 : 4) - 0.61 * shift);
  const pos = target.clone().add(new THREE.Vector3(92 * k, 96 * k, 120 * k));
  return { pos, target, fov: portrait ? 36 : 24 };
}
