const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

async function optimize() {
    const htmlFiles = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`]
    });

    console.log(`🚀 Optimizing ${htmlFiles.length} pages...`);
    let modifiedCount = 0;

    for (const file of htmlFiles) {
        let content = await fs.readFile(file, 'utf8');
        // Use decodeEntities: false to prevent messing up special chars in scripts/text
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        // 1. LAZY LOADING IMAGES
        let imgCount = 0;
        $('img').each((i, el) => {
            imgCount++;
            const $img = $(el);

            // Heuristic: First 2 images are eager (Logo + Hero).
            if (i < 2) {
                if ($img.attr('loading') === 'lazy') {
                    $img.removeAttr('loading'); // Make eager
                    modified = true;
                }
                // Optional: Hint browser for high priority on the hero (2nd image usually)
                if (i === 1) {
                    $img.removeAttr('loading'); // Ensure eager
                }
            } else {
                // All other images get lazy loading if they don't have it
                if (!$img.attr('loading')) {
                    $img.attr('loading', 'lazy');
                    modified = true;
                }
            }

            // Async decoding is good for all images to prevent main thread blocking
            if (!$img.attr('decoding')) {
                $img.attr('decoding', 'async');
                modified = true;
            }
        });

        // 2. DEFER PLUGINS
        // Defer scripts that are not critical. 
        // We avoid deferring jQuery core if we think it might break inline scripts, 
        // but 'bootstrap', 'datepicker', etc. are usually safe.
        const scriptsToDefer = [
            'bootstrap',
            'datepicker',
            'magnific-popup',
            'contact-form',
            // 'animations', // REMOVED: Breaks visibility of animated elements
            // 'vide',       // REMOVED: Breaks background videos
            'imagesloaded',
            'wow.min.js',
            'search-filter',
            'chosen.jquery'
        ];

        $('script[src]').each((i, el) => {
            const src = $(el).attr('src');
            if (!src) return;

            // 1. ADD DEFER (DISABLED - Causing race conditions with legacy theme)
            /*
            if (scriptsToDefer.some(s => src.toLowerCase().includes(s))) {
                if (!$(el).attr('defer')) {
                    $(el).attr('defer', '');
                    modified = true;
                }
            }
            */

            // 2. REMOVE DEFER from ALL previously deferred scripts to restore functionality
            const riskyScripts = [
                'bootstrap',
                'datepicker',
                'magnific-popup',
                'contact-form',
                'animations',
                'vide',
                'imagesloaded',
                'wow',
                'search-filter',
                'chosen',
                'jquery'
            ];

            if (riskyScripts.some(s => src.toLowerCase().includes(s))) {
                if ($(el).attr('defer')) {
                    $(el).removeAttr('defer');
                    modified = true;
                }
            }
        });

        if (modified) {
            await fs.writeFile(file, $.html());
            modifiedCount++;
        }
    }
    console.log(`✅ Optimized ${modifiedCount} pages.`);
}

optimize().catch(err => console.error(err));
