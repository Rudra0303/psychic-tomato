/**
 * Persona nodes floating around the truck, and lime arc "connection lines" that draw from each
 * node and lock onto the truck. Lines are camera-facing ribbons computed in the vertex shader
 * (quadratic Bezier), so drawing and pulsing is just uniforms.
 */
import * as THREE from 'three';

const ORDER = ['shipper', 'carrier', 'driver', 'forwarder', 'logistics'];

// Positions around the truck (x along the rig, y up, z lateral). "apart" = scattered.
const LAYOUT = {
  shipper: { apart: [22, 13, 16], joined: [12, 9.5, 9], anchor: 'cab' },
  carrier: { apart: [-4, 17, 22], joined: [-1, 11, 10], anchor: 'hub' },
  driver: { apart: [18, 8, -18], joined: [11, 7.5, -8], anchor: 'door' },
  forwarder: { apart: [-24, 15, -22], joined: [-11, 10.5, -9], anchor: 'roof' },
  logistics: { apart: [-34, 9, 14], joined: [-20, 8, 8], anchor: 'rearDoors' },
};

const arcVert = /* glsl */ `
  attribute float aT; attribute float aSide;
  uniform vec3 p0; uniform vec3 p1; uniform vec3 p2; uniform float width;
  varying float vT; varying float vSide;
  vec3 bez(float t){ float u = 1.0 - t; return u*u*p0 + 2.0*u*t*p1 + t*t*p2; }
  vec3 dbez(float t){ return 2.0*(1.0-t)*(p1-p0) + 2.0*t*(p2-p1); }
  void main(){
    vT = aT; vSide = aSide;
    vec3 P = bez(aT);
    vec4 mv = viewMatrix * vec4(P, 1.0);
    vec3 tv = normalize((viewMatrix * vec4(dbez(aT), 0.0)).xyz);
    vec3 side = normalize(cross(tv, vec3(0.0, 0.0, 1.0)));
    // keep a minimum on-screen width as lines recede
    float w = width * (1.0 + 0.012 * -mv.z);
    mv.xyz += side * aSide * w;
    gl_Position = projectionMatrix * mv;
  }`;

const arcFrag = /* glsl */ `
  uniform float progress; uniform float opacity; uniform float time; uniform vec3 color; uniform float boost;
  varying float vT; varying float vSide;
  void main(){
    if (vT > progress) discard;
    float edge = 1.0 - smoothstep(0.35, 1.0, abs(vSide));
    float head = smoothstep(progress - 0.08, progress, vT) * step(progress, 0.999);
    float pulse = pow(fract(vT * 2.0 - time * 0.45), 14.0);
    float a = edge * opacity * (0.55 + 0.45 * pulse + head);
    vec3 c = color * (1.6 + 2.2 * pulse * boost + 3.0 * head);
    gl_FragColor = vec4(c, a);
  }`;

function ribbonGeometry(segs = 64) {
  const t = [];
  const side = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    const v = i / segs;
    t.push(v, v);
    side.push(-1, 1);
    if (i < segs) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(t.length * 3), 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
  g.setAttribute('aSide', new THREE.Float32BufferAttribute(side, 1));
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  return g;
}

