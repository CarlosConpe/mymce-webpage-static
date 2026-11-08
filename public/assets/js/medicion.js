// Google Ads y Google Tag Manager, en archivo aparte para no usar código en línea.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'AW-11313299378');
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

// Las librerías de Google pesan casi 500 KB y traban el celular varios segundos.
// Se cargan con el primer toque, tecla o desplazamiento: toda conversión (formulario o
// WhatsApp) pasa por uno de ellos, y lo que se registre antes espera en dataLayer.
let cargado = false;
const eventos = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
function cargar() {
    if (cargado) return;
    cargado = true;
    eventos.forEach((e) => removeEventListener(e, cargar));
    for (const src of ['https://www.googletagmanager.com/gtag/js?id=AW-11313299378', 'https://www.googletagmanager.com/gtm.js?id=GTM-KMF8C68D']) {
        const s = document.createElement('script');
        s.async = true;
        s.src = src;
        document.head.appendChild(s);
    }
}
eventos.forEach((e) => addEventListener(e, cargar, { once: true, passive: true }));
