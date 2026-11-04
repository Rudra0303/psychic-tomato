/**
 * Procedural low-poly models for every mode: trucks, containers, trains, ships, planes, cranes,
 * buildings and trees. Stylised and generic: no manufacturer marks. Units: metres, +X forward.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ------------------------------------------------------------------ materials */
const C = {
  white: 0xf7f6f2,
  paper: 0xe7e3da,
  sand: 0xcfc8b8,
  ink: 0x1b1d22,
  ink2: 0x2a2d33,
  steel: 0x8d8b85,
  slate: 0x5a6270,
  orange: 0xff5a1f,
  sage: 0x9fb39a,
  sage2: 0x7f9a7c,
  glass: 0x2b3542,
  road: 0x2c2f35,
};

function corrugation() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 8;
  const g = c.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 128, 8);
  for (let x = 0; x < 128; x += 8) {
    g.fillStyle = 'rgba(0,0,0,0.16)';
    g.fillRect(x, 0, 2, 8);
    g.fillStyle = 'rgba(255,255,255,0.6)';
    g.fillRect(x + 2, 0, 1, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(6, 1);
  return t;
}

const cache = {};
export function mat(name) {
  if (cache[name]) return cache[name];
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...o });
  const m = {
    white: () => std(C.white),
    paper: () => std(C.paper, { roughness: 0.95 }),
    sand: () => std(C.sand),
    ink: () => std(C.ink, { roughness: 0.6 }),
    ink2: () => std(C.ink2, { roughness: 0.7 }),
    steel: () => std(C.steel, { roughness: 0.5, metalness: 0.4 }),
    slate: () => std(C.slate),
    orange: () => std(C.orange, { roughness: 0.6 }),
    sage: () => std(C.sage, { roughness: 1 }),
    sage2: () => std(C.sage2, { roughness: 1 }),
    glass: () => std(C.glass, { roughness: 0.15, metalness: 0.3 }),
    road: () => std(C.road, { roughness: 0.9 }),
    tire: () => std(0x141518, { roughness: 0.95 }),
    light: () => new THREE.MeshBasicMaterial({ color: 0xfff3d6 }),
    lineWhite: () => new THREE.MeshBasicMaterial({ color: 0xf2f0eb }),
  };
  cache[name] = m[name]();
  return cache[name];
}

let corr = null;
const contCache = {};
export function containerMat(color) {
  corr = corr || corrugation();
  if (!contCache[color]) contCache[color] = new THREE.MeshStandardMaterial({ color, map: corr, roughness: 0.75 });
  return contCache[color];
}
export const CONTAINER_COLORS = [C.orange, C.ink, C.sand, C.white, C.slate, 0xc94a1d, 0x8a8f99];

/* ------------------------------------------------------------------ helpers */
export function box(w, h, d, material, r = 0) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
export function cyl(rt, rb, h, material, seg = 16) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => {
  o.position.set(x, y, z);
  o.rotation.set(rx, ry, rz);
  return o;
};

