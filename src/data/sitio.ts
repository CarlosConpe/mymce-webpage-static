// Datos de la empresa: salen de empresa.json.
import empresa from './empresa.json';
import videos from './videos.json';

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

export const NEGOCIO = {
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': `${D}/#localbusiness`,
  name: 'MYMCE',
  legalName: 'Cocinas, Puertas y Closets S.A. de C.V.',
  alternateName: ['MYMCE Carpintería', 'Grupo MYMCE'],
  url: `${D}/`,
  logo: `${D}/assets/storage/2016/12/logo-2.webp`,
  image: `${D}/assets/storage/2016/12/169471652699961817.webp`,
  description: 'Fábrica de carpintería en San Luis Potosí con casi 40 años de oficio: diseña, fabrica e instala cocinas integrales, closets, vestidores, puertas y muebles de baño, y hace maquila CNC de piezas de MDF y melamina, también forradas con foil PVC.',
  knowsAbout: ['Cocinas integrales', 'Closets y vestidores', 'Puertas a la medida','Muebles de baño', 'Termoformado de MDF con foil PVC', 'Maquila CNC de piezas de MDF y melamina'],
  foundingDate: '1987',
  areaServed: ['San Luis Potosí', 'Soledad de Graciano Sánchez', 'Villa de Pozos', 'Estado de San Luis Potosí'].map((name) => ({ '@type': 'Place', name })),
  email: CORREO,
  telephone: TEL.intl,
  openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: empresa.abre, closes: empresa.cierra },
  sameAs: [empresa.facebook, empresa.instagram, empresa.youtube, empresa.linkedin],
  hasMap: MAPA,
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
  return { '@context': 'https://schema.org', '@graph': [NEGOCIO, ...nodos] };
}

// Videos propios con datos para Google: el promocional donde se puede reproducir y el de cada obra del portafolio.
// Los de fondo de las páginas de servicio son decorativos y no se marcan. Duración y fecha salen de scripts/videos-datos.py.
export function videosLd(html: string, ruta: string, titulo: string, desc: string) {
  const datos = videos as Record<string, { duracion: string; fecha: string }>;
  return [...html.matchAll(/<video([^>]*)>([\s\S]*?)<\/video>/g)].flatMap(([, attrs, dentro], i) => {
    const src = (dentro.match(/<source[^>]*src="([^"]+)"/) ?? attrs.match(/\ssrc="([^"]+)"/))?.[1] ?? '';
    const dato = datos[src];
    const promo = src.endsWith('mymce-promocional.mp4');
    if (!dato || (promo ? !/\scontrols/.test(attrs) : !ruta.startsWith('/portafolio/'))) return [];
    const poster = attrs.match(/poster="([^"]+)"/)?.[1];
    return [{
      '@type': 'VideoObject',
      '@id': `${D}${ruta}#video-${i + 1}`,
      name: promo ? 'MYMCE: cocinas, closets y puertas a la medida en San Luis Potosí' : `Video de la obra: ${titulo}`,
      description: promo ? 'Diseñamos tu proyecto, lo fabricamos en nuestra planta de San Luis Potosí con maquinaria CNC y lo instalamos en tu casa. Cocinas, closets y puertas a la medida.' : desc,
      ...(poster && { thumbnailUrl: D + poster }),
      contentUrl: D + src,
      uploadDate: `${dato.fecha}T00:00:00-06:00`,
      duration: dato.duracion,
      inLanguage: 'es-MX',
      publisher: { '@id': `${D}/#localbusiness` },
    }];
  });
}

export function preguntasLd(path: string, faq: [string, string][]) {
  return {
    '@type': 'FAQPage',
    '@id': `${D}${path}#preguntas`,
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
  };
}
