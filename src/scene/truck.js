/**
 * Procedural American Class 8 long-hood sleeper tractor + 53 ft dry van.
 * Generic design (no manufacturer marks). Units are metres. The rig faces +X.
 *
 * Static parts are merged per material to keep draw calls low; the 18 wheels are instanced
 * so they can spin cheaply.
 */
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { trailerLivery, rearLivery, vanSeams, grille, glow } from './textures.js';

// ---- key dimensions ----
export const DIM = {
  tractorFrontX: 8.2, // world x of the front bumper
  trailerLen: 16.15,
  trailerW: 2.59,
  trailerFloor: 1.25,
  trailerTop: 4.11,
  tireR: 0.52,
};
const T = DIM.tractorFrontX; // tractor local x=0 -> world x=T
const STEER_X = -1.3;
const DRIVE_X = [-6.55, -7.85];
const SLEEPER_BACK = -5.62;
const TRAILER_FRONT = -6.35; // tractor-local
const CAB_W = 2.44;
const HOOD_W = 2.34;

export function createMaterials(renderer, { hi }) {
  const env = 1;
  const m = {
    paint: new THREE.MeshPhysicalMaterial({ color: 0xf2f4f6, roughness: 0.3, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.1, envMapIntensity: env }),
    van: new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.34, metalness: 0.0, envMapIntensity: env }),
    vanSide: new THREE.MeshStandardMaterial({ color: 0xffffff, map: vanSeams(renderer), roughness: 0.36, metalness: 0.0, envMapIntensity: env }),
    skirt: new THREE.MeshStandardMaterial({ color: 0xdfe4e9, roughness: 0.55, envMapIntensity: env }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xe6eaee, roughness: 0.12, metalness: 1, envMapIntensity: 1.3 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xc4cad2, roughness: 0.28, metalness: 1, envMapIntensity: 1.1 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1b2129, roughness: 0.55, metalness: 0.45 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x14181d, roughness: 0.6 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0e1013, roughness: 0.92 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0c1824, roughness: 0.06, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.4 }),
    grille: new THREE.MeshStandardMaterial({ map: grille(renderer), roughness: 0.25, metalness: 0.85 }),
    head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe8f0ff, emissiveIntensity: 3.2, roughness: 0.2 }),
    amber: new THREE.MeshStandardMaterial({ color: 0xffb547, emissive: 0xff9a2a, emissiveIntensity: 2.4 }),
    red: new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff1a12, emissiveIntensity: 2.6 }),
    lime: new THREE.MeshStandardMaterial({ color: 0x1a2a0a, emissive: 0xa6f24a, emissiveIntensity: 2.2, roughness: 0.4 }),
  };
  const liv = trailerLivery(renderer, { hi });
  m.livery = new THREE.MeshStandardMaterial({
    map: liv.map,
    emissiveMap: liv.emissiveMap,
    emissive: 0xa6f24a,
    emissiveIntensity: 1.6,
    transparent: true,
    roughness: 0.34,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    depthWrite: false,
  });
  m.rearLivery = new THREE.MeshStandardMaterial({ map: rearLivery(renderer), transparent: true, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
  m.glowTex = glow(renderer);
  return m;
}

/* ------------------------------------------------------------------ helpers */

class Parts {
  constructor() {
    this.lists = new Map();
  }
  add(geo, mat, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1] } = {}) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((g.attributes.position.count) * 2), 2));
    const mtx = new THREE.Matrix4().compose(
      new THREE.Vector3(...pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
      new THREE.Vector3(...scale),
    );
    g.applyMatrix4(mtx);
    if (!this.lists.has(mat)) this.lists.set(mat, []);
    this.lists.get(mat).push(g);
    return g;
  }
  /** add on both sides (mirrored in z) */
  pair(geo, mat, opts = {}) {
    const p = opts.pos || [0, 0, 0];
    const r = opts.rot || [0, 0, 0];
    this.add(geo, mat, { ...opts, pos: [p[0], p[1], p[2]] });
    this.add(geo, mat, { ...opts, pos: [p[0], p[1], -p[2]], rot: [-r[0], -r[1], r[2]] });
  }
  build(group, { cast = true, receive = true } = {}) {
    for (const [mat, geos] of this.lists) {
      const merged = mergeGeometries(geos, false);
      const mesh = new THREE.Mesh(merged, mat);
      mesh.castShadow = cast && !mat.transparent && !(mat.emissiveIntensity > 1.5);
      mesh.receiveShadow = receive && !mat.transparent;
      group.add(mesh);
      geos.forEach((g) => g.dispose());
    }
  }
}

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Extrude a side-profile shape across Z, centred, then warp Z with fn(x,y) -> scale. */
function profileBody(shape, width, bevel, warp, segs = 6) {
  const depth = width - bevel * 2;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: segs,
    curveSegments: 24,
    steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    p.setZ(i, p.getZ(i) * warp(x, y));
  }
  geo.deleteAttribute('normal');
  const merged = mergeVertices(geo, 1e-4);
  merged.computeVertexNormals();
  return merged;
}

