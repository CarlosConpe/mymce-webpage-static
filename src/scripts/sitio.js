// Comportamiento del sitio: menú, carruseles, acordeones, fotos, mapa, videos y formularios.
// Reemplaza a jQuery y a los complementos del tema anterior.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const escritorio = () => window.matchMedia('(min-width: 992px)').matches;
const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Google Ads: la acción se manda solo si la etiqueta de Google ya cargó.
function conversion(envio) {
    if (envio && typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: envio });
}

// Conteo propio de contactos por página: solo el tipo y la ruta, sin cookies ni datos de la persona.
function contar(tipo) {
    try { navigator.sendBeacon?.('/api/clic', JSON.stringify({ tipo, pagina: location.pathname })); } catch {}
}

/* Cabecera: compacta al bajar, menú en celular y submenús */
const cabecera = $('header');
const mini = $('.navbar-mini');
const arriba = $('.scroll-top');
function alDesplazar() {
    const abajo = window.scrollY > 100;
    cabecera?.classList.toggle('scroll-css', abajo);
    mini?.classList.toggle('hidden', abajo);
    arriba?.classList.toggle('show', window.scrollY > 400);
}
window.addEventListener('scroll', alDesplazar, { passive: true });
alDesplazar();
// La barra es fija: la cabecera guarda su alto para que el contenido no quede debajo.
const barra = $('header > .navbar');
const reservar = () => { if (cabecera && barra && window.scrollY < 100) cabecera.style.height = barra.offsetHeight + 'px'; };
reservar();
window.addEventListener('resize', reservar);
arriba?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' }));

const boton = $('.navbar-toggle');
const menu = $('.navbar-collapse');
boton?.addEventListener('click', () => {
    const abierto = menu.classList.toggle('in');
    boton.setAttribute('aria-expanded', String(abierto));
});
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('#main-menu .open').forEach((li) => li.classList.remove('open'));
    if (menu?.classList.contains('in')) {
        menu.classList.remove('in');
        boton.setAttribute('aria-expanded', 'false');
        boton.focus();
    }
});
$$('#main-menu .dropdown').forEach((li) => {
    li.addEventListener('mouseenter', () => escritorio() && li.classList.add('open'));
    li.addEventListener('mouseleave', () => escritorio() && li.classList.remove('open'));
    li.addEventListener('focusin', () => escritorio() && li.classList.add('open'));
    li.addEventListener('focusout', (e) => { if (!li.contains(e.relatedTarget)) li.classList.remove('open'); });
    // En celular, el primer toque abre el submenú y el segundo entra a la página.
    li.querySelector(':scope > .dropdown-toggle')?.addEventListener('click', (e) => {
        if (escritorio() || li.classList.contains('open')) return;
        e.preventDefault();
        li.classList.add('open');
    });
});
$$('[data-pestana]').forEach((a) => {
    const activar = (e) => {
        e.preventDefault();
        const caja = a.closest('.tab-box');
        $$('.nav-tabs li', caja).forEach((li) => li.classList.toggle('active', li.contains(a)));
        $$('[data-pestana]', caja).forEach((x) => x.setAttribute('aria-selected', String(x === a)));
        $$('[data-panel]', caja).forEach((p) => p.classList.toggle('active', p.dataset.panel === a.dataset.pestana));
    };
    a.addEventListener('click', activar);
    a.addEventListener('mouseenter', (e) => escritorio() && activar(e));
});

/* Encabezados a pantalla completa: alto de la ventana menos lo que indica la página */
function altoEncabezados() {
    $$('.full-screen-title[data-sub-height]').forEach((el) => {
        el.style.minHeight = Math.max(320, window.innerHeight - (parseInt(el.dataset.subHeight, 10) || 0)) + 'px';
    });
}
// El título de las franjas con foto se centra en vertical con CSS (correcciones.css).
altoEncabezados();
window.addEventListener('resize', altoEncabezados);

