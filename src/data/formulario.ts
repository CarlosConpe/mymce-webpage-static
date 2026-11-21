// Un solo formulario de cotización para todo el sitio (specs/formularios-que-venden.md).
// Al compilar, cada <form data-formulario> escrito en el contenido se cambia por este. Manda los mismos
// campos de siempre a /api/send-email: Nombre, Teléfono, Correo y Mensaje; lo demás llega como dato extra.
import { WA } from './sitio';

type Juego = 'familia' | 'empresa' | 'en';
const OPCIONES: Record<Juego, string[]> = {
  familia: ['Cocina', 'Closet o vestidor', 'Baño', 'Puertas', 'Otro mueble'],
  empresa: ['Cocinas por volumen', 'Closets por volumen', 'Puertas y frentes con foil PVC', 'Maquila de piezas', 'Otro'],
  en: ['Kitchen', 'Closet or wardrobe', 'Foil PVC doors and drawer fronts', 'Other'],
};
// Qué juego de opciones usa cada página y cuál llega marcada.
const PAGINAS: Record<string, [Juego, string?]> = {
  '/servicios/cocinas/': ['familia', 'Cocina'],
  '/servicios/closets-vestidores/': ['familia', 'Closet o vestidor'],
  '/servicios/diseno-y-fabricacion-de-muebles-de-bano/': ['familia', 'Baño'],
  '/servicios/diseno-y-fabricacion-de-puertas/': ['familia', 'Puertas'],
  '/servicios/diseno-y-fabricacion-de-escritorios/': ['familia', 'Otro mueble'],
  '/soluciones/carpinteria-para-constructoras/': ['empresa'],
  '/soluciones/carpinteria-para-arquitectos/': ['empresa'],
  '/soluciones/carpinteria-para-cocinistas/': ['empresa'],
  '/servicios/maquila-de-partes/': ['empresa', 'Maquila de piezas'],
  '/servicios/puertas-y-piezas-recubiertas-con-foil-pvc/': ['empresa', 'Puertas y frentes con foil PVC'],
  '/servicios/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc/': ['empresa', 'Puertas y frentes con foil PVC'],
  '/servicios/pvc-foil-covered-cabinet-doors-drawer-fronts/': ['en', 'Foil PVC doors and drawer fronts'],
};

const TEXTOS = {
  es: {
    pregunta: '¿Qué quieres cotizar?',
    nombre: 'Nombre', tel: 'WhatsApp o teléfono', correo: 'Correo', empresa: 'Empresa', mensaje: '¿Algo más que debamos saber?',
    obligatorio: '(obligatorio)', opcional: '(opcional)',
    ejemplo: 'Por ejemplo: modelo de casa, fraccionamiento o medidas aproximadas',
    boton: 'Pedir mi cotización',
    nota: 'Es gratis y sin compromiso. Te respondemos desde unas horas hasta una semana, según el tamaño del proyecto, de lunes a viernes de 9:00 a 18:00.',
    alt: '¿Prefieres WhatsApp?', altLink: 'Mándanos fotos y medidas aproximadas',
    confianza: {
      familia: ['Cotización gratis y sin compromiso', 'Garantía de 12 meses', 'Lo fabricamos en nuestra planta de San Luis Potosí y lo instalamos nosotros'],
      empresa: ['Pieza muestra antes de producir', 'Cotización desglosada', 'Fecha de entrega en la cotización'],
    },
    sigue: 'Después: te contactamos, medimos, fabricamos en unas 3 semanas hábiles e instalamos. En proyectos grandes la fecha va en la cotización.',
    error: 'No se pudo enviar. Inténtalo otra vez o escríbenos por WhatsApp.',
    gracias: '¡Listo! Recibimos tu solicitud',
    pasos: ['Revisamos lo que nos mandaste.', 'Te llamamos o te escribimos de lunes a viernes, de 9:00 a 18:00, para agendar la medición.', 'Medimos, diseñamos contigo y te damos tu cotización.'],
    tiempo: 'Respondemos desde unas horas hasta una semana, según el tamaño del proyecto.',
    seguir: 'Seguir por WhatsApp',
  },
  en: {
    pregunta: 'What do you need a quote for?',
    nombre: 'Name', tel: 'WhatsApp or phone', correo: 'Email', empresa: 'Company', mensaje: 'Anything else we should know?',
    obligatorio: '(required)', opcional: '(optional)',
    ejemplo: 'For example: quantities, sizes or delivery city',
    boton: 'Request my free quote',
    nota: 'Free and with no obligation. We reply within a few hours to a week, depending on the project size, Monday to Friday, 9:00 to 18:00 (Mexico time).',
    alt: 'Prefer WhatsApp?', altLink: 'Send us photos and rough measurements',
    confianza: {
      familia: ['Free quote, no obligation', '12-month warranty', 'Made in our own plant in San Luis Potosí'],
      empresa: ['Sample piece before production', 'Itemized quote', 'Delivery date stated in the quote'],
    },
    sigue: 'Usual lead time is about 3 business weeks. For large projects, the date is set in the quote.',
    error: 'It could not be sent. Please try again or message us on WhatsApp.',
    gracias: 'Done! We received your request',
    pasos: ['We review what you sent.', 'We call or message you Monday to Friday, 9:00 to 18:00, to go over the details.', 'We send you your quote.'],
    tiempo: 'We reply within a few hours to a week, depending on the project size.',
    seguir: 'Continue on WhatsApp',
  },
};

