// Avisa a Bing y a los demás buscadores de IndexNow qué páginas cambiaron después de publicar.
// Lee el sitemap en vivo, saca una huella del contenido de cada página y la compara con la
// de la vez anterior (guardada en .indexnow/estado.json, fuera de git). Manda las nuevas,
// las que cambiaron y las que salieron del sitemap. Google no usa IndexNow; para Google
// siguen el sitemap y Search Console.
// Uso, unos minutos después de publicar: npm run avisar-indexnow
//   --todas    manda todas las páginas del sitemap
//   --prueba   solo muestra qué mandaría, sin avisar ni guardar
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = 'https://www.mymce.com.mx';
const HOST = 'www.mymce.com.mx';
const CLAVE = readdirSync(join(RAIZ, 'public')).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.slice(0, -4);
const ESTADO = join(RAIZ, '.indexnow', 'estado.json');
const todas = process.argv.includes('--todas');
const prueba = process.argv.includes('--prueba');

if (!CLAVE) throw new Error('Falta el archivo de clave <32 hex>.txt en public/');

const traer = async (url) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'mymce-indexnow/1.0' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
};

// La clave tiene que estar publicada antes de avisar; si no, los buscadores rechazan el aviso.
const publicada = await traer(`${SITIO}/${CLAVE}.txt`).then((t) => t.trim(), () => '');
if (publicada !== CLAVE) {
  if (!prueba) throw new Error('El archivo de clave no está publicado o no coincide; publica primero el sitio.');
  console.log('Aviso: el archivo de clave todavía no está publicado.');
}

const urls = [...(await traer(`${SITIO}/sitemap_mx.xml`)).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.startsWith(`${SITIO}/assets/`));

// Huella del contenido visible y de los datos de la página, sin scripts ni lo que agrega Cloudflare.
const huella = (html) => createHash('sha256').update(
  html.replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ')
).digest('hex').slice(0, 16);

const antes = existsSync(ESTADO) ? JSON.parse(readFileSync(ESTADO, 'utf8')) : {};
const ahora = {};
const cambiadas = [];
for (const url of urls) {
  ahora[url] = huella(await traer(url));
  if (todas || antes[url] !== ahora[url]) cambiadas.push(url);
}
const quitadas = Object.keys(antes).filter((u) => !(u in ahora));
const avisar = [...cambiadas, ...quitadas];

console.log(`${urls.length} páginas en el sitemap: ${cambiadas.length} nuevas o cambiadas, ${quitadas.length} quitadas.`);
avisar.forEach((u) => console.log('  ' + u));
if (!avisar.length || prueba) process.exit(0);

// Hasta 10 000 URL por aviso; el punto global reparte el aviso a todos los buscadores de IndexNow.
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: CLAVE, keyLocation: `${SITIO}/${CLAVE}.txt`, urlList: avisar.slice(0, 10000) }),
  signal: AbortSignal.timeout(30000),
});
console.log(`IndexNow respondió ${r.status} ${r.statusText}`);
if (r.status !== 200 && r.status !== 202) {
  console.log((await r.text()).slice(0, 500));
  process.exit(1);
}
mkdirSync(dirname(ESTADO), { recursive: true });
writeFileSync(ESTADO, JSON.stringify(ahora, null, 1));