/* Acordeones */
$$('.accordion-list .list-group-item > a').forEach((a) => {
    const panel = a.nextElementSibling;
    if (!panel) return;
    // Como el tema: data-open indica qué elemento empieza abierto (1 = el primero).
    const lista = a.closest('.accordion-list');
    const abierto = lista && parseInt(lista.dataset.open, 10);
    if (abierto && [...lista.querySelectorAll(':scope > .list-group-item > a')][abierto - 1] === a) a.classList.add('active');
    a.setAttribute('role', 'button');
    a.setAttribute('aria-expanded', String(a.classList.contains('active')));
    if (a.classList.contains('active')) panel.style.display = 'block';
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const abrir = !a.classList.contains('active');
        a.classList.toggle('active', abrir);
        a.setAttribute('aria-expanded', String(abrir));
        panel.style.display = abrir ? 'block' : 'none';
    });
});

/* Carruseles: mismas clases y opciones que usaba el tema */
function opciones(texto) {
    const o = {};
    (texto || '').split(',').forEach((par) => {
        const [k, v] = par.split(':');
        if (k && v !== undefined) o[k.trim()] = v.trim();
    });
    return o;
}
// Solo en las páginas que tenían carrusel; en las demás la lista se ve tal cual, como antes.
// Cada carrusel se arma cuando está por verse: armar todos al cargar trababa el celular.
function armarCarrusel(caja) {
    const lista = $('.slides', caja);
    const fichas = lista ? [...lista.children] : [];
    if (!fichas.length) return;
    const o = opciones(caja.dataset.options);
    // Mismo cálculo del tema: cuántas fotos caben según el ancho mínimo de cada una.
    const esTira = caja.classList.contains('carousel');
    let margen = 0;
    const cuantos = () => {
        if (!esTira) { margen = 0; return 1; }
        // En celular el tema metía dos fotos de 130 px por vista; aquí cada una mide al menos 260.
        const minimo = window.innerWidth < 768 ? 260 : parseInt(o.minWidth, 10) || (window.innerWidth < 993 ? 180 : 110);
        const ancho = caja.clientWidth;
        let n = parseInt(o.numItems, 10) || 3;
        if (ancho / n < minimo) n = ancho / 3 > minimo ? 3 : ancho / 2 > minimo ? 2 : 1;
        margen = n === 1 ? 0 : (o.itemMargin !== undefined ? parseInt(o.itemMargin, 10) : 5);
        // Como el tema: el ancho de cada foto sale de n aunque haya menos fotos.
        return n;
    };
    let actual = 0;
    caja.classList.add('carrusel-listo');
    lista.style.display = 'flex';
    lista.style.transition = sinMovimiento ? 'none' : 'transform .6s ease';
    const ventana = document.createElement('div');
    ventana.className = 'flex-viewport';
    lista.before(ventana);
    ventana.appendChild(lista);

    // Como el tema: cada página avanza un grupo completo; la última se alinea al final.
    const paginas = () => Math.max(1, Math.ceil(fichas.length / cuantos()));
    const puntos = document.createElement('ol');
    puntos.className = 'flex-control-nav flex-control-paging';
    const flechas = document.createElement('ul');
    flechas.className = 'flex-direction-nav';
    flechas.innerHTML = '<li class="flex-nav-prev"><a class="flex-prev" href="#" aria-label="Anterior"></a></li><li class="flex-nav-next"><a class="flex-next" href="#" aria-label="Siguiente"></a></li>';
    caja.append(flechas);
    if (o.controlNav !== 'false') caja.append(puntos);

    function pinta() {
        const n = cuantos();
        lista.style.gap = margen + 'px';
        const ancho = (ventana.clientWidth - margen * (n - 1)) / n;
        fichas.forEach((li) => { li.style.flex = `0 0 ${ancho}px`; li.style.width = ancho + 'px'; });
        actual = Math.min(actual, paginas() - 1);
        const primera = Math.max(0, Math.min(actual * n, fichas.length - n));
        lista.style.transform = `translateX(${-primera * (ancho + margen)}px)`;
        // Si hay menos fotos que lugares, el tema las dejaba pegadas a la izquierda.
        lista.style.justifyContent = fichas.length < n ? 'center' : '';
        flechas.hidden = paginas() < 2;
        puntos.hidden = paginas() < 2;
        if (puntos.children.length !== paginas()) {
            puntos.innerHTML = Array.from({ length: paginas() }, (_, i) => `<li><a href="#" aria-label="Ir a la foto ${i + 1}">${i + 1}</a></li>`).join('');
        }
        $$('a', puntos).forEach((a, i) => a.classList.toggle('flex-active', i === actual));
        // Las fichas fuera de vista quedan ocultas también para el teclado, no solo para lectores de pantalla.
        fichas.forEach((li, i) => { const fuera = i < primera || i >= primera + n; li.setAttribute('aria-hidden', String(fuera)); li.inert = fuera; });
        videos();
    }
    // El carrusel mueve las fichas sin que el navegador avise que entraron a la vista: él mismo arranca los videos que muestra.
    let aLaVista = false;
    const videos = () => fichas.forEach((li) => $$('video[data-autoplay]', li).forEach((v) => {
        if (v.dataset.autoplay === 'escritorio' && !escritorio()) return;
        if (aLaVista && li.getAttribute('aria-hidden') === 'false') v.play().catch(() => { v.controls = true; });
        else v.pause();
    }));
    new IntersectionObserver(([e]) => { aLaVista = e.isIntersecting; videos(); }, { rootMargin: '200px' }).observe(caja);
    const ir = (i) => { actual = (i + paginas()) % paginas(); pinta(); };
    flechas.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        e.preventDefault();
        ir(actual + (a.classList.contains('flex-next') ? 1 : -1));
    });
    puntos.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        e.preventDefault();
        ir([...puntos.querySelectorAll('a')].indexOf(a));
    });
    let tiempo;
    const avanzar = () => {
        clearInterval(tiempo);
        if (!sinMovimiento) tiempo = setInterval(() => ir(actual + 1), parseInt(o.slideshowSpeed, 10) || 7000);
    };
    caja.addEventListener('mouseenter', () => clearInterval(tiempo));
    caja.addEventListener('mouseleave', avanzar);
    caja.addEventListener('focusin', () => clearInterval(tiempo));
    window.addEventListener('resize', pinta);
    pinta();
    avanzar();
}
const carruseles = $$('.con-carrusel .flexslider');
const vigia = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    vigia.unobserve(e.target);
    armarCarrusel(e.target);
}), { rootMargin: '600px 0px' });
// Los que ya están en pantalla se arman de inmediato, para que no cambien después de pintarse.
const cercaDeLaVista = carruseles.filter((caja) => caja.getBoundingClientRect().top < window.innerHeight + 600);
carruseles.forEach((caja) => (cercaDeLaVista.includes(caja) ? armarCarrusel(caja) : vigia.observe(caja)));

