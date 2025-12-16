const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = __dirname;
const GLOB_PATTERN = '**/*.html'; // Scan all HTML files
const IGNORE_PATTERNS = ['node_modules/**', '_dist/**', 'scripts/**', '.gemini/**'];

function fixLogoDistortion() {
    console.log("Starting Logo Distortion Fix (HTML Level)...");

    // Find all HTML files
    const files = glob.sync(GLOB_PATTERN, { cwd: ROOT_DIR, ignore: IGNORE_PATTERNS });
    console.log(`Found ${files.length} HTML files.`);

    let fixedCount = 0;

    files.forEach((file) => {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // Target the logo images specifically.
        // We look for .navbar-brand images, including .logo-default and .logo-retina

        $('a.navbar-brand img').each((i, el) => {
            const $img = $(el);

            // Existing style
            const currentStyle = $img.attr('style') || '';
            const newProperties = 'height: auto !important; width: auto !important; max-width: 100%;';

            // We append our important styles. 
            // We only append if not already there to avoid duplicates in repeated runs
            if (!currentStyle.includes('height: auto !important')) {
                $img.attr('style', newProperties + ' ' + currentStyle);
                modified = true;
                fixedCount++;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, $.html());
        }
    });

    console.log(`Logo fix applied to ${fixedCount} logo instances.`);
}

fixLogoDistortion();
