const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';

async function injectSearch() {
    console.log('Injecting search scripts...');
    const files = glob.sync('**/*.html', { cwd: SITE_ROOT, ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip'] });

    for (const file of files) {
        const filePath = path.join(SITE_ROOT, file);
        let content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);

        // Check if already injected
        if ($('script[src*="search-ui.js"]').length > 0) continue;

        // Inject Lunr and Search UI at the end of body
        // We use absolute paths assuming site root is /
        $('body').append('<script src="/assets/js/lunr.min.js"></script>');
        $('body').append('<script src="/assets/js/search-ui.js"></script>');

        await fs.writeFile(filePath, $.html());
    }
    console.log(`Injected search into ${files.length} files.`);
}

injectSearch().catch(console.error);
