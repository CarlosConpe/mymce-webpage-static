// Revisa dist/ después de `npm run build`: enlaces, medios, metadatos, datos estructurados y
// datos viejos de la empresa. Las frases del texto heredado se listan como avisos, sin fallar.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const paginas = [];
(function andar(d) {
  for (const f of readdirSync(d)) {
    const r = join(d, f);
    if (statSync(r).isDirectory()) { if (!r.includes('assets') && !r.includes('_astro')) andar(r); }
    else if (f.endsWith('.html')) paginas.push(r);
  }
})(DIST);

const prohibidas = [
  [/444[ -]?821[ -]?48[ -]?90|Israel\s*44[08]|Anaya|78390|8:30/i, 'dato viejo'],
  [/live\.com\.mx|Maderas y Materiales|800-00-CPC/i, 'contacto o razón social que no se publica'],
];
const deTexto = [
  [/\b(teka|blum|hettich|egger|finsa|grass|whirlpool|mabe|bosch|homag|biesse|masisa|arauco|scm|felder|altendorf)\b/i, 'marca'],
  [/la mejor\b|los mejores\b|primer nivel|joya de|prestigios|con los brazos abiertos|de lujo|calidad superior|quirúrgicamente/i, 'promesa o relleno'],
  [/export(amos|ación)|direct export|export-ready|export orders/i, 'exportación directa'],
  [/maquin\w*\s+(?:de|en)\s+madera|piezas?\s+(?:maquinadas?\s+)?de\s+madera|corte\s+(?:cnc\s+)?de\s+madera/i, 'maquinado de madera'],
  [/drive\.google|docs\.google/i, 'enlace externo a Drive'],
  [/—/, 'raya larga'],
];
const errores = [];
const avisos = [];
const titulos = new Map(), descripciones = new Map();
const destinos = new Set();
for (const p of paginas) {
  const html = readFileSync(p, 'utf8');
  const url = '/' + relative(DIST, p).split(sep).join('/').replace(/index\.html$/, '');
  const visible = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ');
  // Los correos protegidos se arman en el navegador con data-u y data-d: no quedan escritos en el código.
  const publicado = html.replace(/\sdata-[ud]="[^"]*"/g, '');
  for (const [re, tipo] of prohibidas) {
    const m = publicado.match(re);
    if (m) errores.push(`${url}: ${tipo}: "${m[0]}"`);
  }
  for (const [re, tipo] of deTexto) {
    const m = visible.replace(/<[^>]+>/g, ' ').match(re);
    if (m) avisos.push(`${url}: ${tipo}: "${m[0]}"`);
  }
  const t = html.match(/<title>(.*?)<\/title>/)?.[1];
  const d = html.match(/name="description" content="([^"]*)"/)?.[1];
  if (!t || !d) errores.push(`${url}: sin título o descripción`);
  if (t) titulos.set(t, [...(titulos.get(t) || []), url]);
  if (d) descripciones.set(d, [...(descripciones.get(d) || []), url]);
  if (t && t.length > 70) avisos.push(`${url}: título de ${t.length}`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errores.push(`${url}: ${h1} h1`);
  if (!html.includes('rel="canonical"') && !url.startsWith('/404') && !url.startsWith('/seguimiento')) errores.push(`${url}: sin canonical`);
  for (const b of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(b[1]); } catch { errores.push(`${url}: JSON-LD inválido`); }
  }
  for (const m of html.matchAll(/(?:href|src|poster|data-src)="([^"#?]+)[^"]*"/g)) {
    const u = m[1];
    if (!u.startsWith('/') || u.startsWith('//')) continue;
    destinos.add(u);
  }
  for (const lista of html.matchAll(/<ul\b[^>]*>([\s\S]*?)<\/ul>/g)) {
    const ligas = [...lista[1].matchAll(/<a(?![^>]*dropdown-toggle)[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    const repetida = ligas.find((u, i) => ligas.indexOf(u) !== i);
    if (repetida && !/class="(fichas|obras)/.test(lista[0])) errores.push(`${url}: enlace repetido en una lista: ${repetida}`);
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt=/.test(m[0])) errores.push(`${url}: imagen sin alt`);
    if (!/\swidth=/.test(m[0]) && !/visor|alt=""/.test(m[0])) errores.push(`${url}: imagen sin medidas`);
  }
}
for (const u of destinos) {
  const f = join(DIST, decodeURI(u));
  if (!(existsSync(f) && statSync(f).isFile()) && !existsSync(join(f, 'index.html'))) errores.push(`enlace roto: ${u}`);
  if (!u.includes('.') && !u.endsWith('/')) errores.push(`enlace sin diagonal final: ${u}`);
}
for (const [t, us] of titulos) if (us.length > 1) errores.push(`título repetido "${t}": ${us.length}`);
for (const [t, us] of descripciones) if (us.length > 1) errores.push(`descripción repetida: ${us.length} "${t.slice(0, 50)}"`);

console.log(`${paginas.length} páginas, ${destinos.size} destinos internos revisados.`);
if (avisos.length) console.log(`Avisos del texto heredado (${avisos.length}):\n` + avisos.join('\n'));
console.log(errores.length ? errores.join('\n') : 'Sin errores.');
process.exitCode = errores.length ? 1 : 0;
