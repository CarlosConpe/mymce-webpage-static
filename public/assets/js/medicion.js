// Google Ads y Google Tag Manager, en archivo aparte para no usar código en línea.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'AW-11313299378');
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

// Las librerías de Google pesan casi 500 KB y traban el celular varios segundos.
// Antes se cargaban con el primer desplazamiento y corrían justo mientras la persona bajaba por la
// página, que se sentía trabada. Ahora se cargan al primer clic, tecla o envío de formulario (toda
// conversión pasa por uno de ellos y lo que se registre antes espera en dataLayer), o cuando la
// persona deja de desplazarse un momento, en un hueco libre del navegador.
let cargado = false;
let espera;
function cargar() {
    if (cargado) return;
    cargado = true;
    clearTimeout(espera);
    ['click', 'keydown', 'submit'].forEach((e) => removeEventListener(e, cargar, true));
    ['scroll', 'touchstart'].forEach((e) => removeEventListener(e, programar));
    for (const src of ['https://www.googletagmanager.com/gtag/js?id=AW-11313299378', 'https://www.googletagmanager.com/gtm.js?id=GTM-KMF8C68D']) {
        const s = document.createElement('script');
        s.async = true;
        s.src = src;
        document.head.appendChild(s);
    }
}
function programar() {
    clearTimeout(espera);
    espera = setTimeout(() => (window.requestIdleCallback ? requestIdleCallback(cargar, { timeout: 2000 }) : cargar()), 1500);
}
['click', 'keydown', 'submit'].forEach((e) => addEventListener(e, cargar, { capture: true, once: true }));
['scroll', 'touchstart'].forEach((e) => addEventListener(e, programar, { passive: true }));
