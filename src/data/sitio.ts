// Datos de la empresa: salen de empresa.json.
import empresa from './empresa.json';
import videos from './videos.json';
import paginas from './paginas.json';

const digitos = (t: string) => t.replace(/\D/g, '');
export const D = 'https://www.mymce.com.mx';
export const TEL = { texto: empresa.telefono, href: `tel:+52${digitos(empresa.telefono)}`, intl: `+52 ${empresa.telefono}`, guiones: digitos(empresa.telefono).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') };
export const WA = { texto: empresa.whatsapp, href: `https://wa.me/52${digitos(empresa.whatsapp)}`, intl: `+52 ${empresa.whatsapp}` };
export const CORREO = empresa.correo;
export const DIRECCION = { calle: empresa.calle, cp: empresa.cp, ciudad: empresa.ciudad, estado: empresa.estado };
export const HORARIO_CORTO = `Lun - Vie: ${empresa.abre.replace(/^0/, '')} - ${empresa.cierra}`;
export const REDES = { facebook: empresa.facebook, instagram: empresa.instagram, youtube: empresa.youtube, linkedin: empresa.linkedin };
const direccionUrl = encodeURIComponent(`${empresa.calle}, ${empresa.cp} ${empresa.ciudad}, ${empresa.estado}`);
const MAPA = `https://www.google.com/maps?q=${direccionUrl}`;
export const MAPA_EMBED = `${MAPA}&z=16&output=embed`;

// Google Ads: cada formulario cuenta como la acción de su página; sin acción propia, como "Website lead".
export const ADS = 'AW-11313299378';
export const LEAD = `${ADS}/pgxBCJvIztoYELL_zJIq`;
export const CONVERSION: Record<string, string> = {
  '/corporate/contact/': `${ADS}/dfPfCM7eot0YELL_zJIq`,
  '/soluciones/carpinteria-para-arquitectos/': `${ADS}/BlmTCPb_nN0YELL_zJIq`,
  '/soluciones/carpinteria-para-cocinistas/': `${ADS}/pwRoCPn_nN0YELL_zJIq`,
  '/soluciones/carpinteria-para-constructoras/': `${ADS}/tmyaCPP_nN0YELL_zJIq`,
  '/soluciones/carpinteria-para-particulares/': `${ADS}/RsXcCPz_nN0YELL_zJIq`,
};

// Nodos con @id fijo: cada página los menciona por su @id y el nodo completo vive en un solo lugar.
const LOGO = { '@type': 'ImageObject', '@id': `${D}/#logo`, url: `${D}/assets/storage/2016/12/logo-2.webp`, contentUrl: `${D}/assets/storage/2016/12/logo-2.webp`, caption: 'MYMCE' };
export const MARCA = { '@type': 'Brand', '@id': `${D}/#marca-mymce`, name: 'MYMCE', logo: { '@id': `${D}/#logo` } };
export const PROMO = `${D}/#video-promocional`;
export const GARANTIA = { '@type': 'WarrantyPromise', '@id': `${D}/corporate/garantia/#garantia`, durationOfWarranty: { '@type': 'QuantitativeValue', value: 12, unitCode: 'MON' }, url: `${D}/corporate/garantia/` };
// Las fotos son de obras que instaló MYMCE.
export const CREDITO = { creator: { '@id': `${D}/#localbusiness` }, creditText: 'MYMCE', copyrightNotice: '© Cocinas, Puertas y Closets S.A. de C.V.', copyrightHolder: { '@id': `${D}/#empresa` } };
// Zona donde damos servicio cuando la página no habla de un municipio o fraccionamiento en particular.
const ciudad = (name: string) => ({ '@type': 'City', name, containedInPlace: { '@type': 'State', name: 'San Luis Potosí' } });
export const ZONA_GENERAL = [ciudad('San Luis Potosí'), ciudad('Soledad de Graciano Sánchez'), ciudad('Villa de Pozos')];

// Qué servicio describe cada página (serviceType) y cuáles entran al catálogo del negocio.
export const SERVICIOS: Record<string, string> = {
  '/servicios/cocinas/': 'Cocinas integrales a la medida',
  '/servicios/cocinas-integrales-modernas/': 'Cocinas integrales modernas',
  '/servicios/fabricantes-de-cocinas-integrales-san-luis-potosi/': 'Fabricación de cocinas integrales',
  '/servicios/cocinas-integrales-economicas-san-luis-potosi/': 'Cocinas integrales a la medida',
  '/servicios/closets-vestidores/': 'Closets a la medida',
  '/servicios/vestidores/': 'Vestidores a la medida',
  '/servicios/closets-de-melamina/': 'Closets de melamina',
  '/servicios/diseno-y-fabricacion-de-puertas/': 'Puertas de interior a la medida',
  '/servicios/diseno-y-fabricacion-de-muebles-de-bano/': 'Muebles de baño a la medida',
  '/servicios/diseno-y-fabricacion-de-escritorios/': 'Escritorios a la medida',
  '/servicios/muebles-a-medida/': 'Muebles a la medida',
  '/servicios/maquila-de-partes/': 'Maquila CNC de piezas de MDF y melamina',
  '/servicios/puertas-y-piezas-recubiertas-con-foil-pvc/': 'Puertas y piezas de MDF con foil PVC',
  '/servicios/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc/': 'Puertas y frentes de cajón con foil PVC',
  '/servicios/cocinas-y-closets-villa-de-pozos/': 'Cocinas integrales y closets a la medida',
  '/servicios/cocinas-y-closets-soledad-de-graciano-sanchez/': 'Cocinas integrales y closets a la medida',
  '/servicios/cocinas-y-closets-catara/': 'Cocinas integrales y closets a la medida',
  '/servicios/cocinas-y-closets-sirenia/': 'Cocinas integrales y closets a la medida',
  '/servicios/cocinas-y-closets-valle-real/': 'Cocinas integrales y closets a la medida',
  '/servicios/cocinas-y-closets-imperia/': 'Cocinas integrales y closets a la medida',
};
const EN_CATALOGO = ['/servicios/cocinas/', '/servicios/closets-vestidores/', '/servicios/vestidores/', '/servicios/diseno-y-fabricacion-de-puertas/', '/servicios/diseno-y-fabricacion-de-muebles-de-bano/', '/servicios/muebles-a-medida/', '/servicios/maquila-de-partes/'];
// Va en la portada; las demás páginas lo mencionan por su @id desde el negocio.
export const CATALOGO = {
  '@type': 'OfferCatalog',
  '@id': `${D}/#catalogo`,
  name: 'Servicios de MYMCE',
  // Cada servicio del catálogo lleva su descripción (la de su página), quién lo da y dónde.
  itemListElement: EN_CATALOGO.map((u) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${D}${u}#servicio`, name: SERVICIOS[u], description: paginas.find((p) => p.ruta === u)?.desc, provider: { '@id': `${D}/#localbusiness` }, areaServed: ZONA_GENERAL, url: `${D}${u}` }, warranty: { '@id': GARANTIA['@id'] } })),
};

// La empresa dueña de la marca: solo como entidad, sin página propia en este sitio.
// Lleva los datos de contacto completos porque Google y Ahrefs marcan incompleta una Organization sin url, logo ni dirección.
export const EMPRESA = {
  '@type': 'Organization',
  '@id': `${D}/#empresa`,
  name: 'Cocinas, Puertas y Closets S.A. de C.V.',
  legalName: 'Cocinas, Puertas y Closets S.A. de C.V.',
  alternateName: 'MYMCE',
  url: `${D}/`,
  logo: { '@id': LOGO['@id'] },
  brand: { '@id': MARCA['@id'] },
  subOrganization: { '@id': `${D}/#localbusiness` },
  email: CORREO,
  telephone: TEL.intl,
  sameAs: [empresa.facebook, empresa.instagram, empresa.youtube, empresa.linkedin],
  address: { '@type': 'PostalAddress', streetAddress: DIRECCION.calle, addressLocality: DIRECCION.ciudad, addressRegion: DIRECCION.estado, postalCode: DIRECCION.cp, addressCountry: 'MX' },
};

export const NEGOCIO = {
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': `${D}/#localbusiness`,
  name: 'MYMCE',
  alternateName: ['MYMCE Carpintería', 'Cocinas, Puertas y Closets', 'Cocinas, Puertas y Closets S.A. de C.V.'],
  parentOrganization: { '@id': `${D}/#empresa` },
  url: `${D}/`,
  logo: LOGO,
  brand: { '@id': MARCA['@id'] },
  hasOfferCatalog: { '@id': `${D}/#catalogo` },
  image: `${D}/assets/storage/2016/12/logo-mymce-carpinteria.webp`,
  description: 'Fábrica de carpintería en San Luis Potosí con casi 40 años de oficio: diseña, fabrica e instala cocinas integrales, closets, vestidores, puertas y muebles de baño, y hace maquila CNC de piezas de MDF y melamina, también forradas con foil PVC.',
  knowsAbout: ['Cocinas integrales', 'Closets y vestidores', 'Puertas a la medida','Muebles de baño', 'Termoformado de MDF con foil PVC', 'Maquila CNC de piezas de MDF y melamina'],
  areaServed: ['San Luis Potosí', 'Soledad de Graciano Sánchez', 'Villa de Pozos', 'Estado de San Luis Potosí'].map((name) => ({ '@type': 'Place', name })),
  email: CORREO,
  telephone: TEL.intl,
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: empresa.abre, closes: empresa.cierra },
  sameAs: [empresa.facebook, empresa.instagram, empresa.youtube, empresa.linkedin],
  hasMap: 'https://maps.google.com/?cid=7983712911562961443',
  geo: { '@type': 'GeoCoordinates', latitude: 22.1075157, longitude: -100.9121575 },
  address: {
    '@type': 'PostalAddress',
    streetAddress: DIRECCION.calle,
    addressLocality: DIRECCION.ciudad,
    addressRegion: DIRECCION.estado,
    postalCode: DIRECCION.cp,
    addressCountry: 'MX',
  },
};


export function ruta(items: [string, string | null][], path: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${D}${path}#ruta`,
    itemListElement: items.map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${D}${u ?? path}` })),
  };
}

export function grafo(...nodos: object[]) {
  return { '@context': 'https://schema.org', '@graph': [NEGOCIO, EMPRESA, LOGO, MARCA, ...nodos] };
}

// Videos propios con datos para Google: el promocional donde se puede reproducir y el de cada obra del portafolio.
// Los de fondo de las páginas de servicio son decorativos y no se marcan. Duración y fecha salen de scripts/videos-datos.py.
export function videosLd(html: string, ruta: string, titulo: string, desc: string) {
  const datos = videos as Record<string, { duracion: string; fecha: string }>;
  return [...html.matchAll(/<video([^>]*)>([\s\S]*?)<\/video>/g)].flatMap(([, attrs, dentro], i) => {
    const src = (dentro.match(/<source[^>]*src="([^"]+)"/) ?? attrs.match(/\ssrc="([^"]+)"/))?.[1] ?? '';
    const dato = datos[src];
    const promo = src.endsWith('mymce-promocional.mp4');
    if (!dato || (promo ? !/\scontrols/.test(attrs) || ruta !== '/' : !ruta.startsWith('/portafolio/'))) return [];
    const poster = attrs.match(/poster="([^"]+)"/)?.[1];
    return [{
      '@type': 'VideoObject',
      '@id': promo ? PROMO : `${D}${ruta}#video-${i + 1}`,
      name: promo ? 'MYMCE: cocinas, closets y puertas a la medida en San Luis Potosí' : `Video de la obra: ${titulo}`,
      description: promo ? 'Diseñamos tu proyecto, lo fabricamos en nuestra planta de San Luis Potosí con maquinaria CNC y lo instalamos en tu casa. Cocinas, closets y puertas a la medida.' : desc,
      ...(poster && { thumbnailUrl: D + poster }),
      contentUrl: D + src,
      uploadDate: `${dato.fecha}T00:00:00-06:00`,
      duration: dato.duracion,
      inLanguage: 'es-MX',
      publisher: { '@id': `${D}/#localbusiness` },
      ...(promo && { creator: { '@id': `${D}/#localbusiness` } }),
    }];
  });
}

// @id de los videos que la página muestra con controles: el promocional siempre con el mismo.
export function videosDePagina(html: string, ruta: string) {
  const datos = videos as Record<string, unknown>;
  return [...html.matchAll(/<video([^>]*)>([\s\S]*?)<\/video>/g)].flatMap(([, attrs, dentro], i) => {
    const src = (dentro.match(/<source[^>]*src="([^"]+)"/) ?? attrs.match(/\ssrc="([^"]+)"/))?.[1] ?? '';
    if (!datos[src]) return [];
    if (src.endsWith('mymce-promocional.mp4')) return /\scontrols/.test(attrs) ? [PROMO] : [];
    return ruta.startsWith('/portafolio/') ? [`${D}${ruta}#video-${i + 1}`] : [];
  });
}

export function preguntasLd(path: string, faq: [string, string][]) {
  return {
    '@type': 'FAQPage',
    '@id': `${D}${path}#preguntas`,
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
  };
}
