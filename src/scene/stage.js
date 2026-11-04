/**
 * The shared 3D stage used by every page: renderer, lights, post-processing, world, truck and
 * network. Pages only drive it through setView() and the `story` state object.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createWorld } from './world.js';
import { createTruck, DIM } from './truck.js';
import { createNetwork } from './network.js';

/* global __TRUCK_GLB__ */
const TRUCK_GLB = typeof __TRUCK_GLB__ !== 'undefined' ? __TRUCK_GLB__ : '';

// When a .glb is used it is scaled to this overall length and placed like the procedural rig.
const GLB_OPTIONS = { length: 22.9, frontX: 8.6, overlayLivery: true };

export async function createStage({ canvas, quality: Q, root = './', onProgress = () => {} }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !Q.bloom,
    powerPreference: 'high-performance',
    alpha: false,
    stencil: false,
  });
  let dpr = Q.dpr;
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  onProgress(0.1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.3, 2500);
  camera.position.set(30, 4, 20);

  // image based lighting for paint and chrome
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.24;
  pmrem.dispose();

  // lights
  const hemi = new THREE.HemisphereLight(0x3a5a8c, 0x05080c, 0.45);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xc7d8ff, 0.75);
  key.position.set(22, 34, 26);
  key.target.position.set(-3, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(Q.shadow, Q.shadow);
  Object.assign(key.shadow.camera, { left: -22, right: 22, top: 16, bottom: -16, near: 10, far: 90 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.03;
  key.shadow.radius = 4;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6f92d8, 0.9);
  rim.position.set(-40, 18, -30);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xa6f24a, 0.12); // a whisper of lime from below-front
  fill.position.set(20, -2, 10);
  scene.add(fill);
  onProgress(0.2);

  const world = createWorld(scene, renderer, Q);
  onProgress(0.4);

  let truck = createTruck(renderer, { hi: !Q.mobile });
  if (TRUCK_GLB) {
    try {
      truck = await loadGlbTruck(new URL(root + TRUCK_GLB, location.href).href, truck, (p) => onProgress(0.4 + p * 0.3));
    } catch (err) {
      console.warn('[HaulerHub] Could not load truck.glb, using the procedural truck.', err);
    }
  }
  scene.add(truck.group);
  onProgress(0.7);

  // headlights
  const heads = truck.headlights.map((p) => {
    const s = new THREE.SpotLight(0xeaf1ff, Q.mobile ? 60 : 80, 80, 0.38, 0.7, 1.4);
    s.position.copy(p);
    s.target.position.set(p.x + 40, 0, p.z * 1.5);
    scene.add(s, s.target);
    return s;
  });

  const network = createNetwork(scene, truck.anchors, truck.materials.glowTex);
  onProgress(0.8);

  // post-processing
  let composer = null;
  let bloom = null;
  const W = () => window.innerWidth;
  const H = () => window.innerHeight;
  if (Q.bloom) {
    const rt = new THREE.WebGLRenderTarget(W() * dpr, H() * dpr, { type: THREE.HalfFloatType, samples: Q.msaa });
    composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(dpr);
    composer.setSize(W(), H());
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(W() / 2, H() / 2), 0.36, 0.45, 1.15);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // compile shaders up front so the first scroll does not hitch
  try {
    await renderer.compileAsync(scene, camera);
  } catch (e) {
    renderer.compile(scene, camera);
  }
  onProgress(0.95);

  /* ---------------- runtime ---------------- */
  const story = { speed: 0, targetSpeed: 0 };
  let distance = 0;
  let time = 0;
  const view = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 35 };

  function setView(pos, target, fov) {
    camera.position.copy(pos);
    camera.lookAt(target);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    view.pos.copy(pos);
    view.target.copy(target);
    view.fov = fov;
  }

  function resize() {
    const w = W();
    const h = H();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    if (composer) {
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
      bloom.resolution.set(w / 2, h / 2);
    }
    world.resize(w, h, dpr);
  }

  // adaptive resolution: drop pixel ratio if frames are consistently slow
  let acc = 0;
  let frames = 0;
  let cooldown = 3;
  const noAdapt = new URLSearchParams(location.search).has('noadapt');
  function adapt(dt) {
    if (noAdapt) return;
    if (cooldown > 0) {
      cooldown -= dt;
      return;
    }
    acc += dt;
    frames++;
    if (frames >= 90) {
      const avg = acc / frames;
      if (avg > 1 / 42 && dpr > Q.minDpr + 0.01) {
        dpr = Math.max(Q.minDpr, dpr - 0.25);
        resize();
        cooldown = 2;
      } else if (avg > 1 / 36 && world.reflector && world.reflector.visible) {
        world.reflector.visible = false;
        world.setReflection(0);
        cooldown = 2;
      }
      acc = 0;
      frames = 0;
    }
  }

  const tmp = new THREE.Vector3();
  function project(v, out = { x: 0, y: 0, z: 0, visible: false }) {
    tmp.copy(v).project(camera);
    out.x = (tmp.x * 0.5 + 0.5) * W();
    out.y = (-tmp.y * 0.5 + 0.5) * H();
    out.z = tmp.z;
    out.visible = tmp.z < 1 && tmp.z > -1;
    return out;
  }

  function render(dt, { draw = true } = {}) {
    dt = Math.min(dt, 1 / 20);
    time += dt;
    story.speed += (story.targetSpeed - story.speed) * Math.min(1, dt * 1.6);
    distance += story.speed * dt;
    truck.update(distance);
    world.update(distance, time, dt, story.speed);
    network.update(dt, time, camera);
    heads.forEach((s) => (s.intensity = (Q.mobile ? 60 : 80) * (story.headlights ?? 1)));
    if (!draw) return;
    if (composer) composer.render(dt);
    else renderer.render(scene, camera);
    adapt(dt);
  }

  onProgress(1);
  return { renderer, scene, camera, truck, world, network, story, setView, resize, render, project, view, Q, dims: DIM };
}

/* ---------------- optional GLB truck ---------------- */
async function loadGlbTruck(url, procedural, onProgress) {
  const [{ GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
    import('three/examples/jsm/libs/meshopt_decoder.module.js'),
  ]);
  const loader = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath(new URL('draco/', new URL(url, location.href).href.replace(/assets\/truck\.glb.*$/, '')).href);
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url, (e) => e.total && onProgress(e.loaded / e.total));
  const model = gltf.scene;
  // normalise: longest horizontal axis -> X, scale to rig length, wheels on the ground
  let box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  if (size.z > size.x) model.rotation.y = -Math.PI / 2;
  box = new THREE.Box3().setFromObject(model);
  box.getSize(size);
  const s = GLB_OPTIONS.length / size.x;
  model.scale.multiplyScalar(s);
  box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  model.position.x += GLB_OPTIONS.frontX - box.max.x;
  model.position.y -= box.min.y;
  model.position.z -= c.z;
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  const group = new THREE.Group();
  group.add(model);
  if (GLB_OPTIONS.overlayLivery) {
    procedural.group.traverse((o) => {
      if (o.isMesh && o.material === procedural.materials.livery) group.add(o.clone());
    });
  }
  return { ...procedural, group, update() {} };
}