/** Merge every static mesh in a group into one mesh per material. */
export function bake(group) {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  const byMat = new Map();
  const remove = [];
  group.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.userData.keep) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    if (!byMat.has(o.material)) byMat.set(o.material, []);
    byMat.get(o.material).push(g);
    remove.push(o);
  });
  remove.forEach((o) => o.parent.remove(o));
  for (const [m, geos] of byMat) {
    const mesh = new THREE.Mesh(mergeGeometries(geos), m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}

/* ------------------------------------------------------------------ wheels */
function wheelSet(group, xs, z, r = 0.5) {
  const g = new THREE.CylinderGeometry(r, r, 0.4, 14);
  g.rotateX(Math.PI / 2);
  const wheels = [];
  xs.forEach((x) =>
    [z, -z].forEach((zz) => {
      const w = new THREE.Mesh(g, mat('tire'));
      w.position.set(x, r, zz);
      w.castShadow = true;
      group.add(w);
      wheels.push(w);
    }),
  );
  return wheels;
}

/* ------------------------------------------------------------------ container (40 ft) */
export function container(color = C.orange, len = 12.2) {
  const m = box(len, 2.6, 2.44, containerMat(color), 0.06);
  m.position.y = 1.3;
  const g = new THREE.Group();
  g.add(m);
  g.userData.len = len;
  return g;
}

/* ------------------------------------------------------------------ truck */
export function tractor({ color = 'white' } = {}) {
  const g = new THREE.Group();
  g.add(at(box(2.2, 0.5, 2.3, mat('ink'), 0.1), 0, 1.0, 0));
  g.add(at(box(2.3, 2.5, 2.45, mat(color), 0.28), 0.05, 2.45, 0)); // cab
  g.add(at(box(1.3, 1.3, 2.2, mat(color), 0.25), 1.4, 1.65, 0)); // hood
  g.add(at(box(0.08, 1.0, 2.0, mat('glass'), 0.04), 1.2, 3.05, 0)); // windshield
  g.add(at(box(0.15, 0.55, 2.35, mat('ink'), 0.06), 2.05, 1.15, 0)); // bumper
  g.add(at(box(2.0, 0.12, 2.46, mat('orange')), 0.05, 1.85, 0)); // stripe
  g.add(at(box(0.9, 0.08, 0.5, mat('light')), 2.07, 1.6, 0.8));
  g.add(at(box(0.9, 0.08, 0.5, mat('light')), 2.07, 1.6, -0.8));
  g.userData.wheels = wheelSet(g, [1.35, -0.6, -1.7], 1.05, 0.52);
  g.userData.len = 4.2;
  return g;
}

/** Tractor + trailer. kind: 'box' (dry van with stripe) or 'chassis' (carries a container). */
export function truck({ kind = 'box', color = 'white' } = {}) {
  const g = new THREE.Group();
  const t = tractor({ color });
  t.position.x = 6.6;
  g.add(t);
  const trailer = new THREE.Group();
  if (kind === 'box') {
    trailer.add(at(box(12.4, 3.0, 2.5, mat('white'), 0.12), -0.5, 2.75, 0));
    trailer.add(at(box(12.0, 0.35, 2.52, mat('orange')), -0.5, 1.55, 0));
  } else {
    trailer.add(at(box(12.6, 0.3, 2.2, mat('ink')), -0.5, 1.25, 0));
  }
  trailer.add(at(box(12.2, 0.4, 1.0, mat('ink')), -0.5, 1.0, 0));
  g.add(trailer);
  g.userData.wheels = [...t.userData.wheels, ...wheelSet(g, [-4.6, -5.8], 1.05, 0.52)];
  g.userData.deckY = 1.4;
  g.userData.len = 15;
  return g;
}

/* ------------------------------------------------------------------ rail */
export function locomotive() {
  const g = new THREE.Group();
  g.add(at(box(16, 0.6, 2.8, mat('ink')), 0, 1.4, 0));
  g.add(at(box(15, 3.2, 2.9, mat('orange'), 0.3), -0.2, 3.3, 0));
  g.add(at(box(3, 1.2, 2.92, mat('ink'), 0.1), 6.2, 4.1, 0));
  g.add(at(box(0.1, 1.0, 2.4, mat('glass')), 7.65, 4.2, 0));
  g.add(at(box(14, 0.3, 2.95, mat('white')), -0.4, 2.0, 0));
  wheelSet(g, [-5.5, -4.2, 4.2, 5.5], 1.0, 0.55);
  g.userData.len = 16;
  return g;
}
export function flatcar(contColor) {
  const g = new THREE.Group();
  g.add(at(box(13.5, 0.4, 2.6, mat('ink2')), 0, 1.3, 0));
  wheelSet(g, [-5, -4, 4, 5], 1.0, 0.45);
  if (contColor != null) {
    const c = container(contColor);
    c.position.y = 1.5;
    g.add(c);
    g.userData.cont = c;
  }
  g.userData.len = 14.5;
  return g;
}
export function train(n = 6, { first = null } = {}) {
  const g = new THREE.Group();
  const loco = locomotive();
  g.add(loco);
  let x = -loco.userData.len / 2 - 0.5;
  g.userData.cars = [];
  for (let i = 0; i < n; i++) {
    const color = i === 0 && first != null ? first : CONTAINER_COLORS[(i * 3) % CONTAINER_COLORS.length];
    const car = flatcar(i === 0 && first === 'empty' ? null : color);
    x -= car.userData.len / 2;
    car.position.x = x;
    x -= car.userData.len / 2 + 0.5;
    g.add(car);
    g.userData.cars.push(car);
  }
  g.userData.len = -x;
  return g;
}
export function track(len, { sleepers = true } = {}) {
  const g = new THREE.Group();
  g.add(at(box(len, 0.15, 3.4, mat('sand')), 0, 0.07, 0));
  [-0.75, 0.75].forEach((z) => g.add(at(box(len, 0.18, 0.14, mat('steel')), 0, 0.3, z)));
  if (sleepers) {
    const sg = new THREE.BoxGeometry(0.4, 0.12, 2.6);
    const n = Math.floor(len / 1.4);
    const im = new THREE.InstancedMesh(sg, mat('ink2'), n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) im.setMatrixAt(i, m4.makeTranslation(-len / 2 + i * 1.4 + 0.7, 0.18, 0));
    im.receiveShadow = true;
    g.add(im);
  }
  return g;
}

/* ------------------------------------------------------------------ ship */
export function ship({ len = 70, beam = 12, stacks = 7 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  const L = len / 2;
  s.moveTo(-L, -beam / 2);
  s.lineTo(L - 10, -beam / 2);
  s.quadraticCurveTo(L, -beam / 2, L + 2, 0);
  s.quadraticCurveTo(L, beam / 2, L - 10, beam / 2);
  s.lineTo(-L, beam / 2);
  s.lineTo(-L, -beam / 2);
  const hull = new THREE.ExtrudeGeometry(s, { depth: 5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 2 });
  hull.rotateX(-Math.PI / 2);
  const hm = new THREE.Mesh(hull, mat('ink'));
  hm.position.y = -2.2;
  hm.castShadow = hm.receiveShadow = true;
  g.add(hm);
  const deck = new THREE.Mesh(new THREE.ShapeGeometry(s), mat('slate'));
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 2.85;
  deck.receiveShadow = true;
  g.add(deck);
  g.add(at(box(len * 1.02, 0.8, beam + 0.6, mat('orange')), 0.6, 0.1, 0)); // waterline band
  // bridge at stern
  g.add(at(box(7, 9, beam - 1, mat('white'), 0.3), -L + 5, 7.3, 0));
  g.add(at(box(7.2, 1.2, beam + 2, mat('white'), 0.2), -L + 5, 11, 0));
  g.add(at(box(0.2, 1.0, beam - 1.6, mat('glass')), -L + 8.6, 10, 0));
  g.add(at(cyl(0.8, 1, 3, mat('orange')), -L + 3, 12.5, 0));
  // container stacks (instanced)
  const cg = new RoundedBoxGeometry(6, 2.6, 2.44, 1, 0.05);
  const bays = stacks;
  const rows = Math.floor((beam - 1) / 2.5);
  const max = bays * rows * 4;
  const colors = [];
  const im = new THREE.InstancedMesh(cg, containerMat(0xffffff), max);
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  let k = 0;
  for (let b = 0; b < bays; b++)
    for (let r = 0; r < rows; r++) {
      const h = 2 + ((b * 7 + r * 3) % 3);
      for (let t = 0; t < h; t++) {
        m4.makeTranslation(-L + 13 + b * 7.2, 4.2 + t * 2.62, -((rows - 1) * 2.5) / 2 + r * 2.5);
        im.setMatrixAt(k, m4);
        im.setColorAt(k, col.setHex(CONTAINER_COLORS[(b * 5 + r * 3 + t * 2) % CONTAINER_COLORS.length]));
        k++;
      }
    }
  im.count = k;
  im.castShadow = im.receiveShadow = true;
  g.add(im);
  g.userData.len = len;
  g.userData.deckY = 2.9;
  return g;
}

/* ------------------------------------------------------------------ plane */
export function plane({ scale = 1, livery = 'white' } = {}) {
  const g = new THREE.Group();
  const body = new THREE.CapsuleGeometry(1.9, 26, 8, 16);
  body.rotateZ(Math.PI / 2);
  const b = new THREE.Mesh(body, mat(livery));
  b.position.y = 4;
  b.castShadow = b.receiveShadow = true;
  g.add(b);
  g.add(at(box(6, 0.15, 3.86, mat('orange')), -9, 4.6, 0)); // tail band
  // wings
  const wing = (span, root, tip, sweep, y, x) => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(-sweep, span);
    s.lineTo(-sweep - tip, span);
    s.lineTo(-root, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.35, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    const w1 = new THREE.Mesh(geo, mat('white'));
    w1.position.set(x, y, 0);
    const w2 = w1.clone();
    w2.scale.z = -1;
    w1.castShadow = w2.castShadow = true;
    g.add(w1, w2);
  };
  wing(17, 7, 2.2, 7, 3.2, 3);
  wing(6, 3.2, 1.4, 3.2, 4.8, -11);
  // fin
  const fs = new THREE.Shape();
  fs.moveTo(0, 0);
  fs.lineTo(-3.5, 6);
  fs.lineTo(-5.5, 6);
  fs.lineTo(-5.5, 0);
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.3, bevelEnabled: false }), mat('orange'));
  fin.position.set(-10, 5.2, -0.15);
  fin.castShadow = true;
  g.add(fin);
  // engines
  [-7, 7].forEach((z) => {
    const e = cyl(0.95, 0.95, 3.6, mat('ink2'), 14);
    e.rotation.z = Math.PI / 2;
    e.position.set(0.8, 2.2, z);
    g.add(e);
  });
  g.add(at(box(0.4, 0.5, 3.4, mat('glass'), 0.1), 14.4, 4.7, 0));
  // gear
  [[10, 0], [-1, 2.2], [-1, -2.2]].forEach(([x, z]) => g.add(at(cyl(0.12, 0.12, 2.1, mat('ink2'), 6), x, 1.2, z)));
  g.scale.setScalar(scale);
  g.userData.len = 30 * scale;
  return g;
}