/* ------------------------------------------------------------------ tractor */

const hoodWarp = (x, y) => {
  const front = smooth(-2.2, 0.15, x); // 0 at cowl -> 1 at nose
  const top = smooth(1.2, 2.1, y);
  let s = 1 - 0.11 * Math.pow(front, 1.4);
  s *= 1 - 0.13 * top;
  s *= 1 - 0.1 * front * smooth(1.35, 1.85, y);
  return s;
};
const cabWarp = (x, y) => {
  let s = 1 - 0.075 * smooth(2.2, 4.1, y);
  s *= 1 - 0.035 * smooth(-3.0, -2.1, x);
  return s;
};
const cabHalfAt = (x, y) => (CAB_W / 2) * cabWarp(x, y);

function buildTractor(parts, M, hi) {
  // Hood (with front wheel arch)
  const hood = new THREE.Shape();
  hood.moveTo(0.1, 0.62);
  hood.lineTo(0.15, 0.95);
  hood.quadraticCurveTo(0.17, 1.46, 0.03, 1.64);
  hood.quadraticCurveTo(-0.12, 1.83, -0.62, 1.86);
  hood.quadraticCurveTo(-1.35, 1.98, -2.12, 2.14);
  hood.lineTo(-2.25, 2.12);
  hood.lineTo(-2.25, 0.98);
  hood.lineTo(-2.05, 0.98);
  hood.lineTo(-2.04, 0.58);
  hood.absarc(STEER_X, 0.56, 0.74, Math.PI, 0, true);
  hood.lineTo(-0.45, 0.58);
  hood.lineTo(0.1, 0.62);
  parts.add(profileBody(hood, HOOD_W, 0.16, hoodWarp, 7), M.paint);

  // Cab + sleeper with integrated high-roof fairing
  const cab = new THREE.Shape();
  cab.moveTo(-2.12, 0.98);
  cab.lineTo(-2.12, 2.06);
  cab.lineTo(-2.2, 2.2);
  cab.lineTo(-2.95, 3.02);
  cab.quadraticCurveTo(-3.12, 3.2, -3.5, 3.38);
  cab.quadraticCurveTo(-4.05, 3.64, -4.55, 3.9);
  cab.quadraticCurveTo(-4.75, 3.98, -5.05, 3.98);
  cab.lineTo(-5.45, 3.98);
  cab.quadraticCurveTo(-5.62, 3.98, -5.62, 3.82);
  cab.lineTo(-5.62, 1.12);
  cab.quadraticCurveTo(-5.62, 0.98, -5.48, 0.98);
  cab.lineTo(-2.12, 0.98);
  parts.add(profileBody(cab, CAB_W, 0.14, cabWarp, 6), M.paint);

  // Windshield (one piece, slightly wrapped)
  {
    const b = new THREE.Vector2(-2.2, 2.22);
    const t = new THREE.Vector2(-2.93, 3.0);
    const n = new THREE.Vector2(0.82, 0.77).normalize().multiplyScalar(0.125);
    const segs = 8;
    const geo = new THREE.BufferGeometry();
    const pos = [];
    const uv = [];
    const hw0 = cabHalfAt(-2.2, 2.25) - 0.13;
    const hw1 = cabHalfAt(-2.93, 3.0) - 0.16;
    for (let i = 0; i < segs; i++) {
      const s0 = i / segs, s1 = (i + 1) / segs;
      const zA = (s) => -1 + 2 * s;
      const pt = (base, hw, s) => {
        const z = zA(s);
        const wrap = 0.16 * z * z; // pull edges back
        return new THREE.Vector3(base.x + n.x - wrap * 0.6, base.y + n.y - wrap * 0.15, z * hw);
      };
      const a = pt(b, hw0, s0), bb = pt(b, hw0, s1), c = pt(t, hw1, s1), d = pt(t, hw1, s0);
      [a, c, bb, a, d, c].forEach((v) => pos.push(v.x, v.y, v.z));
      uv.push(s0, 0, s1, 1, s1, 0, s0, 0, s0, 1, s1, 1);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    parts.add(geo, M.glass);
  }

  // Door windows + small sleeper window, both sides
  {
    const win = new THREE.Shape();
    win.moveTo(-2.46, 2.2);
    win.lineTo(-3.34, 2.2);
    win.lineTo(-3.34, 2.92);
    win.lineTo(-3.08, 2.92);
    win.lineTo(-2.46, 2.27);
    const wg = new THREE.ShapeGeometry(win);
    const zw = cabHalfAt(-2.9, 2.55) + 0.012;
    parts.add(wg, M.glass, { pos: [0, 0, zw], rot: [0, 0, 0] });
    const wg2 = wg.clone();
    wg2.scale(1, 1, -1);
    // flip winding for -z side
    const idx = wg2.index;
    if (idx) for (let i = 0; i < idx.count; i += 3) { const a = idx.getX(i); idx.setX(i, idx.getX(i + 2)); idx.setX(i + 2, a); }
    wg2.computeVertexNormals();
    parts.add(wg2, M.glass, { pos: [0, 0, -zw] });

  }

  // Door gaps (thin dark lines) and grab handles
  const zDoor = cabHalfAt(-2.8, 1.6) + 0.006;
  const gapV = new THREE.BoxGeometry(0.018, 1.95, 0.01);
  parts.pair(gapV, M.dark, { pos: [-3.46, 1.98, zDoor] });
  const gapF = new THREE.BoxGeometry(0.018, 1.15, 0.01);
  parts.pair(gapF, M.dark, { pos: [-2.3, 1.56, zDoor] });
  const handle = new THREE.CylinderGeometry(0.018, 0.018, 0.9, 8);
  parts.pair(handle, M.chrome, { pos: [-2.2, 1.75, zDoor + 0.06] });
  parts.pair(handle, M.chrome, { pos: [-3.56, 1.75, zDoor + 0.06] });

  // Bumper, air dam, grille, headlights
  parts.add(new RoundedBoxGeometry(0.42, 0.42, 2.5, 4, 0.13), M.alu, { pos: [0.16, 0.5, 0] });
  parts.add(new RoundedBoxGeometry(0.3, 0.16, 2.3, 2, 0.06), M.plastic, { pos: [0.12, 0.24, 0] });
  {
    const gs = new THREE.Shape();
    gs.moveTo(-0.5, 0);
    gs.lineTo(0.5, 0);
    gs.lineTo(0.56, 0.62);
    gs.quadraticCurveTo(0.56, 0.7, 0.48, 0.7);
    gs.lineTo(-0.48, 0.7);
    gs.quadraticCurveTo(-0.56, 0.7, -0.56, 0.62);
    gs.lineTo(-0.5, 0);
    const surround = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.035, bevelSegments: 3 });
    surround.rotateY(Math.PI / 2);
    parts.add(surround, M.chrome, { pos: [0.27, 0.82, 0], rot: [0, 0, 0.1] });
    const inner = new THREE.ShapeGeometry(gs);
    // remap uv to 0..1
    const uv = inner.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 0.56) / 1.12, uv.getY(i) / 0.7);
    inner.rotateY(Math.PI / 2);
    inner.scale(1, 0.92, 0.92);
    parts.add(inner, M.grille, { pos: [0.335, 0.85, 0], rot: [0, 0, 0.1] });
  }
  const lamp = new RoundedBoxGeometry(0.52, 0.15, 0.3, 3, 0.06);
  parts.pair(lamp, M.plastic, { pos: [0.1, 1.4, 0.82], rot: [0, -0.5, 0.14] });
  const lens = new RoundedBoxGeometry(0.36, 0.09, 0.2, 2, 0.04);
  parts.pair(lens, M.head, { pos: [0.17, 1.41, 0.84], rot: [0, -0.5, 0.14] });
  // fog / turn lights on bumper
  parts.pair(new THREE.BoxGeometry(0.04, 0.06, 0.22), M.amber, { pos: [0.38, 0.6, 1.0] });

  // Mirrors: door (west-coast) + hood mirrors
  const arm = new THREE.CylinderGeometry(0.02, 0.02, 0.36, 6);
  parts.pair(arm, M.dark, { pos: [-2.42, 2.32, 1.38], rot: [Math.PI / 2, 0, 0] });
  parts.pair(arm, M.dark, { pos: [-2.42, 2.76, 1.38], rot: [Math.PI / 2, 0, 0] });
  parts.pair(new RoundedBoxGeometry(0.1, 0.55, 0.22, 2, 0.04), M.plastic, { pos: [-2.42, 2.54, 1.56] });
  parts.pair(new RoundedBoxGeometry(0.08, 0.14, 0.16, 2, 0.03), M.plastic, { pos: [-0.62, 1.98, 1.06] });
  parts.pair(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), M.dark, { pos: [-0.62, 1.88, 0.98], rot: [0.5, 0, 0] });

  // Cab clearance lights (5 amber) on the windshield header
  for (let i = -2; i <= 2; i++) parts.add(new THREE.BoxGeometry(0.06, 0.05, 0.12), M.amber, { pos: [-3.02, 3.15 + Math.abs(i) * -0.005, i * 0.42] });

  // Exhaust stacks behind the sleeper
  const stack = new THREE.CylinderGeometry(0.085, 0.085, 3.4, 18);
  parts.pair(stack, M.chrome, { pos: [-5.78, 2.75, 1.0] });
  const shield = new THREE.CylinderGeometry(0.11, 0.11, 1.1, 18, 1, true);
  parts.pair(shield, M.alu, { pos: [-5.78, 2.3, 1.0] });
  parts.pair(new THREE.TorusGeometry(0.085, 0.012, 6, 18), M.chrome, { pos: [-5.78, 4.45, 1.0], rot: [Math.PI / 2, 0, 0] });

  // Fuel tanks + straps + steps
  const tank = new THREE.CylinderGeometry(0.33, 0.33, 1.55, 28);
  parts.pair(tank, M.chrome, { pos: [-3.2, 0.68, 0.92], rot: [0, 0, Math.PI / 2] });
  const strap = new THREE.CylinderGeometry(0.338, 0.338, 0.06, 28);
  parts.pair(strap, M.dark, { pos: [-2.68, 0.68, 0.92], rot: [0, 0, Math.PI / 2] });
  parts.pair(strap, M.dark, { pos: [-3.72, 0.68, 0.92], rot: [0, 0, Math.PI / 2] });
  parts.pair(new THREE.BoxGeometry(0.5, 0.05, 0.24), M.alu, { pos: [-2.25, 0.62, 1.12] });

  // Chassis fairing behind tanks (battery box cover)
  parts.pair(new RoundedBoxGeometry(1.55, 0.6, 0.08, 2, 0.03), M.paint, { pos: [-4.72, 0.72, 1.16] });

  // Frame rails, deck plate, fifth wheel, axle housings, mud flaps
  parts.pair(new THREE.BoxGeometry(8.6, 0.3, 0.1), M.dark, { pos: [-4.25, 0.82, 0.46] });
  parts.add(new THREE.BoxGeometry(0.7, 0.05, 1.0), M.alu, { pos: [-5.98, 1.08, 0] });
  parts.add(new THREE.BoxGeometry(1.0, 0.14, 1.1), M.dark, { pos: [-7.2, 1.12, 0] });
  parts.add(new THREE.CylinderGeometry(0.1, 0.1, 1.9, 12), M.dark, { pos: [STEER_X, 0.52, 0], rot: [Math.PI / 2, 0, 0] });
  DRIVE_X.forEach((x) => {
    parts.add(new THREE.CylinderGeometry(0.13, 0.13, 1.7, 14), M.dark, { pos: [x, 0.52, 0], rot: [Math.PI / 2, 0, 0] });
    parts.add(new THREE.SphereGeometry(0.22, 14, 10), M.dark, { pos: [x, 0.52, 0] });
  });
  parts.pair(new THREE.BoxGeometry(0.03, 0.72, 0.62), M.plastic, { pos: [-8.55, 0.5, 0.98] });
  // quarter fenders over drive axles
  const qf = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 20, 1, true, Math.PI * 0.12, Math.PI * 0.76);
  qf.rotateX(Math.PI / 2);
  qf.rotateZ(Math.PI / 2);
  parts.pair(qf, M.plastic, { pos: [-7.2, 0.6, 1.0], scale: [1, 1, 1] });
}

