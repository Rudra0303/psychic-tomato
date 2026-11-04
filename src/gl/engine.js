/** Shared renderer, lights and render loop for every 3D scene on the site. */
import * as THREE from 'three';

export function detectQuality() {
  const q = new URLSearchParams(location.search).get('quality');
  const mobile = innerWidth < 760 || (matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 820);
  const tier = q || (mobile ? 'low' : (navigator.hardwareConcurrency || 4) <= 4 ? 'medium' : 'high');
  const dpr = devicePixelRatio || 1;
  return {
    tier,
    mobile: tier === 'low',
    dpr: tier === 'high' ? Math.min(dpr, 1.75) : tier === 'medium' ? Math.min(dpr, 1.4) : Math.min(dpr, 1.5),
    shadow: tier === 'high' ? 2048 : 1024,
    aa: true,
  };
}

export function createEngine(canvas, Q) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: Q.aa, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Q.dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.PerspectiveCamera(24, innerWidth / innerHeight, 1, 4000);

  /** Light rig added to a scene; call follow(target) each frame to keep crisp shadows. */
  function addLights(scene, { sun = 2.4, hemi = 1.6, ground = 0xd8d2c4 } = {}) {
    const h = new THREE.HemisphereLight(0xffffff, ground, hemi);
    const d = new THREE.DirectionalLight(0xffffff, sun);
    d.castShadow = true;
    d.shadow.mapSize.set(Q.shadow, Q.shadow);
    Object.assign(d.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 1, far: 400 });
    d.shadow.bias = -0.0005;
    d.shadow.normalBias = 0.04;
    d.shadow.radius = 3;
    scene.add(h, d, d.target);
    const off = new THREE.Vector3(-50, 120, 70);
    return {
      sun: d,
      hemi: h,
      follow(target) {
        d.target.position.copy(target);
        d.position.copy(target).add(off);
      },
    };
  }

  let dprNow = Q.dpr;
  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dprNow);
    renderer.setSize(innerWidth, innerHeight, false);
  }

  // adaptive resolution
  let acc = 0;
  let n = 0;
  const noAdapt = /noadapt/.test(location.search);
  function adapt(dt) {
    if (noAdapt) return;
    acc += dt;
    n++;
    if (n >= 90) {
      if (acc / n > 1 / 40 && dprNow > 1) {
        dprNow = Math.max(1, dprNow - 0.25);
        resize();
      }
      acc = 0;
      n = 0;
    }
  }

  return {
    renderer,
    camera,
    addLights,
    resize,
    render(scene, dt) {
      renderer.render(scene, camera);
      adapt(dt);
    },
    clear() {
      renderer.clear();
    },
  };
}