/* ------------------------------------------------------------------ cranes */
export function gantry({ span = 18, h = 13, len = 4, color = 'orange' } = {}) {
  const g = new THREE.Group();
  [-span / 2, span / 2].forEach((z) => {
    [-len / 2, len / 2].forEach((x) => g.add(at(box(0.7, h, 0.7, mat(color)), x, h / 2, z)));
    g.add(at(box(len + 1, 0.6, 1.4, mat('ink')), 0, 0.3, z));
  });
  [-len / 2, len / 2].forEach((x) => g.add(at(box(0.9, 0.9, span + 2, mat(color)), x, h, 0)));
  const trolley = new THREE.Group();
  trolley.add(at(box(len + 0.6, 1.2, 2.2, mat('ink')), 0, h + 0.9, 0));
  const spreader = at(box(12.4, 0.35, 2.6, mat('ink')), 0, h - 3, 0);
  spreader.userData.keep = true;
  trolley.add(spreader);
  const cable = at(box(0.06, 3, 0.06, mat('ink')), 0, h - 1.5, 0);
  cable.userData.keep = true;
  trolley.add(cable);
  trolley.userData.spreader = spreader;
  trolley.userData.cable = cable;
  trolley.userData.h = h;
  g.add(trolley);
  g.userData.trolley = trolley;
  return g;
}

