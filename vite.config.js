import { defineConfig } from 'vite';
import { resolve, relative } from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

// Every page of the site. Key = page id used in src/content.js.
export const PAGES = {
  home: 'index.html',
  shipper: 'shippers/index.html',
  carrier: 'carriers/index.html',
  driver: 'drivers/index.html',
  forwarder: 'forwarders/index.html',
  logistics: 'logistics-providers/index.html',
};

// Optional truck model. Drop a file at public/assets/truck.glb (or assets/truck.glb)
// and the scene loads it instead of the procedural truck.
const GLB_PUBLIC = resolve(root, 'public/assets/truck.glb');
const GLB_ROOT = resolve(root, 'assets/truck.glb');
const hasGlb = fs.existsSync(GLB_PUBLIC) || fs.existsSync(GLB_ROOT);

/**
 * Renders the copy in src/content.js into each HTML shell at dev and build time,
 * so all text is real, static, crawlable HTML.
 */
function renderPages() {
  let server;
  return {
    name: 'haulerhub-render-pages',
    configureServer(s) {
      server = s;
      s.watcher.on('change', (file) => {
        if (/src[\\/](content|templates)/.test(file)) s.ws.send({ type: 'full-reload' });
      });
      // Serve a root-level assets/truck.glb in dev if that is where it lives.
      if (fs.existsSync(GLB_ROOT) && !fs.existsSync(GLB_PUBLIC)) {
        s.middlewares.use('/assets/truck.glb', (req, res) => {
          res.setHeader('Content-Type', 'model/gltf-binary');
          fs.createReadStream(GLB_ROOT).pipe(res);
        });
      }
    },
    generateBundle() {
      if (fs.existsSync(GLB_ROOT) && !fs.existsSync(GLB_PUBLIC)) {
        this.emitFile({ type: 'asset', fileName: 'assets/truck.glb', source: fs.readFileSync(GLB_ROOT) });
      }
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, ctx) {
        const rel = relative(root, ctx.filename).replace(/\\/g, '/');
        const page = Object.keys(PAGES).find((k) => PAGES[k] === rel);
        if (!page) return html;
        const mod = server
          ? await server.ssrLoadModule('/src/templates/render.js')
          : await import(pathToFileURL(resolve(root, 'src/templates/render.js')).href);
        const { head, body, htmlAttrs } = mod.renderPage(page, { depth: rel.split('/').length - 1 });
        return html
          .replace('<html lang="en">', `<html lang="en" ${htmlAttrs}>`)
          .replace('<!--hh:head-->', head)
          .replace('<!--hh:body-->', body);
      },
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [renderPages()],
  define: {
    __TRUCK_GLB__: JSON.stringify(hasGlb ? 'assets/truck.glb' : ''),
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [k, resolve(root, v)])),
      output: {
        manualChunks: { three: ['three'], motion: ['gsap', 'lenis'] },
      },
    },
  },
  server: { host: true },
});