/* ------------------------------------------------------------------ trailer */

function buildTrailer(parts, M, group) {
  const L = DIM.trailerLen;
  const W = DIM.trailerW;
  const y0 = DIM.trailerFloor;
  const H = DIM.trailerTop - y0;
  const xf = T + TRAILER_FRONT; // world x of trailer front
  const xc = xf - L / 2;

  // Box: side faces (+z, -z) get the seam material
  const box = new RoundedBoxGeometry(L, H, W, 3, 0.07);
  const boxMesh = new THREE.Mesh(box, [M.van, M.van, M.van, M.van, M.vanSide, M.vanSide]);
  boxMesh.position.set(xc, y0 + H / 2, 0);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  group.add(boxMesh);

  // Rails (aluminium) top and bottom
  parts.pair(new THREE.BoxGeometry(L, 0.09, 0.03), M.alu, { pos: [xc, DIM.trailerTop - 0.08, W / 2 + 0.008] });
  parts.pair(new THREE.BoxGeometry(L, 0.2, 0.04), M.alu, { pos: [xc, y0 + 0.08, W / 2 + 0.01] });

  // Livery decals
  const decal = new THREE.PlaneGeometry(13, 2.3);
  const dR = new THREE.Mesh(decal, M.livery);
  dR.position.set(xc + 0.2, y0 + H * 0.56, W / 2 + 0.014);
  const dL = dR.clone();
  dL.position.z = -W / 2 - 0.014;
  dL.rotation.y = Math.PI;
  dR.renderOrder = dL.renderOrder = 2;
  group.add(dR, dL);

  // Under-floor subframe + cross members
  parts.add(new THREE.BoxGeometry(L - 0.4, 0.22, W - 0.3), M.dark, { pos: [xc, y0 - 0.11, 0] });

  // Aero side skirts
  parts.pair(new RoundedBoxGeometry(9.4, 0.78, 0.04, 2, 0.015), M.skirt, { pos: [xf - 8.15, y0 - 0.45, W / 2 - 0.08] });

  // Landing gear
  const lgx = xf - 3.1;
  parts.pair(new THREE.BoxGeometry(0.13, 1.0, 0.13), M.dark, { pos: [lgx, 0.72, 0.72] });
  parts.pair(new THREE.BoxGeometry(0.34, 0.05, 0.3), M.dark, { pos: [lgx, 0.2, 0.72] });
  parts.add(new THREE.CylinderGeometry(0.03, 0.03, 1.44, 6), M.dark, { pos: [lgx, 0.6, 0], rot: [Math.PI / 2, 0, 0] });

  // Tandem (slider) axles
  const ax = [xf - L + 1.25, xf - L + 2.5];
  ax.forEach((x) => parts.add(new THREE.CylinderGeometry(0.12, 0.12, 1.85, 12), M.dark, { pos: [x, 0.52, 0], rot: [Math.PI / 2, 0, 0] }));
  parts.add(new THREE.BoxGeometry(2.8, 0.26, 1.0), M.dark, { pos: [(ax[0] + ax[1]) / 2, 0.98, 0] });
  parts.pair(new THREE.BoxGeometry(0.03, 0.66, 0.62), M.plastic, { pos: [ax[0] - 0.75, 0.48, 0.98] });

  // Rear: frame, door seam, lock rods, lights, under-ride guard, decal
  const xr = xf - L;
  parts.add(new THREE.BoxGeometry(0.08, H + 0.02, 0.12), M.alu, { pos: [xr - 0.02, y0 + H / 2, W / 2 - 0.06] });
  parts.add(new THREE.BoxGeometry(0.08, H + 0.02, 0.12), M.alu, { pos: [xr - 0.02, y0 + H / 2, -W / 2 + 0.06] });
  parts.add(new THREE.BoxGeometry(0.08, 0.14, W), M.alu, { pos: [xr - 0.02, DIM.trailerTop - 0.07, 0] });
  parts.add(new THREE.BoxGeometry(0.12, 0.26, W), M.dark, { pos: [xr - 0.04, y0 - 0.02, 0] });
  parts.add(new THREE.BoxGeometry(0.02, H - 0.2, 0.02), M.dark, { pos: [xr - 0.045, y0 + H / 2, 0] });
  [-0.95, -0.4, 0.4, 0.95].forEach((z) => {
    parts.add(new THREE.CylinderGeometry(0.022, 0.022, H - 0.3, 8), M.chrome, { pos: [xr - 0.07, y0 + H / 2, z] });
    parts.add(new THREE.BoxGeometry(0.05, 0.05, 0.24), M.chrome, { pos: [xr - 0.09, y0 + 1.1, z + (z > 0 ? -0.1 : 0.1)] });
  });
  [-1.0, 1.0].forEach((z) => {
    parts.add(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 18), M.red, { pos: [xr - 0.08, y0 - 0.02, z], rot: [0, 0, Math.PI / 2] });
    parts.add(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 18), M.red, { pos: [xr - 0.08, y0 - 0.02, z * 0.78], rot: [0, 0, Math.PI / 2] });
  });
  [-0.2, 0, 0.2].forEach((z) => parts.add(new THREE.BoxGeometry(0.04, 0.05, 0.1), M.red, { pos: [xr - 0.06, DIM.trailerTop - 0.07, z] }));
  // under-ride guard
  parts.add(new THREE.BoxGeometry(0.1, 0.12, W - 0.2), M.dark, { pos: [xr + 0.25, 0.52, 0] });
  for (let i = 0; i < 8; i++) {
    const z = -W / 2 + 0.2 + (i + 0.5) * ((W - 0.4) / 8);
    parts.add(new THREE.BoxGeometry(0.02, 0.1, (W - 0.4) / 8 - 0.01), i % 2 ? M.red : M.chrome, { pos: [xr + 0.19, 0.52, z] });
  }
  parts.pair(new THREE.BoxGeometry(0.08, 0.7, 0.08), M.dark, { pos: [xr + 0.3, 0.86, 0.75] });
  const rd = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.85), M.rearLivery);
  rd.position.set(xr - 0.042, y0 + H * 0.72, 0.62);
  rd.rotation.y = -Math.PI / 2;
  group.add(rd);
  const rd2 = rd.clone();
  rd2.position.z = -0.62;
  rd2.visible = false; // single decal on the right door
  // side marker lights
  [xf - 0.3, xc, xr + 0.3].forEach((x, i) => {
    parts.pair(new THREE.BoxGeometry(0.1, 0.06, 0.03), i === 2 ? M.red : M.amber, { pos: [x, DIM.trailerTop - 0.2, W / 2 + 0.02] });
  });

  return { ax, xr, xf };
}

