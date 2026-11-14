// Imagen para compartir (og:image) de 1200 x 630 por página, en JPEG, que es lo que mejor leen WhatsApp y Facebook.
// Fuente, en orden: la imagen de la página (paginas.json) o su portada si miden 1200 px o más; si no, la foto de la página
// aunque sea más chica (fotos de obra de 768 px); y si la página no tiene foto propia, una obra real de cocina.
// Las páginas que comparten fuente comparten archivo. Resultado: public/assets/og/*.jpg y src/data/og.json.
// Uso: node scripts/og-imagenes.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs';
import { basename } from 'node:path';

sharp.cache(false);
const paginas = JSON.parse(readFileSync('src/data/paginas.json', 'utf8'));
const POR_DEFECTO = '/assets/storage/2023/08/cocina-17-1-1920x1080.webp';
const NO_FOTO = /logo|removebg|Diseno-sin-titulo2\.webp|laminado-e/;
mkdirSync('public/assets/og', { recursive: true });

const ancho = async (f) => (existsSync('public' + f) ? (await sharp(readFileSync('public' + f)).metadata()).width : 0);
const og = {};
const hechos = new Map();
for (const p of paginas) {
  if (p.ruta === '/404/') continue;
  const html = readFileSync(`src/contenido/${p.archivo}`, 'utf8');
  const portada = html.match(/class="header-title[^"]*"[^>]*background-image:url\(([^)]+)\)/)?.[1];
  const candidatas = [p.img, portada].filter((f) => f && !NO_FOTO.test(f));
  let fuente;
  for (const f of candidatas) if ((await ancho(f)) >= 1200) { fuente = f; break; }
  if (!fuente) for (const f of candidatas) if ((await ancho(f)) >= 700) { fuente = f; break; }
  fuente ??= POR_DEFECTO;
  const destino = `/assets/og/${basename(fuente).replace(/\.\w+$/, '')}.jpg`;
  if (!hechos.has(destino)) {
    await sharp(readFileSync('public' + fuente)).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 78, mozjpeg: true }).toFile('public' + destino);
    hechos.set(destino, fuente);
  }
  og[p.ruta] = destino;
}
// Las que ya no usa ninguna página (por ejemplo, tras renombrar su foto) se quitan.
for (const f of readdirSync('public/assets/og')) if (!hechos.has(`/assets/og/${f}`)) unlinkSync(`public/assets/og/${f}`);
writeFileSync('src/data/og.json', JSON.stringify(og, null, 1) + '\n');
console.log(`${Object.keys(og).length} páginas, ${hechos.size} imágenes en public/assets/og`);
