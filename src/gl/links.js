/**
 * Connection arcs (camera-facing ribbons along a quadratic Bezier, computed in the vertex
 * shader) and the floating "shipment record" beacon.
 */
import * as THREE from 'three';

const vert = /* glsl */ `
  attribute float aT; attribute float aSide;
  uniform vec3 p0; uniform vec3 p1; uniform vec3 p2; uniform float width;
  varying float vT; varying float vSide;
  vec3 bez(float t){ float u = 1.0 - t; return u*u*p0 + 2.0*u*t*p1 + t*t*p2; }
  vec3 dbez(float t){ return 2.0*(1.0-t)*(p1-p0) + 2.0*t*(p2-p1); }
  void main(){
    vT = aT; vSide = aSide;
    vec4 mv = viewMatrix * vec4(bez(aT), 1.0);
    vec3 tv = normalize((viewMatrix * vec4(dbez(aT), 0.0)).xyz);
    vec3 side = normalize(cross(tv, vec3(0.0, 0.0, 1.0)));
    mv.xyz += side * aSide * width;
    gl_Position = projectionMatrix * mv;
  }`;
const frag = /* glsl */ `
  uniform float progress; uniform float opacity; uniform float time; uniform vec3 color; uniform float speed;
  varying float vT; varying float vSide;
  void main(){
    if (vT > progress) discard;
    float dash = step(0.45, fract(vT * 26.0 - time * speed));
    float pulse = smoothstep(0.92, 1.0, fract(vT * 1.5 - time * 0.35));
    float a = opacity * max(dash * 0.85, pulse);
    if (a < 0.02) discard;
    gl_FragColor = vec4(mix(color, vec3(1.0), pulse * 0.2), a);
  }`;

let ribbon = null;
function ribbonGeo(segs = 80) {
  if (ribbon) return ribbon;
  const t = [];
  const s = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    t.push(i / segs, i / segs);
    s.push(-1, 1);
    if (i < segs) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(t.length * 3), 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
  g.setAttribute('aSide', new THREE.Float32BufferAttribute(s, 1));
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  ribbon = g;
  return g;
}

export function makeArc({ width = 0.2, color = 0xff5a1f, speed = 1.2 } = {}) {
  const u = {
    p0: { value: new THREE.Vector3() },
    p1: { value: new THREE.Vector3() },
    p2: { value: new THREE.Vector3() },
    width: { value: width },
    progress: { value: 0 },
    opacity: { value: 1 },
    time: { value: 0 },
    color: { value: new THREE.Color(color) },
    speed: { value: speed },
  };
  const mesh = new THREE.Mesh(
    ribbonGeo(),
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u, transparent: true, depthWrite: false }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return {
    mesh,
    set(a, b, lift, prog, time) {
      u.p0.value.copy(a);
      u.p2.value.copy(b);
      u.p1.value.copy(a).add(b).multiplyScalar(0.5);
      u.p1.value.y += lift;
      u.progress.value = prog;
      u.opacity.value = Math.min(1, prog * 1.5);
      u.time.value = time;
      mesh.visible = prog > 0.002;
    },
  };
}

/** Floating record beacon: a white disc with the orange core, ring and a stem to the ground. */
export function makeBeacon() {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xff5a1f }));
  core.position.y = 0.5;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4, 0.12, 8, 64), new THREE.MeshBasicMaterial({ color: 0x1b1d22 }));
  ring.rotation.x = Math.PI / 2;
  const pulse = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.1, 48), new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  pulse.rotation.x = -Math.PI / 2;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 30, 6), new THREE.MeshBasicMaterial({ color: 0x1b1d22, transparent: true, opacity: 0.25 }));
  stem.position.y = -15;
  disc.castShadow = true;
  g.add(disc, core, ring, pulse, stem);
  g.userData.update = (t, on) => {
    const s = 0.7 + 0.3 * on;
    g.scale.setScalar(s);
    ring.rotation.z = t * 0.3;
    const k = (t * 0.6) % 1;
    pulse.scale.setScalar(1 + k * 1.4);
    pulse.material.opacity = (1 - k) * on;
    g.position.y = 30 + Math.sin(t * 1.2) * 0.5;
  };
  return g;
}
