const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ROOT_DIR = __dirname;
const BUNDLE_CSS_PATH = '/assets/css/all.min.css';

function applyHtmlFixes() {
    console.log("Applying HTML Fixes v2...");
    const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', '_dist/**'] });

    files.forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        let html = fs.readFileSync(filePath, 'utf8');
        let originalHtml = html;

        // DEFER GTM (Improved Regex)
        // Match the GTM function body regardless of script tags
        if (html.includes('googletagmanager.com/gtm.js') && !html.includes('initGTM') && !html.includes('setTimeout')) {
            const gtmBodyRegex = /(\(function\s*\(w,\s*d,\s*s,\s*l,\s*i\)[\s\S]*?\(window,\s*document,\s*['"]script['"],\s*['"]dataLayer['"],\s*['"]GTM-[^'"]+['"]\);)/;
            const m = html.match(gtmBodyRegex);
            if (m) {
                console.log(`Deferring GTM in ${file}`);
                const originalFn = m[1];
                const deferredFn = `
                 /* Defer GTM */
                 window.addEventListener('load', function() {
                    setTimeout(function() {
                        ${originalFn}
                    }, 3500); 
                 });`;
                html = html.replace(originalFn, deferredFn);
            }
        }

        // LAZY MAP (Improved Check)
        // Look for google maps iframe that hasn't been lazified yet
        if (html.includes('<iframe') && html.includes('maps.google') && !html.includes('map-lazy-wrapper')) {
            console.log(`Lazifying Map in ${file}`);
            const iframeRegex = /<iframe[^>]*src=["']([^"']*maps\.google[^"']*)["'][^>]*>[\s\S]*?<\/iframe>/i;
            const match = html.match(iframeRegex);
            if (match) {
                const src = match[1];
                const placeholder = `
                <div class="map-lazy-wrapper" data-src="${src}" style="width:100%;height:450px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;">
                    <p style="color:#666">Cargando Mapa...</p>
                </div>
                <script>
                document.addEventListener("DOMContentLoaded",()=>{
                    var mapWrap=document.querySelector('.map-lazy-wrapper');
                    if(mapWrap){
                        var obs=new IntersectionObserver(function(es){
                            es.forEach(function(e){
                                if(e.isIntersecting){
                                    mapWrap.innerHTML = '<iframe src="'+mapWrap.getAttribute('data-src')+'" width="100%" height="450" frameborder="0" style="border:0;" allowfullscreen="" loading="lazy"></iframe>';
                                    obs.disconnect();
                                }
                            });
                        });
                        obs.observe(mapWrap);
                    }
                });
                </script>`;
                html = html.replace(match[0], placeholder);
            }
        }

        if (html !== originalHtml) {
            fs.writeFileSync(filePath, html);
        }
    });
}

applyHtmlFixes();
console.log("Fixes v2 applied.");
