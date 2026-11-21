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

// Bloque corto "Plazo y garantía" para las páginas de venta a familias que no llevan el bloque completo
// ni dicen las dos cosas en su texto. Las páginas para empresas no lo llevan: ahí la fecha va en la cotización.
const PLAZO_ES = new Set([
  '/servicios/',
  '/servicios/closets-de-melamina/',
  '/servicios/cocinas-integrales-modernas/',
  '/servicios/cocinas-y-closets-villa-de-pozos/',
  '/servicios/cocinas-y-closets-soledad-de-graciano-sanchez/',
  '/servicios/cocinas-y-closets-catara/',
  '/servicios/cocinas-y-closets-sirenia/',
  '/servicios/cocinas-y-closets-valle-real/',
  '/servicios/cocinas-y-closets-imperia/',
  '/soluciones/carpinteria-para-particulares/',
  '/corporate/contact/',
]);
const PLAZO_EN = new Set(['/en/', '/en/kitchens/', '/en/closets-wardrobes/']);

const plazo = (en: boolean) =>
  '<div class="section-item section-empty por-que plazo-garantia">\n<div class="content container">\n<div class="row">\n' +
  `<div class="col-md-12 bloque-titulo"><h2 id="plazo-y-garantia">${en ? 'Delivery time and warranty' : 'Plazo de entrega y garantía'}</h2></div>\n` +
  '<div class="col-md-12"><ul class="por-que__lista">\n' +
  (en
    ? '<li><i class="text-xl fa fa-clock-o"></i><div><h3>About 3 business weeks</h3><p>That is our usual delivery time. For larger projects, the exact date is in the quote.</p></div></li>\n' +
      '<li><i class="text-xl fa fa-star"></i><div><h3>12-month warranty</h3><p>On manufacturing, coating, finish and installation, from the day we both sign the delivery and acceptance report. <a href="/corporate/garantia/" hreflang="es">Warranty policy (in Spanish)</a>.</p></div></li>\n'
    : '<li><i class="text-xl fa fa-clock-o"></i><div><h3>Entrega en unas 3 semanas hábiles</h3><p>Es el plazo normal. En proyectos más grandes, la fecha exacta va en la cotización.</p></div></li>\n' +
      '<li><i class="text-xl fa fa-star"></i><div><h3>Garantía de 12 meses</h3><p>En fabricación, recubrimiento, acabado e instalación, desde el acta de entrega-recepción. <a href="/corporate/garantia/">Ver qué cubre la garantía</a>.</p></div></li>\n') +
  '</ul></div>\n</div>\n</div>\n</div>\n';

// Se mete en el límite de una sección, para no romper la rejilla: en la portada antes del formulario, en los servicios antes de sus preguntas frecuentes y, si no hay, al final.
function meter(html: string, ancla: number, bloqueHtml: string) {
  const corte = ancla > 0 ? html.lastIndexOf('<div class="section-item', ancla) : -1;
  return corte > 0 ? html.slice(0, corte) + bloqueHtml + html.slice(corte) : html + bloqueHtml;
}
export function conPorQue(html: string, ruta: string): string {
  if (PLAZO_ES.has(ruta) || PLAZO_EN.has(ruta)) return meter(html, html.search(/<h2[^>]*>\s*Preguntas/), plazo(PLAZO_EN.has(ruta)));
  if (!RUTAS.has(ruta)) return html;
  return meter(html, ruta === '/' ? html.indexOf('id="cotizar"') : html.search(/<h2>Preguntas frecuentes sobre [^<]+<\/h2>/), bloque());
}
