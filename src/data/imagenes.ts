// Fotos que se cargan al bajar por la página: si existen sus versiones chicas
// (scripts/variantes-imagenes.py), se ofrecen en srcset para que el celular y la PC
// no bajen la foto grande cuando se muestra en una tarjeta pequeña.
import { existsSync, openSync, readSync, closeSync } from 'node:fs';

const ANCHOS = [400, 600]; // deben coincidir con ANCHOS en scripts/variantes-imagenes.py
const PUBLICO = `${process.cwd()}/public`;
const hay = new Map<string, boolean>();
const existe = (f: string) => {
  if (!hay.has(f)) hay.set(f, existsSync(PUBLICO + f));
  return hay.get(f)!;
};

// Ancho real del archivo WebP (el atributo width de la página puede ser el tamaño en pantalla).
function anchoWebp(f: string): number {
  if (!existe(f)) return 0;
  const b = Buffer.alloc(30);
  const fd = openSync(PUBLICO + f, 'r');
  readSync(fd, b, 0, 30, 0);
  closeSync(fd);
  const tipo = b.toString('ascii', 12, 16);
  if (tipo === 'VP8 ') return b.readUInt16LE(26) & 0x3fff;
  if (tipo === 'VP8L') return 1 + (((b[22] & 0x3f) << 8) | b[21]);
  if (tipo === 'VP8X') return 1 + b.readUIntLE(24, 3);
  return 0;
}

// Los pósters de video se piden hasta que el video se acerca (src/scripts/sitio.js). Se puede dejar
// el primero con su póster cuando está en la primera pantalla, como en la portada.
export function conPosterDiferido(html: string, dejarPrimero = false): string {
  let n = 0;
  return html.replace(/<video\b[^>]*>/g, (v) => (n++ === 0 && dejarPrimero ? v : v.replace(/\sposter="/, ' data-poster="')));
}

// Alto real del archivo WebP, para que la foto de portada reserve su espacio.
function altoWebp(f: string): number {
  if (!existe(f)) return 0;
  const b = Buffer.alloc(30);
  const fd = openSync(PUBLICO + f, 'r');
  readSync(fd, b, 0, 30, 0);
  closeSync(fd);
  const tipo = b.toString('ascii', 12, 16);
  if (tipo === 'VP8 ') return b.readUInt16LE(28) & 0x3fff;
  if (tipo === 'VP8L') return 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | (b[22] >> 6));
  if (tipo === 'VP8X') return 1 + b.readUIntLE(27, 3);
  return 0;
}

// La foto grande de arriba va como <img> y no como fondo: así Google la indexa y entra al mapa de imágenes.
// En celular se ofrece la versión recortada (scripts/portadas-movil.py) si existe.
export function conPortadaImg(html: string, alt: string): string {
  return html.replace(/(<div class="header-title[^"]*"[^>]*?) style="background-image:url\(([^)]+)\)"([^>]*>)/, (_, ini, src, fin) => {
    const ancho = anchoWebp(src), alto = altoWebp(src);
    const medidas = ancho && alto ? ` width="${ancho}" height="${alto}"` : '';
    const limpio = alt.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().replace(/"/g, '&quot;');
    const img = `<img class="portada-foto" src="${src}" alt="${limpio}"${medidas} fetchpriority="high">`;
    const movil = src.replace(/\.webp$/, '-movil.webp');
    const foto = existe(movil) ? `<picture><source media="(max-width: 480px)" srcset="${movil}">${img}</picture>` : img;
    return `${ini} data-portada="${src}"${fin}${foto}`;
  });
}

export function conVariantes(html: string, avif = true): string {
  return html.replace(/<img\b[^>]*>/g, (img) => {
    if (!img.includes('loading="lazy"') || /\ssrcset=/.test(img)) return img;
    const src = img.match(/\ssrc="(\/assets\/storage\/[^"]+)\.webp"/)?.[1];
    const ancho = src ? anchoWebp(`${src}.webp`) : 0;
    if (!src || !ancho) return img;
    const chicas = ANCHOS.filter((a) => a < ancho && existe(`${src}-${a}w.webp`));
    const juego = (ext: string, anchos: number[]) => [...anchos.map((a) => `${src}-${a}w.${ext} ${a}w`), `${src}.${ext} ${ancho}w`].join(', ');
    // "auto" toma el ancho real en pantalla; los navegadores que no lo entienden usan 100vw y bajan la grande, como antes.
    const conSrcset = chicas.length ? img.replace(/<img\b/, `<img srcset="${juego('webp', chicas)}" sizes="auto, 100vw"`) : img;
    // AVIF (scripts/variantes-avif.mjs) pesa menos; el navegador que no la entiende se queda con el WebP del <img>.
    if (!avif || !existe(`${src}.avif`)) return conSrcset;
    const conAvif = chicas.filter((a) => existe(`${src}-${a}w.avif`));
    return `<picture><source type="image/avif" srcset="${juego('avif', conAvif)}" sizes="auto, 100vw">${conSrcset}</picture>`;
  });
}
