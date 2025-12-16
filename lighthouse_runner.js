const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ROOT_DIR = __dirname; // Root

// --- CONFIGURATION ---
const BUNDLE_CSS_PATH = '/assets/css/all.min.css';
const BUNDLE_CSS_FILE = path.join(ROOT_DIR, 'assets', 'css', 'all.min.css');
const VIDEO_PATH = path.join(ROOT_DIR, 'assets', 'storage', '2016', '12', 'VideoMymce1.mp4');

// CSS files to bundle
const CSS_TO_BUNDLE = [
    'assets/core/modules/d9a1c27cc2/scripts/bootstrap/css/bootstrap.css',
    'assets/core/modules/d9a1c27cc2/scripts/font-awesome/css/font-awesome.min.css',
    'assets/core/modules/d9a1c27cc2/style.css',
    'assets/core/modules/d9a1c27cc2/css/components.css',
    'assets/core/modules/d9a1c27cc2/css/content-box.css',
    'assets/core/modules/d9a1c27cc2/css/image-box.css',
    'assets/core/modules/d9a1c27cc2/css/animations.css',
    'assets/core/modules/d9a1c27cc2/scripts/magnific-popup.css',
    'assets/core/modules/d9a1c27cc2/scripts/php/contact-form.css',
    'assets/core/views/c0597ef72a/skin.css',
    'assets/css/custom-styles.min.css'
];

console.log("Starting Lighthouse Optimizations...");

// 1. VIDEO COMPRESSION (Attempt)
async function compressVideo() {
    console.log("Attempting Video Compression...");
    if (!fs.existsSync(VIDEO_PATH)) {
        console.log("Video file not found.");
        return;
    }

    try {
        const ffmpeg = require('fluent-ffmpeg');
        // If the user installed 'ffmpeg' package, sometimes it exposes a binary path or we need 'ffmpeg-static'
        // Let's assume they might have installed ffmpeg-static or have it in path.
        // We will try to run it.

        // Check for ffmpeg path in node_modules?
        // simple test

        const tempOut = VIDEO_PATH.replace('.mp4', '_optimized.mp4');

        await new Promise((resolve, reject) => {
            ffmpeg(VIDEO_PATH)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-crf 28', // Good validation
                    '-preset fast',
                    '-movflags +faststart'
                ])
                .on('end', () => {
                    console.log('Video compression finished.');
                    // Replace original
                    fs.unlinkSync(VIDEO_PATH);
                    fs.renameSync(tempOut, VIDEO_PATH);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Video compression failed (ffmpeg error):', err.message);
                    resolve(); // Continue anyway
                })
                .save(tempOut);
        });

    } catch (e) {
        console.log("Video compression skipped: 'fluent-ffmpeg' not found or failed setup. (" + e.message + ")");
    }
}


// 2. CSS BUNDLE
function bundleCss() {
    console.log("Bundling CSS...");
    let bundleContent = '';
    CSS_TO_BUNDLE.forEach(relPath => {
        const fullPath = path.join(ROOT_DIR, relPath);
        if (fs.existsSync(fullPath)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
            bundleContent += content + '\n';
        } else {
            console.warn(`Missing CSS file: ${relPath}`);
        }
    });
    fs.writeFileSync(BUNDLE_CSS_FILE, bundleContent);
    console.log(`Bundle created.`);
}

// 3. APPLY HTML FIXES
function applyHtmlFixes() {
    console.log("Applying HTML Fixes...");
    const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', '_dist/**'] });

    files.forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        let html = fs.readFileSync(filePath, 'utf8');
        let originalHtml = html;

        // CSS BUNDLE REPLACEMENT
        if (html.includes('bootstrap.css') || html.includes('style.css')) {
            const bundleTag = `<link rel="stylesheet" href="${BUNDLE_CSS_PATH}">`;
            CSS_TO_BUNDLE.forEach(css => {
                const basename = path.basename(css);
                const regex = new RegExp(`<link[^>]*href=["'][^"']*${basename.replace('.', '\\.')}[^"']*["'][^>]*>`, 'g');
                html = html.replace(regex, '');
            });
            if (!html.includes(BUNDLE_CSS_PATH)) {
                // Try to insert after title or meta
                if (html.includes('</title>')) {
                    html = html.replace('</title>', `</title>\n${bundleTag}`);
                } else {
                    html = html.replace('</head>', `${bundleTag}\n</head>`);
                }
            }
        }

        // LAZY MAP
        if (html.includes('<iframe') && html.includes('maps.google')) {
            console.log(`Lazy Map: ${file}`);
            const iframeRegex = /<iframe[^>]*src=["']([^"']*maps\.google[^"']*)["'][^>]*>[\s\S]*?<\/iframe>/i;
            const match = html.match(iframeRegex);
            if (match) {
                const src = match[1];
                const placeholder = `
                <div class="map-lazy-wrapper" data-src="${src}" style="width:100%;height:450px;background:#eee;display:flex;align-items:center;justify-content:center;">Loading Map...</div>
                <script>
                document.addEventListener("DOMContentLoaded",()=>{
                    const wrapper = document.querySelector('.map-lazy-wrapper');
                    if(wrapper){
                        const obs = new IntersectionObserver(es=>{
                            es.forEach(e=>{
                                if(e.isIntersecting){
                                    wrapper.innerHTML = '<iframe src="'+wrapper.dataset.src+'" width="100%" height="450" frameborder="0" style="border:0;" allowfullscreen loading="lazy"></iframe>';
                                    obs.disconnect();
                                }
                            });
                        });
                        obs.observe(wrapper);
                    }
                });
                </script>`;
                html = html.replace(match[0], placeholder);
            }
        }

        // DEFER GTM
        // Only if not already deferred
        if (html.includes('googletagmanager.com/gtm.js') && !html.includes('initGTM')) {
            console.log(`Defer GTM: ${file}`);
            // Matches standard GTM snippet
            const gtmRegex = /<script>\(function\(w,d,s,l,i\)[\s\S]*?\(window,document,'script','dataLayer','GTM-[^']+'\);<\/script>/;
            const m = html.match(gtmRegex);
            if (m) {
                const inner = m[0].replace('<script>', '').replace('</script>', '');
                const newScript = `<script>
                 function initGTM(){ ${inner} }
                 window.addEventListener('load', () => setTimeout(initGTM, 3500));
                 </script>`;
                html = html.replace(m[0], newScript);
            }
        }

        if (html !== originalHtml) {
            fs.writeFileSync(filePath, html);
        }
    });
}

// MAIN
(async () => {
    bundleCss();
    applyHtmlFixes();
    await compressVideo();
    console.log("DONE");
})();