/* ------------------------------------------------------------------ wheels */

function tireGeometry() {
  const r = DIM.tireR;
  const w = 0.28;
  const pts = [];
  const ri = 0.29;
  pts.push(new THREE.Vector2(ri, -w / 2 + 0.02));
  pts.push(new THREE.Vector2(r - 0.07, -w / 2));
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - 0.06 + Math.cos(a) * 0.06, -w / 2 + 0.06 + Math.sin(a) * 0.06));
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    pts.push(new THREE.Vector2(r - 0.06 + Math.cos(a) * 0.06, w / 2 - 0.06 + Math.sin(a) * 0.06));
  }
  pts.push(new THREE.Vector2(r - 0.07, w / 2));
  pts.push(new THREE.Vector2(ri, w / 2 - 0.02));
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateX(Math.PI / 2);
  return g;
}

function rimGeometry() {
  // Polished dished disc with hub, facing +z
  const pts = [
    new THREE.Vector2(0.0, 0.07),
    new THREE.Vector2(0.06, 0.07),
    new THREE.Vector2(0.09, 0.05),
    new THREE.Vector2(0.11, 0.035),
    new THREE.Vector2(0.15, 0.03),
    new THREE.Vector2(0.24, 0.0),
    new THREE.Vector2(0.27, 0.01),
    new THREE.Vector2(0.295, 0.045),
    new THREE.Vector2(0.305, 0.05),
    new THREE.Vector2(0.305, -0.12),
  ];
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateX(Math.PI / 2);
  return g;
}

