/** Renders the role tile thumbnails once (model studio shots) into <img data-thumb>. */
import * as THREE from 'three';
import * as M from './models.js';

const W = 640;
const H = 440;

function scene(key) {
  const g = new THREE.Group();
  if (key === 'shipper') {
    const wh = M.warehouse({ w: 30, d: 16, h: 9, docks: 4 });
    g.add(wh);
    const s = M.containerStacks([-6, 12], 2, 2, 2, 3);
    g.add(s);
    return { g, size: 34 };
  }
  if (key === 'carrier') {
    g.add(M.truck({ kind: 'box' }));
    return { g, size: 17 };
  }
  if (key === 'driver') {
    const t = M.tractor();
    g.add(t);
    return { g, size: 7 };
  }
  if (key === 'forwarder') {
    g.add(M.ship({ len: 60, beam: 11, stacks: 6 }));
    return { g, size: 62 };
  }
  // logistics
  const gan = M.gantry({ span: 14, h: 12, len: 4 });
  g.add(gan);
  const c = M.container(0xff5a1f);
  c.position.y = 6;
  g.add(c);
  const tk = M.truck({ kind: 'chassis' });
  tk.position.z = 4;
  tk.scale.setScalar(0.9);
  g.add(tk);
  return { g, size: 24 };
}

export async function renderThumbs() {
  const imgs = [...document.querySelectorAll('img[data-thumb]')];
  if (!imgs.length) return;
  const canvas = document.createElement('canvas');
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, H, false);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cache = {};
  for (const img of imgs) {
    const key = img.dataset.thumb;
    if (!cache[key]) {
      const s = new THREE.Scene();
      const { g, size } = scene(key);
      const box = new THREE.Box3().setFromObject(g);
      const c = box.getCenter(new THREE.Vector3());
      g.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
      s.add(g);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.18 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      s.add(floor);
      s.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.8));
      const d = new THREE.DirectionalLight(0xffffff, 2.2);
      d.position.set(-size, size * 2, size * 1.4);
      d.castShadow = true;
      d.shadow.mapSize.set(1024, 1024);
      Object.assign(d.shadow.camera, { left: -size, right: size, top: size, bottom: -size, far: size * 6 });
      s.add(d);
      const cam = new THREE.PerspectiveCamera(20, W / H, 0.5, 2000);
      const dist = size * 2.6;
      cam.position.set(dist * 0.62, dist * 0.5, dist * 0.78);
      cam.lookAt(0, (box.max.y - box.min.y) * 0.32, 0);
      r.render(s, cam);
      cache[key] = canvas.toDataURL('image/png');
    }
    img.src = cache[key];
  }
  r.dispose();
  r.forceContextLoss?.();
}