function formulario(ruta: string, ingles: boolean) {
  const [juego, marcada] = PAGINAS[ruta] ?? (ingles ? ['en'] : ['familia']);
  const t = TEXTOS[ingles ? 'en' : 'es'];
  const empresa = juego !== 'familia';
  const chips = OPCIONES[juego].map((o) => `<label class="chip"><input type="radio" name="Quiere cotizar" value="${o}"${o === marcada ? ' checked' : ''}><span>${o}</span></label>`).join('');
  const campo = (id: string, etiqueta: string, req: boolean, control: string) =>
    `<div class="campo"><label for="${id}">${etiqueta} <span class="campo-nota">${req ? t.obligatorio : t.opcional}</span></label>${control}<p class="campo-error" id="${id}-error" hidden></p></div>`;
  return `<form class="form-box form-cotizar" id="cotizar" data-formulario="" novalidate data-wa="${WA.href}">`
    + `<div aria-hidden="true" class="trampa"><label>No llenar<input aria-label="sitio_web" autocomplete="off" name="sitio_web" tabindex="-1" type="text"></label></div>`
    + `<fieldset class="chips"><legend>${t.pregunta}</legend>${chips}</fieldset>`
    + campo('f-nombre', t.nombre, true, `<input class="form-control" id="f-nombre" name="Nombre" type="text" autocomplete="name" required>`)
    + campo('f-tel', t.tel, true, `<input class="form-control" id="f-tel" name="Teléfono" type="tel" autocomplete="tel" inputmode="tel" required>`)
    + campo('f-correo', t.correo, false, `<input class="form-control" id="f-correo" name="Correo" type="email" autocomplete="email">`)
    + (empresa ? campo('f-empresa', t.empresa, false, `<input class="form-control" id="f-empresa" name="Empresa" type="text" autocomplete="organization">`) : '')
    + campo('f-mensaje', t.mensaje, false, `<textarea class="form-control" id="f-mensaje" name="Mensaje" rows="3" placeholder="${t.ejemplo}"></textarea>`)
    + `<ul class="form-confianza">${t.confianza[empresa ? 'empresa' : 'familia'].map((c) => `<li>${c}</li>`).join('')}</ul>`
    + `<div class="form-enviar"><button class="btn btn-lg" type="submit">${t.boton}</button><img alt="" aria-hidden="true" class="cf-loader" height="200" loading="lazy" src="/assets/img/loader.svg" width="200"></div>`
    + `<p class="nota-formulario">${t.nota}</p>`
    + `<p class="nota-formulario form-sigue">${t.sigue}</p>`
    + `<p class="form-alt">${t.alt} <a href="${WA.href}" target="_blank" rel="noopener" data-whatsapp="formulario">${t.altLink}</a></p>`
    + `<div class="error-box" role="alert"><div class="alert alert-warning">${t.error}</div></div>`
    + `</form>`
    + `<div class="form-gracias" hidden tabindex="-1"><h3>${t.gracias}</h3><ol>${t.pasos.map((p) => `<li>${p}</li>`).join('')}</ol><p>${t.tiempo}</p>`
    + `<a class="btn btn-lg" data-wa-listo href="${WA.href}" target="_blank" rel="noopener" data-whatsapp="despues-del-formulario"><i class="fa fa-whatsapp"></i> ${t.seguir}</a></div>`;
}

export function conFormulario(html: string, ruta: string, ingles = false): string {
  return html.replace(/<form class="form-box[^"]*"[^>]*data-formulario[^>]*>[\s\S]*?<\/form>/, () => formulario(ruta, ingles));
}
export const tieneFormulario = (html: string) => /data-formulario/.test(html);