export function stsCrane({ h = 30, reach = 40, color = 'white' } = {}) {
  const g = new THREE.Group();
  const gauge = 16;
  [-gauge / 2, gauge / 2].forEach((x) =>
    [-6, 6].forEach((z) => g.add(at(box(1.2, h, 1.2, mat(color)), x, h / 2, z))),
  );
  [-6, 6].forEach((z) => g.add(at(box(gauge + 1.2, 1.4, 1.4, mat('orange')), 0, h - 6, z)));
  g.add(at(box(2, 2, reach + gauge + 12, mat(color)), 0, h + 1, -reach / 2 + 6));
  g.add(at(box(4, 6, 6, mat('ink')), 0, h + 5, 8));
  g.add(at(box(1, 12, 1, mat(color)), 0, h + 6, 0));
  const trolley = new THREE.Group();
  trolley.add(at(box(2.6, 1.4, 3, mat('ink')), 0, h - 0.4, 0));
  const spreader = at(box(2.6, 0.4, 12.4, mat('ink')), 0, h - 8, 0);
  spreader.userData.keep = true;
  trolley.add(spreader);
  trolley.userData.spreader = spreader;
  g.add(trolley);
  g.userData.trolley = trolley;
  g.userData.h = h;
  return g;
}

export function reachStacker() {
  const g = new THREE.Group();
  g.add(at(box(7, 1.4, 3, mat('orange'), 0.3), 0, 1.6, 0));
  g.add(at(box(2, 2.2, 2.2, mat('white'), 0.25), 1.5, 3.3, 0));
  g.add(at(box(0.1, 1.4, 1.8, mat('glass')), 2.52, 3.4, 0));
  g.userData.wheels = wheelSet(g, [2.3, -2.3], 1.35, 0.9);
  const boom = new THREE.Group();
  boom.position.set(-2.5, 3, 0);
  boom.add(at(box(11, 0.9, 0.9, mat('ink')), 5.5, 0, 0));
  const head = at(box(0.6, 0.6, 6, mat('ink')), 11, -0.6, 0);
  boom.add(head);
  g.add(boom);
  g.userData.boom = boom;
  return g;
}

