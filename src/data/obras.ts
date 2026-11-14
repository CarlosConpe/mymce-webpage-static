// Las 83 obras del portafolio con su fraccionamiento, zona, tipo y modelo de casa.
// Sale de la ruta (tipo y fraccionamiento) y del h1 de cada ficha (modelo, con acentos).
import { readFileSync } from 'node:fs';
import paginas from './paginas.json';

export const FRACCS: Record<string, { nombre: string; url: string; zona?: { nombre: string; url: string } }> = {
  catara: { nombre: 'Catara', url: '/servicios/cocinas-y-closets-catara/', zona: { nombre: 'Villa de Pozos', url: '/servicios/cocinas-y-closets-villa-de-pozos/' } },
  sirenia: { nombre: 'Sirenia', url: '/servicios/cocinas-y-closets-sirenia/', zona: { nombre: 'Villa de Pozos', url: '/servicios/cocinas-y-closets-villa-de-pozos/' } },
  'valle-real': { nombre: 'Valle Real', url: '/servicios/cocinas-y-closets-valle-real/', zona: { nombre: 'Soledad', url: '/servicios/cocinas-y-closets-soledad-de-graciano-sanchez/' } },
  imperia: { nombre: 'Imperia', url: '/servicios/cocinas-y-closets-imperia/' },
};
const TIPOS: Record<string, string> = { cocina: 'Cocina', 'closets-y-vestidores': 'Closets y vestidor', closets: 'Closets' };

export type Obra = { ruta: string; tipo: string; tipoNombre: string; fracc: string; modelo: string; nombre: string };

export const OBRAS: Obra[] = paginas.flatMap((p) => {
  const m = p.ruta.match(/^\/portafolio\/(cocina|closets-y-vestidores|closets)-(catara|sirenia|valle-real|imperia)-modelo-.+\/$/);
  if (!m) return [];
  const h1 = readFileSync(`${process.cwd()}/src/contenido/${p.archivo}`, 'utf8').match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/&nbsp;/g, ' ') ?? '';
  const modelo = h1.match(/Modelo\s+(.+?)\s+en\s/i)?.[1] ?? '';
  return [{ ruta: p.ruta, tipo: m[1], tipoNombre: TIPOS[m[1]], fracc: m[2], modelo, nombre: `${TIPOS[m[1]]} modelo ${modelo}` }];
});
export const obraDe = (ruta: string) => OBRAS.find((o) => o.ruta === ruta);

// "En esta misma casa": la otra obra del mismo modelo y fraccionamiento, y las 3 siguientes del mismo
// fraccionamiento en orden fijo; así cada obra recibe enlaces de sus vecinas y ninguna se queda sola.
export function hermanas(o: Obra) {
  const mismaCasa = OBRAS.filter((x) => x.fracc === o.fracc && x.modelo === o.modelo && x.ruta !== o.ruta);
  const delFracc = OBRAS.filter((x) => x.fracc === o.fracc).sort((a, b) => a.ruta.localeCompare(b.ruta));
  const i = delFracc.findIndex((x) => x.ruta === o.ruta);
  const vecinas = [1, 2, 3].map((k) => delFracc[(i + k) % delFracc.length]).filter((x) => x.ruta !== o.ruta && !mismaCasa.includes(x));
  return { mismaCasa, vecinas };
}