export function createNetwork(scene, anchors, glowTex) {
  const group = new THREE.Group();
  scene.add(group);
  const ribbon = ribbonGeometry();
  const lime = new THREE.Color(0xa6f24a);
  const time = { value: 0 };

  const makeArc = (width, boost = 1) =>
    new THREE.Mesh(
      ribbon,
      new THREE.ShaderMaterial({
        vertexShader: arcVert,
        fragmentShader: arcFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          p0: { value: new THREE.Vector3() },
          p1: { value: new THREE.Vector3() },
          p2: { value: new THREE.Vector3() },
          width: { value: width },
          progress: { value: 0 },
          opacity: { value: 1 },
          time,
          color: { value: lime },
          boost: { value: boost },
        },
      }),
    );

  const coreGeo = new THREE.SphereGeometry(0.32, 20, 14);
  const ringGeo = new THREE.TorusGeometry(0.85, 0.03, 8, 64);
  const ring2Geo = new THREE.TorusGeometry(1.25, 0.012, 6, 64);
  const nodes = ORDER.map((key, i) => {
    const L = LAYOUT[key];
    const g = new THREE.Group();
    const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xdfe7f2), transparent: true, toneMapped: false });
    const core = new THREE.Mesh(coreGeo, coreMat);
    const ringMat = new THREE.MeshBasicMaterial({ color: lime.clone().multiplyScalar(2.2), transparent: true, toneMapped: false });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ring2Geo, new THREE.MeshBasicMaterial({ color: 0x7f93b0, transparent: true, opacity: 0.5, toneMapped: false }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xa6f24a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    halo.scale.setScalar(4.5);
    g.add(halo, core, ring, ring2);
    group.add(g);
    const arc = makeArc(0.07, 1);
    group.add(arc);
    return {
      key,
      g,
      core,
      ring,
      ring2,
      halo,
      arc,
      apart: new THREE.Vector3(...L.apart),
      joined: new THREE.Vector3(...L.joined),
      anchor: anchors[L.anchor] || anchors.hub,
      pos: new THREE.Vector3(),
      phase: i * 1.3,
      hi: 0,
    };
  });
  // node-to-node ring (the ecosystem)
  const links = nodes.map((n, i) => ({ a: n, b: nodes[(i + 1) % nodes.length], arc: makeArc(0.035, 0.4) }));
  links.forEach((l) => group.add(l.arc));

  const state = { visible: 0, gather: 0, draw: 0, links: 0, highlight: null, dim: 1 };
  const tmp = new THREE.Vector3();

  function setArc(arc, a, b, lift, progress, opacity) {
    const u = arc.material.uniforms;
    u.p0.value.copy(a);
    u.p2.value.copy(b);
    u.p1.value.copy(a).add(b).multiplyScalar(0.5);
    u.p1.value.y += lift;
    u.progress.value = progress;
    u.opacity.value = opacity;
    arc.visible = opacity > 0.001 && progress > 0.001;
  }

  return {
    group,
    nodes,
    state,
    update(dt, t, camera) {
      time.value = t;
      const s = state;
      group.visible = s.visible > 0.001;
      if (!group.visible) return;
      nodes.forEach((n, i) => {
        const target = n.key === s.highlight ? 1 : 0;
        n.hi += (target - n.hi) * Math.min(1, dt * 4);
        n.pos.lerpVectors(n.apart, n.joined, s.gather);
        n.pos.y += Math.sin(t * 0.8 + n.phase) * 0.35 * (1 - s.gather * 0.5);
        n.g.position.copy(n.pos);
        n.g.quaternion.copy(camera.quaternion);
        n.ring.rotation.z = t * 0.4 + n.phase;
        const vis = s.visible * (s.highlight ? 0.35 + 0.65 * n.hi : 1);
        const connected = s.gather;
        n.core.material.opacity = vis;
        n.core.material.color.setRGB(0.6 + 0.4 * connected, 0.65 + 0.35 * connected, 0.72 + 0.28 * connected).multiplyScalar(1 + connected * 0.6 + n.hi);
        n.ring.material.opacity = vis * (0.25 + 0.75 * connected);
        n.ring2.material.opacity = vis * 0.4 * (1 - connected * 0.5);
        n.halo.material.opacity = vis * (0.12 + 0.5 * connected + 0.4 * n.hi);
        n.g.scale.setScalar(1 + n.hi * 0.35);
        // line from node to truck anchor
        const prog = Math.min(1, Math.max(0, s.draw * 1.25 - i * 0.06));
        setArc(n.arc, n.pos, n.anchor, 3.5, prog, s.visible * (s.highlight ? 0.25 + 0.75 * n.hi : 1));
        n.arc.material.uniforms.boost.value = 1 + n.hi * 1.5;
      });
      links.forEach((l, i) => {
        const prog = Math.min(1, Math.max(0, s.links * 1.2 - i * 0.04));
        tmp.copy(l.a.pos);
        setArc(l.arc, l.a.pos, l.b.pos, 2.2, prog, s.visible * 0.55 * (s.highlight ? 0.4 : 1));
      });
    },
  };
}
