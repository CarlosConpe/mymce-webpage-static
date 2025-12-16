const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname).replace(/\\/g, '/');
const CSS_OUT = path.join(ROOT_DIR, 'assets/css/custom-styles.css');
const JS_OUT = path.join(ROOT_DIR, 'assets/js/custom-scripts.js');

// Ensure output dirs exist
fs.ensureDirSync(path.dirname(CSS_OUT));
fs.ensureDirSync(path.dirname(JS_OUT));

// Store unique inline content
const styleMap = new Map(); // Hash -> Content
const scriptMap = new Map(); // Hash -> Content

async function centralize() {
    console.log('🚀 Starting Centralization...');

    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`, `${ROOT_DIR}/.gemini/**`]
    });

    const addContent = (map, content) => {
        const trimmed = content.trim();
        if (!trimmed) return null;
        const hash = crypto.createHash('md5').update(trimmed).digest('hex');
        if (!map.has(hash)) {
            map.set(hash, trimmed);
        }
    };

    let processedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        // 1. Process Inline Styles
        $('style').each((i, el) => {
            const styleContent = $(el).html();
            const id = $(el).attr('id') || '';

            // Skip Critical / Google
            if (styleContent && !id.includes('google')) {
                addContent(styleMap, styleContent);
                $(el).remove();
                modified = true;
            }
        });

        // 2. Process Inline Scripts
        $('script:not([src])').each((i, el) => {
            const scriptContent = $(el).html();
            const type = $(el).attr('type');

            // SKIP JSON-LD and Speculation Rules
            if (type === 'application/ld+json' || type === 'speculationrules') return;

            // SKIP Google Tag Manager / Analytics / Ads (Keep inline)
            if (scriptContent.includes('googletagmanager') || scriptContent.includes('gtag') || scriptContent.includes('dataLayer')) return;

            // SKIP variable definitions (phpVars etc)
            if (scriptContent.includes('var phpVars') || scriptContent.includes('var FB3D_CLIENT_LOCALE') || scriptContent.includes('var SF_LDATA')) return;

            if (scriptContent) {
                addContent(scriptMap, scriptContent);
                $(el).remove();
                modified = true;
            }
        });

        if (modified) {
            // Add references
            if ($('link[href="/assets/css/custom-styles.css"]').length === 0) {
                $('head').append('<link rel="stylesheet" href="/assets/css/custom-styles.css">');
            }
            if ($('script[src="/assets/js/custom-scripts.js"]').length === 0) {
                // Determine relative path back to root if needed, but we use absolute /assets...
                // Ideally this works for server root. 
                $('body').append('<script src="/assets/js/custom-scripts.js" defer></script>');
            }

            fs.writeFileSync(file, $.html());
            processedCount++;
        }
    }

    // Write Central Files
    let cssContent = "/* Centralized Styles */\n\n";
    styleMap.forEach((val) => cssContent += `${val}\n\n`);
    fs.writeFileSync(CSS_OUT, cssContent);

    let jsContent = "// Centralized Scripts\n\ndocument.addEventListener('DOMContentLoaded', function() {\n";
    scriptMap.forEach((val) => jsContent += `${val}\n\n`);
    jsContent += "});";
    fs.writeFileSync(JS_OUT, jsContent);

    console.log(`✅ Centralized styles/scripts in ${processedCount} files.`);
    console.log(`css written to ${CSS_OUT}`);
    console.log(`js written to ${JS_OUT}`);
}

centralize().catch(console.error);
