const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const lunr = require('lunr');

const SITE_ROOT = '.';
const OUTPUT_FILE = 'assets/js/search-index.json';

async function buildIndex() {
    console.log('Building Search Index...');

    // Ensure assets/js exists
    await fs.ensureDir(path.dirname(OUTPUT_FILE));

    const files = glob.sync('**/*.html', { cwd: SITE_ROOT, ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip'] });
    console.log(`Scanning ${files.length} files...`);

    const documents = [];

    for (const file of files) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);

        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        // Get main content, stripping scripts/styles
        $('script').remove();
        $('style').remove();
        const body = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 1000); // Limit body size for index

        // Determine URL (relative to root)
        // If file is 'portfolio/project/index.html', url is '/portfolio/project/'
        let url = '/' + file.replace(/\\/g, '/');
        if (url.endsWith('index.html')) {
            url = url.replace('index.html', '');
        }

        documents.push({
            id: url,
            title: title,
            description: description,
            body: body
        });
    }

    // Create Lunr Index (optional: we can just save the JSON and build index on client, 
    // OR pre-build. Pre-building is harder to load on client without the same lunr version.
    // The plan says "Generate optimized assets/js/search-index.json".
    // Usually, we send the raw JSON documents to the client and let the client build the index 
    // (for small sites < 1000 pages) OR we send a serialized index.
    // Given 140 pages, client-side build is fast enough and easier to debug.
    // So we will save the DOCUMENTS.

    await fs.writeJson(OUTPUT_FILE, documents);
    console.log(`Index built with ${documents.length} documents.`);
}

buildIndex().catch(console.error);