/* ------------------------------------------------------------------ buildings */
export function warehouse({ w = 40, d = 24, h = 10, docks = 6, dockSide = 1, accent = 'orange' } = {}) {
  const g = new THREE.Group();
  g.add(at(box(w, h, d, mat('white'), 0.3), 0, h / 2, 0));
  g.add(at(box(w + 0.6, 0.7, d + 0.6, mat('ink2')), 0, h + 0.3, 0));
  for (let i = 0; i < 4; i++) g.add(at(box(w - 6, 0.25, 1.4, mat('paper')), 0, h + 0.75, -d / 2 + 4 + i * ((d - 8) / 3)));
  const z = (dockSide * d) / 2;
  for (let i = 0; i < docks; i++) {
    const x = -w / 2 + 4 + (i * (w - 8)) / Math.max(1, docks - 1);
    g.add(at(box(3, 3.6, 0.3, mat(i % 3 === 0 ? accent : 'ink2')), x, 2.2, z + dockSide * 0.1));
    g.add(at(box(3.6, 0.3, 1.6, mat('ink2')), x, 4.3, z + dockSide * 0.8));
  }
  g.add(at(box(w * 0.3, 0.6, 0.2, mat('orange')), -w * 0.25, h - 1.6, z + dockSide * 0.12));
  return g;
}

export function tower({ w = 14, d = 14, h = 40 } = {}) {
  const g = new THREE.Group();
  g.add(at(box(w, h, d, mat('white'), 0.4), 0, h / 2, 0));
  const bands = Math.floor(h / 3.4);
  for (let i = 1; i < bands; i++) {
    g.add(at(box(w + 0.1, 1.3, d * 0.86, mat('glass')), 0, i * 3.4, 0));
    g.add(at(box(w * 0.86, 1.3, d + 0.1, mat('glass')), 0, i * 3.4, 0));
  }
  g.add(at(box(w * 0.5, 3, d * 0.5, mat('ink')), 0, h + 1.5, 0));
  g.add(at(box(w + 0.2, 1.2, 0.2, mat('orange')), 0, h - 1, d / 2 + 0.05));
  return g;
}

export function controlTower() {
  const g = new THREE.Group();
  g.add(at(cyl(1.6, 2.2, 22, mat('white'), 12), 0, 11, 0));
  g.add(at(cyl(4, 3, 3.2, mat('glass'), 12), 0, 23.6, 0));
  g.add(at(cyl(4.2, 4.2, 0.8, mat('white'), 12), 0, 25.6, 0));
  g.add(at(cyl(0.15, 0.15, 4, mat('orange'), 6), 0, 28, 0));
  return g;
}

