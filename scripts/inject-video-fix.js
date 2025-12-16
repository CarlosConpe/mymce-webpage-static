
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';
const CSS_PATH = '/assets/custom-video-fix.css';

async function injectVideoFix() {
    console.log('Starting Video Fix Injection...');

    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', 'optimized_site.zip']
    });

    let modifiedCount = 0;

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);

        // Check for FlexSlider with Video
        if ($('.flexslider video').length > 0) {
            // Check if CSS is already linked
            const existingLink = $(`link[href="${CSS_PATH}"]`);
            if (existingLink.length === 0) {
                $('head').append(`\n  <link rel="stylesheet" href="${CSS_PATH}">`);

                await fs.writeFile(filePath, $.html());
                console.log(`Injected CSS fix into: ${file}`);
                modifiedCount++;
            } else {
                console.log(`CSS fix already present in: ${file}`);
            }
        }
    }

    console.log(`Injection complete. Modified ${modifiedCount} files.`);
}

injectVideoFix().catch(console.error);
