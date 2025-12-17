const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.grupomymce.com';
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'sitemap.xml');

// Directories to scan
const ROUTES = [
    '', // Root for index.html
    'corporate',
    'soluciones',
    'servicios-carpinteria',
    'portafolio'
];

let urls = [];

console.log('Generating Sitemap...');

ROUTES.forEach(route => {
    const dirPath = path.join(ROOT_DIR, route);
    if (!fs.existsSync(dirPath)) return;

    if (route === '') {
        // Root index
        urls.push({ loc: BASE_URL, priority: '1.0' });
    } else {
        scanDirectory(dirPath, route);
    }
});

function scanDirectory(directory, baseRoute) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Recursive scan for subdirectories
            scanDirectory(fullPath, `${baseRoute}/${file}`);
        } else if (file === 'index.html') {
            // It's a page!
            let urlPath = `${BASE_URL}/${baseRoute}`;
            // If it's a subdirectory index, usually we want the folder URL, not /index.html
            // e.g. /corporate/contact/index.html -> /corporate/contact/

            // Normalize path separators for Windows
            urlPath = urlPath.replace(/\\/g, '/');

            // Ensure trailing slash for directories (standard for clean URLs)
            if (!urlPath.endsWith('/')) urlPath += '/';

            // Calculate Priority
            let priority = '0.8';
            if (baseRoute.includes('portafolio')) priority = '0.6';
            if (baseRoute.includes('blog')) priority = '0.6';

            urls.push({
                loc: urlPath,
                lastmod: new Date().toISOString(),
                priority: priority
            });
        }
    });
}

// Generate XML
const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
const xmlFooter = `</urlset>`;

const urlNodes = urls.map(u => {
    return `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
}).join('\n');

const sitemapContent = `${xmlHeader}\n${urlNodes}\n${xmlFooter}`;

fs.writeFileSync(OUTPUT_FILE, sitemapContent);
console.log(`Generated sitemap.xml with ${urls.length} URLs to ${OUTPUT_FILE}`);
