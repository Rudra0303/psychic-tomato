import * as THREE from 'three';

export const LIME = '#A6F24A';
export const NAVY = '#07111C';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function finish(tex, renderer, { srgb = true, repeat = false } = {}) {
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (repeat) tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Logomark drawn into a 2D context. size = square edge in px. */
function drawMark(g, x, y, s, { bg = NAVY } = {}) {
  const u = s / 32;
  g.save();
  g.translate(x, y);
  g.fillStyle = bg;
  roundRect(g, 0, 0, s, s, 9 * u);
  g.fill();
  g.fillStyle = '#ffffff';
  roundRect(g, 8 * u, 7 * u, 4 * u, 18 * u, 2 * u);
  g.fill();
  roundRect(g, 20 * u, 7 * u, 4 * u, 18 * u, 2 * u);
  g.fill();
  g.fillStyle = LIME;
  roundRect(g, 11 * u, 14.6 * u, 10 * u, 2.8 * u, 1.4 * u);
  g.fill();
  g.beginPath();
  g.arc(16 * u, 16 * u, 3.4 * u, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/**
 * Trailer side livery: HaulerHub wordmark + tagline + a lime "connection line" with nodes.
 * Returns { map, emissiveMap } (emissive = lime parts only, so they bloom).
 * Plane aspect = 13 : 2.3
 */
export function trailerLivery(renderer, { hi = true } = {}) {
  const W = hi ? 4096 : 2048;
  const H = Math.round(W * (2.3 / 13));
  const [c, g] = canvas(W, H);
  const [ce, ge] = canvas(W, H);
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, W, H);

  const k = W / 4096;
  // wordmark
  const markS = 300 * k;
  g.font = `700 ${270 * k}px Satoshi, "DM Sans Variable", sans-serif`;
  g.textBaseline = 'alphabetic';
  const word = 'HaulerHub';
  const tw = g.measureText(word).width;
  const gap = 70 * k;
  const total = markS + gap + tw;
  const x0 = (W - total) / 2;
  const baseY = H * 0.52;
  drawMark(g, x0, baseY - markS * 0.86, markS);
  g.fillStyle = NAVY;
  g.fillText(word, x0 + markS + gap, baseY);

  // tagline
  g.font = `500 ${78 * k}px "DM Sans Variable", Satoshi, sans-serif`;
  g.fillStyle = '#5b6878';
  const tag = 'Where Freight Connects.';
  g.fillText(tag, x0 + markS + gap + 6 * k, baseY + 120 * k);

  // lime connection line along the bottom with nodes
  const ly = H * 0.86;
  const drawLine = (ctx, color, glow) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 14 * k;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(60 * k, ly);
    ctx.lineTo(W - 60 * k, ly);
    ctx.stroke();
    const nodes = [0.08, 0.3, 0.5, 0.7, 0.92];
    nodes.forEach((n, i) => {
      ctx.beginPath();
      ctx.arc(W * n, ly, (i === 2 ? 40 : 26) * k, 0, Math.PI * 2);
      ctx.fill();
      if (glow) {
        ctx.lineWidth = 6 * k;
        ctx.beginPath();
        ctx.arc(W * n, ly, (i === 2 ? 64 : 44) * k, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 14 * k;
      }
    });
  };
  drawLine(g, LIME, true);
  drawLine(ge, '#ffffff', true);

  const map = finish(new THREE.CanvasTexture(c), renderer);
  const emissiveMap = finish(new THREE.CanvasTexture(ce), renderer);
  return { map, emissiveMap, aspect: 13 / 2.3 };
}

/** Small rear-door decal (logomark + wordmark). Aspect 2:1 */
export function rearLivery(renderer) {
  const [c, g] = canvas(1024, 512);
  const s = 150;
  g.font = '700 150px Satoshi, "DM Sans Variable", sans-serif';
  const tw = g.measureText('HaulerHub').width;
  const x0 = (1024 - (s + 36 + tw)) / 2;
  drawMark(g, x0, 256 - s * 0.62, s);
  g.fillStyle = NAVY;
  g.fillText('HaulerHub', x0 + s + 36, 256 + s * 0.3);
  return finish(new THREE.CanvasTexture(c), renderer);
}

/** Subtle vertical panel seams for the dry-van sides. */
export function vanSeams(renderer) {
  const [c, g] = canvas(2048, 64);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 2048, 64);
  const n = 26;
  for (let i = 1; i < n; i++) {
    const x = Math.round((i / n) * 2048);
    g.fillStyle = 'rgba(120,132,148,0.28)';
    g.fillRect(x, 0, 2, 64);
    g.fillStyle = 'rgba(255,255,255,1)';
    g.fillRect(x + 2, 0, 1, 64);
  }
  return finish(new THREE.CanvasTexture(c), renderer);
}

/** Grille: horizontal bright bars on a dark field. */
export function grille(renderer) {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#0b0f14';
  g.fillRect(0, 0, 256, 256);
  for (let y = 10; y < 256; y += 22) {
    const grd = g.createLinearGradient(0, y, 0, y + 10);
    grd.addColorStop(0, '#f2f5f8');
    grd.addColorStop(1, '#6f7a86');
    g.fillStyle = grd;
    g.fillRect(0, y, 256, 9);
  }
  return finish(new THREE.CanvasTexture(c), renderer);
}

/** Soft radial glow sprite. */
export function glow(renderer, color = '#ffffff') {
  const [c, g] = canvas(128, 128);
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, color);
  grd.addColorStop(0.18, color);
  grd.addColorStop(0.45, 'rgba(255,255,255,0.18)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return finish(new THREE.CanvasTexture(c), renderer);
}

/**
 * Road textures. Layout across Z (v axis) is described by ROAD below; along X it tiles every
 * TILE metres. Returns colour, roughness and emissive (glowing markings) maps.
 */
export const ROAD = {
  zMin: -23,
  zMax: 10,
  tile: 24,
  ours: { edgeL: -5.55, edgeR: 5.55, dashes: [-1.85, 1.85], rail: [-7.2, 7.8] },
  oncoming: { edgeL: -21.9, edgeR: -10.8, dashes: [-14.5, -18.2] },
  median: [-10.2, -7.6],
};

export function roadMaps(renderer, { hi = true } = {}) {
  const W = 512; // along x (one tile)
  const H = hi ? 2048 : 1024; // across z
  const span = ROAD.zMax - ROAD.zMin;
  const zToY = (z) => ((ROAD.zMax - z) / span) * H; // canvas y=0 at zMax (v=1)
  const m = (metres) => (metres / span) * H;
  const xm = (metres) => (metres / ROAD.tile) * W;

  const [c, g] = canvas(W, H);
  const [cr, gr] = canvas(W, H);
  const [ce, ge] = canvas(W, H);

  // asphalt base with grain
  g.fillStyle = '#0d1219';
  g.fillRect(0, 0, W, H);
  gr.fillStyle = 'rgb(150,150,150)';
  gr.fillRect(0, 0, W, H);
  ge.fillStyle = '#000';
  ge.fillRect(0, 0, W, H);
  const img = g.getImageData(0, 0, W, H);
  const rimg = gr.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n + 2;
    const r = 132 + (Math.random() - 0.5) * 26;
    rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = r;
  }
  g.putImageData(img, 0, 0);
  gr.putImageData(rimg, 0, 0);
  // wet patches: lower roughness blobs
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = 30 + Math.random() * 120;
    const grd = gr.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(40,40,40,0.75)');
    grd.addColorStop(1, 'rgba(40,40,40,0)');
    gr.fillStyle = grd;
    gr.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // median + shoulders slightly different tone
  g.fillStyle = 'rgba(30,40,52,0.55)';
  g.fillRect(0, zToY(ROAD.median[1]), W, m(ROAD.median[1] - ROAD.median[0]));

  const solid = (z, width, color, emit, emitCtx = ge) => {
    const y = zToY(z) - m(width) / 2;
    g.fillStyle = color;
    g.fillRect(0, y, W, m(width));
    gr.fillStyle = 'rgb(90,90,90)';
    gr.fillRect(0, y, W, m(width));
    if (emit) {
      emitCtx.fillStyle = emit;
      emitCtx.fillRect(0, y, W, m(width));
    }
  };
  const dashes = (z, width, color, emit) => {
    const y = zToY(z) - m(width) / 2;
    for (let i = 0; i < 2; i++) {
      const x = xm(i * 12);
      g.fillStyle = color;
      g.fillRect(x, y, xm(3), m(width));
      gr.fillStyle = 'rgb(90,90,90)';
      gr.fillRect(x, y, xm(3), m(width));
      ge.fillStyle = emit;
      ge.fillRect(x, y, xm(3), m(width));
    }
  };

  const O = ROAD.ours;
  solid(O.edgeL, 0.15, '#d9dde2', 'rgba(170,180,195,0.55)');
  solid(O.edgeR, 0.15, '#d9dde2', 'rgba(170,180,195,0.55)');
  O.dashes.forEach((z) => dashes(z, 0.15, '#eef1f4', 'rgba(230,236,245,0.95)'));
  // lime "connected route" rails
  O.rail.forEach((z) => solid(z, 0.08, '#a6f24a', 'rgba(166,242,74,0.9)'));

  const N = ROAD.oncoming;
  solid(N.edgeL, 0.15, '#c8cdd3', 'rgba(140,150,165,0.35)');
  solid(N.edgeR, 0.15, '#c8cdd3', 'rgba(140,150,165,0.35)');
  N.dashes.forEach((z) => dashes(z, 0.15, '#cfd4da', 'rgba(170,180,195,0.5)'));

  const opts = { repeat: true };
  const map = finish(new THREE.CanvasTexture(c), renderer, opts);
  const roughnessMap = finish(new THREE.CanvasTexture(cr), renderer, { ...opts, srgb: false });
  const emissiveMap = finish(new THREE.CanvasTexture(ce), renderer, opts);
  return { map, roughnessMap, emissiveMap };
}

/** Faint navy grid for the ground plane. */
export function groundGrid(renderer) {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#060c14';
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(46,82,140,0.5)';
  g.lineWidth = 2;
  g.strokeRect(0, 0, 256, 256);
  const t = finish(new THREE.CanvasTexture(c), renderer, { repeat: true });
  t.wrapT = THREE.RepeatWrapping;
  return t;
}