export function hangar({ w = 36, d = 28, h = 14 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-d / 2, 0);
  s.lineTo(-d / 2, h * 0.55);
  s.quadraticCurveTo(0, h * 1.25, d / 2, h * 0.55);
  s.lineTo(d / 2, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 12 });
  geo.translate(0, 0, -w / 2);
  geo.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(geo, mat('white'));
  m.castShadow = m.receiveShadow = true;
  g.add(m);
  g.add(at(box(0.3, h * 0.5, d * 0.7, mat('ink2')), w / 2 + 0.1, h * 0.27, 0));
  return g;
}

/* ------------------------------------------------------------------ nature + props */
export function trees(points, { scale = 1 } = {}) {
  const cone = new THREE.ConeGeometry(1.8, 5, 7);
  cone.translate(0, 4.5, 0);
  const round = new THREE.IcosahedronGeometry(2.2, 0);
  round.translate(0, 4.2, 0);
  const trunk = new THREE.CylinderGeometry(0.25, 0.3, 2.2, 5);
  trunk.translate(0, 1.1, 0);
  const g = new THREE.Group();
  const a = new THREE.InstancedMesh(cone, mat('sage'), points.length);
  const b = new THREE.InstancedMesh(round, mat('sage2'), points.length);
  const t = new THREE.InstancedMesh(trunk, mat('sand'), points.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let na = 0;
  let nb = 0;
  points.forEach(([x, z], i) => {
    const s = (0.8 + ((i * 7) % 5) * 0.12) * scale;
    m4.compose(new THREE.Vector3(x, 0, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), i), new THREE.Vector3(s, s, s));
    t.setMatrixAt(i, m4);
    if (i % 3) a.setMatrixAt(na++, m4);
    else b.setMatrixAt(nb++, m4);
  });
  a.count = na;
  b.count = nb;
  [a, b, t].forEach((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

export function containerStacks(origin, cols, rows, maxH = 3, seed = 1) {
  const g = new RoundedBoxGeometry(12.2, 2.6, 2.44, 1, 0.05);
  const n = cols * rows * maxH;
  const im = new THREE.InstancedMesh(g, containerMat(0xffffff), n);
  const m4 = new THREE.Matrix4();
  const col = new THREE.Color();
  let k = 0;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const h = 1 + ((c * 13 + r * 7 + seed) % maxH);
      for (let t = 0; t < h; t++) {
        m4.makeTranslation(origin[0] + c * 13, 1.3 + t * 2.62, origin[1] + r * 2.7);
        im.setMatrixAt(k, m4);
        im.setColorAt(k, col.setHex(CONTAINER_COLORS[(c * 3 + r * 5 + t + seed) % CONTAINER_COLORS.length]));
        k++;
      }
    }
  im.count = k;
  im.castShadow = im.receiveShadow = true;
  return im;
}

/** Flat road strip along X with centre dashes. */
export function road(len, width = 9, { dashes = true, color = 'road' } = {}) {
  const g = new THREE.Group();
  const r = at(box(len, 0.1, width, mat(color)), 0, 0.05, 0);
  r.castShadow = false;
  g.add(r);
  if (dashes) {
    const n = Math.floor(len / 6);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.02, 0.22), mat('lineWhite'), n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) im.setMatrixAt(i, m4.makeTranslation(-len / 2 + i * 6 + 3, 0.11, 0));
    g.add(im);
  }
  return g;
}

export function forklift(color = 'orange') {
  const g = new THREE.Group();
  g.add(at(box(2.4, 1.2, 1.4, mat(color), 0.2), 0, 0.9, 0));
  g.add(at(box(0.15, 2.6, 1.2, mat('ink')), 1.3, 1.5, 0));
  g.add(at(box(1.2, 0.1, 1.0, mat('ink')), 1.9, 0.4, 0));
  g.add(at(box(0.9, 0.9, 1.1, mat('sand')), 1.9, 0.9, 0));
  wheelSet(g, [0.8, -0.8], 0.6, 0.35);
  return g;
}

export function pallet() {
  const g = new THREE.Group();
  g.add(at(box(1.2, 0.15, 1.0, mat('sand')), 0, 0.08, 0));
  g.add(at(box(1.1, 1.0, 0.95, mat('paper'), 0.06), 0, 0.7, 0));
  return g;
}
