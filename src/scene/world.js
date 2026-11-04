/**
 * The night highway: sky, wet road (with real-time reflections on high quality), streaming
 * streetlights and reflectors, a city skyline on one side and a port on the other.
 * The truck stays at the origin; the world streams past it (distance = metres travelled).
 */
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { roadMaps, groundGrid, glow, ROAD } from './textures.js';

const FOG = new THREE.Color(0x0a1626);
const ROAD_LEN = 520;

const rand = (() => {
  let s = 1337;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
})();

export function createWorld(scene, renderer, Q) {
  const updaters = [];
  scene.fog = new THREE.FogExp2(FOG, 0.0058);
  scene.background = FOG.clone();

  /* ---------------- sky ---------------- */
  {
    const geo = new THREE.SphereGeometry(900, 48, 24);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        top: { value: new THREE.Color(0x02060c) },
        mid: { value: new THREE.Color(0x081628) },
        horizon: { value: FOG.clone() },
        glowCol: { value: new THREE.Color(0x24406a) },
      },
      vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`,
      fragmentShader: /* glsl */ `
        varying vec3 vDir; uniform vec3 top, mid, horizon, glowCol;
        void main(){
          float h = vDir.y;
          vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
          c = mix(c, top, smoothstep(0.18, 0.7, h));
          // light pollution glow over the city (-z) and port (+z)
          float city = pow(max(0.0, -vDir.z), 3.0) * (1.0 - smoothstep(0.0, 0.25, h));
          float port = pow(max(0.0, vDir.z), 4.0) * (1.0 - smoothstep(0.0, 0.18, h)) * 0.6;
          c += glowCol * (city + port) * 0.55;
          c = mix(c, horizon, 1.0 - smoothstep(-0.05, 0.03, h));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.renderOrder = -10;
    sky.frustumCulled = false;
    scene.add(sky);

    // stars
    const n = Q.mobile ? 500 : 1400;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rand() * Math.PI * 2;
      const v = 0.08 + Math.pow(rand(), 0.8) * 0.92;
      const r = 850;
      pos[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * r;
      pos[i * 3 + 1] = v * r;
      pos[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * r;
      const b = 0.25 + rand() * 0.75;
      col[i * 3] = b * 0.85;
      col[i * 3 + 1] = b * 0.92;
      col[i * 3 + 2] = b;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, opacity: 0.8, depthWrite: false }));
    stars.renderOrder = -9;
    stars.frustumCulled = false;
    scene.add(stars);
  }

  /* ---------------- ground (faint navy grid) ---------------- */
  const gridTex = groundGrid(renderer);
  gridTex.repeat.set(120, 120);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(2400, 2400),
    new THREE.MeshStandardMaterial({ map: gridTex, color: 0xffffff, roughness: 0.92, metalness: 0, envMapIntensity: 0.2 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);
  updaters.push((d) => {
    gridTex.offset.x = (d / 20) % 1;
  });

  /* ---------------- road ---------------- */
  const maps = roadMaps(renderer, { hi: !Q.mobile });
  const roadW = ROAD.zMax - ROAD.zMin;
  const roadZ = (ROAD.zMax + ROAD.zMin) / 2;
  [maps.map, maps.roughnessMap, maps.emissiveMap].forEach((t) => t.repeat.set(ROAD_LEN / ROAD.tile, 1));
  const roadMat = new THREE.MeshStandardMaterial({
    map: maps.map,
    roughnessMap: maps.roughnessMap,
    roughness: 1,
    metalness: 0.0,
    emissiveMap: maps.emissiveMap,
    emissive: 0xffffff,
    emissiveIntensity: 1.25,
    envMapIntensity: 0.35,
  });
  const roadGeo = new THREE.PlaneGeometry(ROAD_LEN, roadW);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, roadZ);
  road.receiveShadow = true;
  scene.add(road);

  const shaderRefs = { time: { value: 0 }, dist: { value: 0 }, refl: { value: 1 } };
  let reflector = null;
  if (Q.reflections) {
    reflector = new Reflector(roadGeo, {
      textureWidth: Math.round(window.innerWidth * Q.dpr * 0.5),
      textureHeight: Math.round(window.innerHeight * Q.dpr * 0.5),
      clipBias: 0.003,
      color: 0xffffff,
    });
    reflector.rotation.copy(road.rotation);
    reflector.position.copy(road.position);
    reflector.material.colorWrite = false;
    reflector.material.depthWrite = false;
    reflector.renderOrder = -5;
    const orig = reflector.onBeforeRender.bind(reflector);
    reflector.onBeforeRender = (r, s, c) => {
      road.visible = false;
      ground.visible = false;
      orig(r, s, c);
      road.visible = true;
      ground.visible = true;
    };
    scene.add(reflector);
  }

  // Inject: reflection sampling + lime "data pulses" running along the lime rails.
  roadMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = shaderRefs.time;
    shader.uniforms.uDist = shaderRefs.dist;
    shader.uniforms.uRefl = shaderRefs.refl;
    if (reflector) {
      shader.uniforms.tRefl = { value: reflector.getRenderTarget().texture };
      shader.uniforms.uReflMatrix = reflector.material.uniforms.textureMatrix;
    }
    shader.defines = shader.defines || {};
    if (reflector) shader.defines.USE_REFL = '';
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRoadPos;\n#ifdef USE_REFL\nuniform mat4 uReflMatrix; varying vec4 vReflUv;\n#endif')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRoadPos = position;\n#ifdef USE_REFL\nvReflUv = uReflMatrix * vec4(position, 1.0);\n#endif');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         varying vec3 vRoadPos; uniform float uTime; uniform float uDist; uniform float uRefl;
         #ifdef USE_REFL
         uniform sampler2D tRefl; varying vec4 vReflUv;
         #endif`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         {
           // lime rails are the only strongly green emissive texels
           vec3 em = totalEmissiveRadiance;
           float limeMask = smoothstep(0.25, 0.6, em.g - em.b);
           float wx = vRoadPos.x + uDist;
           float pulse = pow(fract(wx / 46.0 - uTime * 0.35), 18.0);
           totalEmissiveRadiance += vec3(0.65, 0.95, 0.29) * limeMask * pulse * 5.0;
         }`,
      )
      .replace(
        '#include <opaque_fragment>',
        `#ifdef USE_REFL
         {
           vec4 ruv = vReflUv;
           float n = texture2D(roughnessMap, vRoughnessMapUv * vec2(3.0, 1.0)).g - 0.5;
           ruv.x += n * 0.04 * ruv.w;
           vec3 refl = texture2DProj(tRefl, ruv).rgb;
           float wet = 1.0 - smoothstep(0.2, 0.75, roughnessFactor);
           outgoingLight += refl * (0.16 + wet * 0.55) * uRefl;
         }
         #endif
         #include <opaque_fragment>`,
      );
  };

  updaters.push((d, t) => {
    const off = (d / ROAD.tile) % 1;
    maps.map.offset.x = off;
    maps.roughnessMap.offset.x = off;
    maps.emissiveMap.offset.x = off;
    shaderRefs.time.value = t;
    shaderRefs.dist.value = d % 4600;
  });

  /* ---------------- median barrier (static, infinite looking) ---------------- */
  {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(ROAD_LEN, 0.85, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3a4655, roughness: 0.85 }),
    );
    bar.position.set(0, 0.42, (ROAD.median[0] + ROAD.median[1]) / 2);
    bar.receiveShadow = true;
    scene.add(bar);
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(ROAD_LEN, 0.32, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x8a96a5, roughness: 0.35, metalness: 0.8 }),
    );
    rail.position.set(0, 0.7, ROAD.zMax - 1.2);
    scene.add(rail);
  }

  /* ---------------- streaming instanced objects ---------------- */
  const RANGE = 420; // metres of looped scenery
  function stream(mesh, items, speedMul = 1) {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const v = new THREE.Vector3();
    mesh.frustumCulled = false;
    scene.add(mesh);
    const upd = (d) => {
      items.forEach((it, i) => {
        let x = ((((it.x - d * speedMul) % RANGE) + RANGE) % RANGE) - RANGE / 2;
        v.set(x, it.y, it.z);
        q.setFromEuler(it.rot || new THREE.Euler());
        s.set(it.sx || 1, it.sy || 1, it.sz || 1);
        m.compose(v, q, s);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    upd(0);
    updaters.push(upd);
  }

  // Streetlights: alternating sides
  const SPACING = 42;
  const poles = [];
  for (let i = 0; i < RANGE / SPACING; i++) {
    const side = i % 2 ? 1 : -1;
    poles.push({ x: i * SPACING, side });
  }
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3340, roughness: 0.5, metalness: 0.6 });
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe9f1ff, emissiveIntensity: 2.4 });
  const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.16, 11, 8), poleMat, poles.length);
  const arm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.12, 3.6), poleMat, poles.length);
  const head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.12, 0.36), lampMat, poles.length);
  const poleZ = (side) => (side > 0 ? ROAD.ours.rail[1] + 1.6 : ROAD.median[0] + 1.3);
  stream(pole, poles.map((p) => ({ x: p.x, y: 5.5, z: poleZ(p.side) })));
  stream(arm, poles.map((p) => ({ x: p.x, y: 10.9, z: poleZ(p.side) - p.side * 1.7 })));
  stream(head, poles.map((p) => ({ x: p.x, y: 10.8, z: poleZ(p.side) - p.side * 3.2 })));

  // Pole glow sprites
  const glowTex = glow(renderer, '#eaf2ff');
  {
    const n = poles.length;
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, size: 3.2, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x9fb4d6, opacity: 0.35 }));
    pts.frustumCulled = false;
    scene.add(pts);
    updaters.push((d) => {
      poles.forEach((p, i) => {
        const x = ((((p.x - d) % RANGE) + RANGE) % RANGE) - RANGE / 2;
        pos[i * 3] = x;
        pos[i * 3 + 1] = 10.6;
        pos[i * 3 + 2] = poleZ(p.side) - p.side * 3.2;
      });
      g.attributes.position.needsUpdate = true;
    });
  }

  // Moving point lights that ride with the nearest lamps (sweeping light over the truck)
  const nLights = Q.mobile ? 1 : 3;
  const lamps = [];
  for (let i = 0; i < nLights; i++) {
    const l = new THREE.PointLight(0xdfe8ff, Q.mobile ? 220 : 170, 46, 2);
    scene.add(l);
    lamps.push(l);
  }
  updaters.push((d) => {
    // light j follows poles j, j+n, j+2n... choosing the one nearest the truck
    lamps.forEach((l, j) => {
      let best = null;
      let bd = 1e9;
      for (let i = j; i < poles.length; i += nLights) {
        const p = poles[i];
        const x = ((((p.x - d) % RANGE) + RANGE) % RANGE) - RANGE / 2;
        const dd = Math.abs(x + 4);
        if (dd < bd) {
          bd = dd;
          best = { x, z: poleZ(p.side) - p.side * 3.2 };
        }
      }
      l.position.set(best.x, 10.4, best.z);
    });
  });

  // Reflector dots on the barrier and guard rail
  {
    const items = [];
    for (let i = 0; i < RANGE / 12; i++) {
      items.push({ x: i * 12, y: 0.62, z: (ROAD.median[0] + ROAD.median[1]) / 2 + 0.26 });
      items.push({ x: i * 12 + 6, y: 0.72, z: ROAD.zMax - 1.25 });
    }
    const dots = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.1, 0.07, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xffb547, emissive: 0xff9a2a, emissiveIntensity: 3 }),
      items.length,
    );
    stream(dots, items);
  }

  /* ---------------- skyline (city, -z) and port (+z) ---------------- */
  const cityMat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: {
      fogColor: { value: FOG.clone() },
      density: { value: 0.0034 },
      lit: { value: 0.82 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying float vSeed; varying float vH;
      void main(){
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vW = w.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vSeed = float(gl_InstanceID); vH = position.y + 0.5;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vW; varying vec3 vN; varying float vSeed; varying float vH;
      uniform vec3 fogColor; uniform float density; uniform float lit;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec3 base = mix(vec3(0.012, 0.026, 0.05), vec3(0.03, 0.06, 0.1), vH);
        vec3 c = base;
        if (abs(vN.y) < 0.5) {
          float u = abs(vN.x) > abs(vN.z) ? vW.z : vW.x;
          vec2 cell = vec2(u / 2.6, vW.y / 3.2);
          vec2 id = floor(cell);
          vec2 f = fract(cell);
          float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.78);
          float h = hash(id + vSeed * 7.13);
          float on = step(lit, h);
          vec3 wc = mix(vec3(1.0, 0.82, 0.55), vec3(0.75, 0.86, 1.0), hash(id.yx + vSeed));
          c += wc * win * on * (0.18 + 0.32 * hash(id * 1.7));
          // facade side shading
          c *= abs(vN.x) > abs(vN.z) ? 0.8 : 1.0;
        } else if (vN.y > 0.5) {
          c = vec3(0.02, 0.035, 0.06);
        }
        float dist = length(vW - cameraPosition);
        float f = 1.0 - exp(-pow(dist * density, 2.0));
        c = mix(c, fogColor, clamp(f, 0.0, 0.92));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  {
    const items = [];
    const n = Q.mobile ? 140 : 260;
    for (let i = 0; i < n; i++) {
      const x = (rand() - 0.5) * 1500;
      const downtown = Math.exp(-Math.pow((x + 120) / 220, 2));
      const z = -170 - rand() * 330 - downtown * 40;
      const h = 14 + Math.pow(rand(), 2.2) * 70 + downtown * (40 + Math.pow(rand(), 1.5) * 170);
      const w = 14 + rand() * 30;
      items.push({ x, z, h, w, d: 14 + rand() * 30 });
    }
    const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, items.length);
    const m = new THREE.Matrix4();
    items.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
      city.setMatrixAt(i, m);
    });
    city.frustumCulled = false;
    scene.add(city);
    // slow parallax drift so the skyline feels distant
    updaters.push((d) => {
      city.position.x = -((d * 0.04) % 300);
    });

    // aviation lights on the tallest towers
    const tall = items.filter((b) => b.h > 120);
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.Float32BufferAttribute(tall.flatMap((b) => [b.x, b.h + 2, b.z]), 3));
    const av = new THREE.Points(ag, new THREE.PointsMaterial({ map: glowTex, color: 0xff3b30, size: 9, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    av.frustumCulled = false;
    scene.add(av);
    updaters.push((d, t) => {
      av.position.x = city.position.x;
      av.material.opacity = 0.35 + 0.65 * (Math.sin(t * 2.2) > 0.4 ? 1 : 0);
    });
  }

  const port = new THREE.Group();
  if (Q.port) {
    const cMat = cityMat.clone();
    cMat.uniforms.lit.value = 0.985;
    cMat.uniforms.density.value = 0.0028;
    const items = [];
    // container stacks
    for (let i = 0; i < 160; i++) {
      const row = Math.floor(i / 20);
      const col = i % 20;
      const stack = 1 + Math.floor(rand() * 4);
      items.push({ x: -260 + col * 13.5 + rand(), z: 190 + row * 9, w: 12.2, h: 2.6 * stack, d: 2.5 });
    }
    // ship hull + superstructure
    items.push({ x: 40, z: 300, w: 300, h: 16, d: 42 });
    items.push({ x: 170, z: 300, w: 24, h: 40, d: 30 });
    for (let i = 0; i < 26; i++) items.push({ x: -100 + i * 10.5, z: 300, w: 10, h: 16 + 2.6 * (2 + Math.floor(rand() * 4)), d: 34 });
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cMat, items.length);
    const m = new THREE.Matrix4();
    items.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
      mesh.setMatrixAt(i, m);
    });
    mesh.frustumCulled = false;
    port.add(mesh);

    // ship-to-shore cranes
    const craneMat = new THREE.MeshBasicMaterial({ color: 0x1a2b44, fog: true });
    const cg = [];
    const box = (w, h, d, x, y, z) => {
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(x, y, z);
      cg.push(g);
    };
    box(2, 52, 2, -12, 26, -14);
    box(2, 52, 2, 12, 26, -14);
    box(2, 52, 2, -12, 26, 14);
    box(2, 52, 2, 12, 26, 14);
    box(28, 3, 2, 0, 44, -14);
    box(28, 3, 2, 0, 44, 14);
    box(3, 3, 120, 0, 50, 20);
    box(2, 26, 2, 0, 63, -6);
    const craneGeo = mergeBoxes(cg);
    const lights = [];
    [-70, -20, 30, 80].forEach((x) => {
      const c = new THREE.Mesh(craneGeo, craneMat);
      c.position.set(x, 0, 255);
      port.add(c);
      lights.push(x, 77, 249, x, 51, 318);
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lights, 3));
    const lp = new THREE.Points(lg, new THREE.PointsMaterial({ map: glowTex, color: 0xff4a3a, size: 8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    lp.frustumCulled = false;
    port.add(lp);
    // yard floodlights
    const fl = [];
    for (let i = 0; i < 14; i++) fl.push(-240 + i * 22, 30, 182 + (i % 2) * 40);
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(fl, 3));
    port.add(new THREE.Points(fg, new THREE.PointsMaterial({ map: glowTex, color: 0xffd9a0, size: 14, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })));
    scene.add(port);
    updaters.push((d, t) => {
      port.position.x = -((d * 0.05) % 200) + 60;
      lp.material.opacity = Math.sin(t * 1.7) > 0 ? 1 : 0.25;
    });
  }

  /* ---------------- traffic (light pairs) ---------------- */
  if (Q.traffic) {
    const cars = [];
    for (let i = 0; i < 9; i++) cars.push({ x: rand() * RANGE, z: -12.8 - (i % 3) * 3.7, dir: -1, v: 26 + rand() * 6 });
    for (let i = 0; i < 4; i++) cars.push({ x: 40 + rand() * 300, z: i % 2 ? -3.7 : 3.7, dir: 1, v: 3 + rand() * 4 });
    const n = cars.length * 2;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    cars.forEach((c, i) => {
      const w = c.dir < 0 ? [1, 1, 1] : [1, 0.12, 0.08];
      for (let k = 0; k < 2; k++) col.set(w, (i * 2 + k) * 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, size: 2.2, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false;
    scene.add(pts);
    let last = 0;
    updaters.push((d, t, dt, speed) => {
      cars.forEach((c, i) => {
        // oncoming: relative speed = own speed + world speed; same direction: slow relative drift
        const rel = c.dir < 0 ? -(c.v + speed) : c.v * 0.2 - speed * 0.2;
        c.x += rel * dt;
        if (c.x < -RANGE / 2) c.x += RANGE;
        if (c.x > RANGE / 2) c.x -= RANGE;
        const y = c.dir < 0 ? 0.75 : 0.9;
        pos.set([c.x, y, c.z - 0.75], i * 6);
        pos.set([c.x, y, c.z + 0.75], i * 6 + 3);
      });
      g.attributes.position.needsUpdate = true;
      last = t;
    });
  }

  return {
    road,
    reflector,
    setReflection(v) {
      shaderRefs.refl.value = v;
    },
    update(distance, time, dt, speed) {
      for (const u of updaters) u(distance, time, dt, speed);
    },
    resize(w, h, dpr) {
      if (reflector) reflector.getRenderTarget().setSize(Math.round(w * dpr * 0.5), Math.round(h * dpr * 0.5));
    },
  };
}

function mergeBoxes(geos) {
  const total = geos.reduce((n, g) => n + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3);
  const nor = new Float32Array(total * 3);
  const idx = [];
  let off = 0;
  geos.forEach((g) => {
    pos.set(g.attributes.position.array, off * 3);
    nor.set(g.attributes.normal.array, off * 3);
    g.index.array.forEach((i) => idx.push(i + off));
    off += g.attributes.position.count;
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(idx);
  return out;
}
