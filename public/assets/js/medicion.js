// Google Ads y Google Tag Manager, en archivo aparte para no usar código en línea.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'AW-11313299378');
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

// Las librerías de Google pesan casi 500 KB y traban el celular mientras se pinta la página.
// Se cargan con el primer toque, tecla o desplazamiento, o 4 segundos después de cargar.
// Las conversiones que ocurran antes quedan en dataLayer y se envían al llegar la librería.
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
if (document.readyState === 'complete') setTimeout(cargar, 4000);
else addEventListener('load', () => setTimeout(cargar, 4000), { once: true });
