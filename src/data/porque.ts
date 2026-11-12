// Bloque "Por qué hacer tus muebles con nosotros": los datos que más pesan al decidir, en un solo lugar.
// Va en la portada y en las páginas de servicio principales. Los íconos los convierte conIconos().
const RUTAS = new Set([
  '/',
  '/servicios/cocinas/',
  '/servicios/closets-vestidores/',
  '/servicios/vestidores/',
  '/servicios/muebles-a-medida/',
  '/servicios/diseno-y-fabricacion-de-muebles-de-bano/',
  '/servicios/diseno-y-fabricacion-de-puertas/',
  '/servicios/diseno-y-fabricacion-de-escritorios/',
]);

const PUNTOS: [string, string, string][] = [
  ['gears', 'Planta propia con CNC', 'Cortamos y armamos tus muebles en nuestra planta de San Luis Potosí.'],
  ['calendar', 'Casi 40 años de oficio', 'Hacemos cocinas, closets y muebles a la medida desde hace casi cuatro décadas.'],
  ['clock-o', 'Entrega en unas 3 semanas hábiles', 'Es el plazo normal. Si tu proyecto es grande, la fecha exacta va en la cotización.'],
  ['star', 'Garantía de 12 meses', 'En fabricación, recubrimiento, acabado e instalación. <a href="/corporate/garantia/">Ver qué cubre</a>.'],
  ['envelope', 'Cotización sin esperar de más', 'Te la mandamos desde unas horas hasta una semana después, según el tamaño.'],
  ['home', 'Fotos de obras reales', 'Todo lo que ves en el sitio lo instalamos nosotros.'],
];

const bloque = () =>
  '<div class="section-item section-empty por-que">\n<div class="content container">\n<div class="row">\n' +
  '<div class="col-md-12 bloque-titulo"><h2 id="por-que">Por qué hacer tus muebles con nosotros</h2></div>\n' +
  '<div class="col-md-12"><ul class="por-que__lista">\n' +
  PUNTOS.map(([ico, titulo, texto]) => `<li><i class="text-xl fa fa-${ico}"></i><div><h3>${titulo}</h3><p>${texto}</p></div></li>`).join('\n') +
  '\n</ul></div>\n</div>\n</div>\n</div>\n';

// Se mete en el límite de una sección, para no romper la rejilla: en la portada antes de las obras
// reales, en los servicios antes de sus preguntas frecuentes y, si no hay, al final.
export function conPorQue(html: string, ruta: string): string {
  if (!RUTAS.has(ruta)) return html;
  const ancla = ruta === '/' ? html.indexOf('<h2>Obras reales en San Luis Potosí</h2>') : html.search(/<h2>Preguntas frecuentes sobre [^<]+<\/h2>/);
  const corte = ancla > 0 ? html.lastIndexOf('<div class="section-item', ancla) : -1;
  return corte > 0 ? html.slice(0, corte) + bloque() + html.slice(corte) : html + bloque();
}
