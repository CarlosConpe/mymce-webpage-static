const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = __dirname;
const GLOB_PATTERN = '**/*.html';
const IGNORE_PATTERNS = ['node_modules/**', '_dist/**', 'scripts/**', '.gemini/**'];

function fixFooterLogo() {
    console.log("Starting Footer Logo Fix...");

    const files = glob.sync(GLOB_PATTERN, { cwd: ROOT_DIR, ignore: IGNORE_PATTERNS });
    console.log(`Found ${files.length} HTML files.`);

    let fixedCount = 0;

    files.forEach((file) => {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // Target the footer logo
        // Structure: .footer-modern .footer-left img
        // Or simply by src if it's unique enough, but better by context

        $('.footer-modern .footer-left img').each((i, el) => {
            const $img = $(el);

            // We want to constrain width to something reasonable, e.g. 200px (approx 20% of original 935)
            // Original aspect ratio: 935 / 267 ~= 3.5
            // 200px width -> ~57px height

            const currentStyle = $img.attr('style') || '';
            const newStyle = 'max-width: 200px !important; height: auto !important;';

            if (!currentStyle.includes('max-width: 200px')) {
                $img.attr('style', currentStyle + ' ' + newStyle);
                modified = true;
                fixedCount++;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, $.html());
        }
    });

    console.log(`Footer logo fix applied to ${fixedCount} instances.`);
}

fixFooterLogo();