/* Visor de fotos para los enlaces .lightbox */
const fotos = $$('a.lightbox').filter((a) => /\.(webp|jpe?g|png|gif)(\?|$)/i.test(a.getAttribute('href') || ''));
if (fotos.length) {
    const visor = document.createElement('dialog');
    visor.className = 'visor';
    visor.setAttribute('aria-label', 'Foto ampliada');
    visor.innerHTML = '<button type="button" class="visor__cerrar">Cerrar</button><button type="button" class="visor__ant" aria-label="Foto anterior">‹</button><button type="button" class="visor__sig" aria-label="Foto siguiente">›</button><img alt="">';
    document.body.appendChild(visor);
    const grande = $('img', visor);
    let i = 0;
    const mostrar = (n) => {
        i = (n + fotos.length) % fotos.length;
        grande.src = fotos[i].href;
        grande.alt = $('img', fotos[i])?.alt || '';
    };
    fotos.forEach((a, n) => a.addEventListener('click', (e) => { e.preventDefault(); mostrar(n); visor.showModal(); }));
    $('.visor__cerrar', visor).addEventListener('click', () => visor.close());
    $('.visor__ant', visor).addEventListener('click', () => mostrar(i - 1));
    $('.visor__sig', visor).addEventListener('click', () => mostrar(i + 1));
    visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
    visor.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') mostrar(i - 1);
        if (e.key === 'ArrowRight') mostrar(i + 1);
    });
}

/* Correos armados en el navegador, para que no queden en el código de la página */
$$('a.protected-email[data-u][data-d]').forEach((a) => {
    const correo = `${a.dataset.u}@${a.dataset.d}`;
    a.href = `mailto:${correo}`;
    a.textContent = correo;
});

