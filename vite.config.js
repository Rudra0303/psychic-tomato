import { defineConfig } from 'vite';
import { resolve, relative } from 'node:path';
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