function buildWheels(group, M, axles) {
  const tire = tireGeometry();
  const rim = rimGeometry();
  const list = []; // { x, z, flip }
  const add = (x, z) => list.push({ x, z, flip: z < 0 });
  add(T + STEER_X, 1.04);
  add(T + STEER_X, -1.04);
  [...DRIVE_X.map((x) => T + x), ...axles].forEach((x) => {
    add(x, 1.15);
    add(x, 0.84);
    add(x, -1.15);
    add(x, -0.84);
  });
  const tires = new THREE.InstancedMesh(tire, M.rubber, list.length);
  const rims = new THREE.InstancedMesh(rim, M.alu, list.length);
  tires.castShadow = true;
  tires.receiveShadow = true;
  rims.castShadow = false;
  group.add(tires, rims);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const s = new THREE.Vector3(1, 1, 1);
  const flipQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, 0));
  let angle = 0;
  const update = (distance) => {
    angle = -distance / DIM.tireR;
    list.forEach((w, i) => {
      e.set(0, 0, angle);
      q.setFromEuler(e);
      if (w.flip) q.multiply(flipQ);
      v.set(w.x, DIM.tireR, w.z);
      m.compose(v, q, s);
      tires.setMatrixAt(i, m);
      rims.setMatrixAt(i, m);
    });
    tires.instanceMatrix.needsUpdate = true;
    rims.instanceMatrix.needsUpdate = true;
  };
  update(0);
  return { update };
}

