// Las fotos con versión AVIF van dentro de <picture> (src/data/imagenes.ts). Varias reglas
// del sitio esperan la foto como hija directa ("... > img"), así que este script copia cada
// una con "> picture > img" en src/styles/picture.css. Se vuelve a correr si cambian esas reglas.
// Uso: node scripts/css-picture.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOJAS = ['sitio.css', 'propio.css', 'correcciones.css', 'portada.css'];
const salida = postcss.root();
salida.append(postcss.comment({ text: ' Generado por scripts/css-picture.mjs. No editar a mano. ' }));
// El <picture> no ocupa caja propia: la foto se acomoda como si fuera hija directa.
salida.append(postcss.rule({ selector: 'picture', nodes: [postcss.decl({ prop: 'display', value: 'contents' })] }));

let copias = 0;
for (const hoja of HOJAS) {
  const css = postcss.parse(readFileSync(join(RAIZ, 'src', 'styles', hoja), 'utf8'));
  css.walkRules((regla) => {
    const conImg = regla.selectors.filter((s) => />\s*img\b/.test(s));
    if (!conImg.length) return;
    const copia = regla.clone({ selectors: conImg.map((s) => s.replace(/>\s*img\b/g, '> picture > img')) });
    // Se conserva la media query o el @supports que la envolvía.
    let nodo = copia;
    for (let padre = regla.parent; padre && padre.type === 'atrule'; padre = padre.parent) {
      nodo = padre.clone({ nodes: [] }).append(nodo);
    }
    salida.append(nodo);
    copias++;
  });
}
writeFileSync(join(RAIZ, 'src', 'styles', 'picture.css'), salida.toResult().css + '\n');
console.log(`${copias} reglas copiadas a src/styles/picture.css`);
