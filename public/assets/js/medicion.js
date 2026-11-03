// Google Ads y Google Tag Manager, en archivo aparte para no usar código en línea.
window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
window.gtag = gtag;
gtag('js', new Date());
gtag('config', 'AW-11313299378');
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
for (const src of ['https://www.googletagmanager.com/gtag/js?id=AW-11313299378', 'https://www.googletagmanager.com/gtm.js?id=GTM-KMF8C68D']) {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
}