/* Filtros del portafolio */
const filtros = $$('[data-filtro]');
filtros.forEach((b) => b.addEventListener('click', () => {
    filtros.forEach((x) => x.classList.toggle('active', x === b));
    $$('.portfolio-item').forEach((item) => {
        item.hidden = b.dataset.filtro !== 'all' && !item.classList.contains(`cat-${b.dataset.filtro}`);
    });
}));

/* Lo que se carga al estar a la vista: mapa y videos */
const alVer = (el, si, no) => new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? si(e) : no?.(e))), { rootMargin: '200px' }).observe(el);
$$('.mapa-diferido').forEach((caja) => alVer(caja, () => {
    if (caja.querySelector('iframe')) return;
    caja.innerHTML = `<iframe src="${caja.dataset.src}" width="100%" height="450" title="Ubicación de MYMCE en el mapa" loading="lazy" allowfullscreen></iframe>`;
}));
$$('video[data-autoplay]').forEach((v) => {
    // En celular estos videos no arrancan solos: con controles se pueden reproducir en vez de quedar como foto fija.
    if (v.dataset.autoplay === 'escritorio' && !escritorio()) { v.controls = true; return; }
    v.muted = true;
    v.playsInline = true;
    // Son clips cortos sin sonido: arrancan aunque el equipo pida menos animación, pero con controles para pausarlos.
    if (sinMovimiento) v.controls = true;
    // Los videos de un carrusel los arranca el propio carrusel al armarse.
    if (v.closest('.con-carrusel .flexslider')) return;
    alVer(v, () => v.play().catch(() => { v.controls = true; }), () => v.pause());
});

/* Barras de progreso y contadores: muestran su valor final */
$$('[data-progress]').forEach((el) => { el.style.width = el.dataset.progress + '%'; });
$$('.counter[data-to]').forEach((el) => { el.textContent = el.dataset.to; });

/* WhatsApp y teléfono cuentan como contacto; el correo solo entra al conteo propio */
document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="https://wa.me/"], a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    const tipo = a.href.startsWith('tel:') ? 'telefono' : a.href.startsWith('mailto:') ? 'correo' : 'whatsapp';
    contar(tipo);
    if (tipo === 'correo') return;
    conversion(document.body.dataset.lead);
    if (a.dataset.whatsapp && typeof window.gtag === 'function') {
        window.gtag('event', 'whatsapp_click', { event_category: 'contact', event_label: a.dataset.whatsapp });
    }
});

/* Formularios */
const CAMPOS = {
    name: /^(nombre|name)\b/i,
    apellido: /^apellido/i,
    email: /^(correo|email)/i,
    phone: /^(tel[eé]fono|phone)/i,
    message: /^(mensaje|message)\b/i,
};
$$('form[data-formulario]').forEach((form) => {
    const exito = $('.success-box', form);
    const fallo = $('.error-box', form);
    const cargando = $('.cf-loader', form);
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enviar = $('button[type="submit"]', form);
        [exito, fallo].forEach((x) => x?.classList.remove('show'));
        cargando?.classList.add('show');
        if (enviar) enviar.disabled = true;
        const datos = { name: '', email: '', phone: '', message: '', otherDetails: {} };
        let apellido = '';
        for (const [clave, valor] of new FormData(form)) {
            if (clave === '_subject' || typeof valor !== 'string') continue;
            const limpia = clave.replace(/\s*\*\s*$/, '').trim();
            const tipo = Object.keys(CAMPOS).find((k) => CAMPOS[k].test(limpia));
            if (tipo === 'apellido') apellido = valor;
            else if (tipo && !datos[tipo]) datos[tipo] = valor;
            else datos.otherDetails[limpia] = valor;
        }
        datos.name = [datos.name, apellido].filter(Boolean).join(' ');
        datos.otherDetails['Página'] = location.pathname;
        try {
            const r = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
            if (!r.ok) throw new Error(String(r.status));
            conversion(document.body.dataset.conversion);
            contar('formulario');
            form.reset();
            exito?.classList.add('show');
        } catch {
            fallo?.classList.add('show');
        } finally {
            cargando?.classList.remove('show');
            if (enviar) enviar.disabled = false;
        }
    });
});
