// Fecha real de la última modificación de cada página: la del último commit que tocó su archivo de contenido.
// Si el archivo tiene cambios sin commit, cuenta la fecha de hoy. Se corre en local antes de cada commit
// (npm run fechas) y el resultado se guarda en src/data/fechas.json, porque la copia que clona Cloudflare
// puede no traer la historia completa.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const paginas = JSON.parse(readFileSync('src/data/paginas.json', 'utf8'));
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const cambiados = new Set(git('status', '--porcelain', '--', 'src/contenido').split('\n').filter(Boolean).map((l) => l.slice(3).trim()));
const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });

const fechas = {};
for (const p of paginas) {
  const f = `src/contenido/${p.archivo}`;
  fechas[p.ruta] = cambiados.has(f) ? hoy : git('log', '-1', '--format=%cs', '--', f) || hoy;
}
writeFileSync('src/data/fechas.json', JSON.stringify(fechas, null, 1) + '\n');
console.log(`${Object.keys(fechas).length} fechas; ${[...Object.values(fechas)].filter((d) => d === hoy).length} con cambios de hoy`);