/* ------------------------------------------------------------------ public */

export function createTruck(renderer, { hi = true } = {}) {
  const M = createMaterials(renderer, { hi });
  const group = new THREE.Group();
  group.name = 'truck';

  const tractorParts = new Parts();
  buildTractor(tractorParts, M, hi);
  const tractor = new THREE.Group();
  tractor.position.x = T;
  tractorParts.build(tractor);
  group.add(tractor);

  const trailerParts = new Parts();
  const tr = buildTrailer(trailerParts, M, group);
  trailerParts.build(group);

  const wheels = buildWheels(group, M, tr.ax);

  // Headlight glow sprites (front)
  const glowMat = new THREE.SpriteMaterial({ map: M.glowTex, color: 0xdfe8ff, opacity: 0.7, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const glows = [];
  [0.84, -0.84].forEach((z) => {
    const s = new THREE.Sprite(glowMat);
    s.position.set(T + 0.3, 1.41, z);
    s.scale.set(0.8, 0.8, 1);
    group.add(s);
    glows.push(s);
  });

  const anchors = {
    door: new THREE.Vector3(T - 2.9, 2.5, 1.25),
    cab: new THREE.Vector3(T - 3.6, 3.4, 0),
    roof: new THREE.Vector3(tr.xf - 6, DIM.trailerTop + 0.05, 0),
    trailerMid: new THREE.Vector3(tr.xf - 6.5, 2.9, DIM.trailerW / 2),
    trailerRear: new THREE.Vector3(tr.xr + 1.5, 3.4, -DIM.trailerW / 2),
    rearDoors: new THREE.Vector3(tr.xr - 0.05, 2.8, 0),
    hub: new THREE.Vector3(tr.xf - 3.5, DIM.trailerTop + 0.05, 0),
  };

  return {
    group,
    anchors,
    materials: M,
    headlights: [new THREE.Vector3(T + 0.3, 1.41, 0.84), new THREE.Vector3(T + 0.3, 1.41, -0.84)],
    update(distance) {
      wheels.update(distance);
    },
    center: new THREE.Vector3((T + tr.xr) / 2, 2, 0),
  };
}
