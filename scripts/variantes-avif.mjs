// Crea la versión AVIF de cada foto que se carga al bajar por la página (loading="lazy")
// y de sus variantes -400w y -600w. src/data/imagenes.ts las ofrece con <picture> y deja
// el WebP de respaldo. Solo se guarda la AVIF si pesa menos que el WebP.
// Uso: node scripts/variantes-avif.mjs (las que ya existen no se vuelven a crear).
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICO = join(RAIZ, 'public');
const ANCHOS = [400, 600]; // los mismos que scripts/variantes-imagenes.py y src/data/imagenes.ts

function* paginas(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* paginas(p);
    else if (e.name === 'index.html') yield p;
  }
}

const fotos = new Set();
for (const f of paginas(join(RAIZ, 'src', 'contenido'))) {
  for (const [img] of readFileSync(f, 'utf8').matchAll(/<img\b[^>]*>/g)) {
    const src = img.match(/\ssrc="(\/assets\/storage\/[^"]+\.webp)"/)?.[1];
    if (src && img.includes('loading="lazy"')) fotos.add(src);
  }
}

let nuevas = 0, descartadas = 0, pesoWebp = 0, pesoAvif = 0;
for (const foto of fotos) {
  for (const webp of [foto, ...ANCHOS.map((a) => foto.replace(/\.webp$/, `-${a}w.webp`))]) {
    const origen = join(PUBLICO, webp);
    const destino = origen.replace(/\.webp$/, '.avif');
    if (!existsSync(origen) || existsSync(destino)) continue;
    const avif = await sharp(origen).avif({ quality: 50, effort: 4 }).toBuffer();
    const peso = statSync(origen).size;
    if (avif.length >= peso) { descartadas++; continue; }
    writeFileSync(destino, avif);
    nuevas++; pesoWebp += peso; pesoAvif += avif.length;
  }
}
console.log(`${fotos.size} fotos; ${nuevas} AVIF nuevas (${(pesoAvif / 1048576).toFixed(1)} MB contra ${(pesoWebp / 1048576).toFixed(1)} MB en WebP), ${descartadas} no ahorraban y no se guardaron.`);
