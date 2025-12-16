const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

async function optimizeLCP() {
    console.log('🚀 Starting LCP Optimization (Preload & Priority)...');

    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`]
    });

    let stats = { processed: 0, lcpFixed: 0 };

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        // Strategy: Find the first significant image in the viewport.
        // Usually in <header> or the first <img> in <body> excluding logo if reasonable.
        // In this theme, logos are often small, but big hero images are background via CSS or <img> in sliders.
        // Let's look for the first <img> that is distinctively likely to be a hero or content image.

        let lcpCandidates = $('header img, .section-empty:first-of-type img, .header-title img');
        let lcpImage = null;

        // Filter out logos if possible (usually small or named logo)
        lcpCandidates.each((i, el) => {
            const src = $(el).attr('src') || '';
            const isLogo = src.toLowerCase().includes('logo');
            if (!isLogo && !lcpImage) {
                lcpImage = $(el);
            }
        });

        // Fallback: Just take the first image that isn't a logo
        if (!lcpImage) {
            $('img').each((i, el) => {
                const src = $(el).attr('src') || '';
                if (!src.toLowerCase().includes('logo')) {
                    lcpImage = $(el);
                    return false; // break
                }
            });
        }

        if (lcpImage) {
            const src = lcpImage.attr('src');
            if (src && !src.startsWith('data:')) { // Ignore base64
                // 1. Remove lazy loading
                if (lcpImage.attr('loading') === 'lazy') {
                    lcpImage.removeAttr('loading');
                    modified = true;
                }

                // 2. Add fetchpriority
                if (lcpImage.attr('fetchpriority') !== 'high') {
                    lcpImage.attr('fetchpriority', 'high');
                    modified = true;
                }

                // 3. Add Preload Link
                const linkExists = $(`link[rel="preload"][href="${src}"]`).length > 0;
                if (!linkExists) {
                    $('head').append(`<link rel="preload" as="image" href="${src}">`);
                    modified = true;
                    stats.lcpFixed++;
                }
            }
        }

        if (modified) {
            fs.writeFileSync(file, $.html());
            stats.processed++;
        }
    }

    console.log(`✅ LCP Optimization Complete. Optimized ${stats.processed} files.`);
}

optimizeLCP().catch(console.error);
