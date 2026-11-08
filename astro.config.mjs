import { defineConfig } from 'astro/config';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const site = 'https://www.mymce.com.mx';

// Mapa del sitio en /sitemap_mx.xml, el nombre ya registrado en robots.txt y Search Console.
const mapaDelSitio = {
  name: 'mapa-del-sitio',
  hooks: {
    'astro:build:done': ({ dir, pages }) => {
      const leer = (ruta) => readFileSync(fileURLToPath(new URL(`${ruta.slice(1)}index.html`, dir)), 'utf8');
      const imagenes = (ruta) => {
        const html = leer(ruta);
        const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
        const fotos = [...main.matchAll(/<img\b[^>]*>/g)].map((m) => (m[0].match(/data-grande="([^"]+)"/) || m[0].match(/\ssrc="(\/assets[^"]+)"/) || [])[1]).filter((f) => f && !f.startsWith('/assets/img/'));
        return [...new Set(fotos)].slice(0, 20).map((f) => `\n    <image:image><image:loc>${site}${f}</image:loc></image:image>`).join('');
      };
      const urls = pages
        .map((p) => '/' + p.pathname)
        .filter((p) => !p.startsWith('/404'))
        .map((p) => (p.endsWith('/') ? p : p + '/'))
        .sort()
        .map((p) => {
          const fecha = (leer(p).match(/"datePublished":"(\d{4}-\d{2}-\d{2})/) || [])[1];
          return `  <url>\n    <loc>${site}${p}</loc>${fecha ? `\n    <lastmod>${fecha}</lastmod>` : ''}${imagenes(p)}\n  </url>`;
        })
        .join('\n');
      writeFileSync(
        fileURLToPath(new URL('sitemap_mx.xml', dir)),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`
      );
    },
  },
};

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  devToolbar: { enabled: false },
  // Todos los scripts van en archivos: la política de seguridad no permite código en línea.
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [mapaDelSitio],
});
