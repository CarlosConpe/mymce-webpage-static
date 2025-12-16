const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const SITE_ROOT = '.';
const DOMAIN = 'https://www.grupomymce.com';

async function generateSitemap() {
    console.log('Generating Sitemap...');

    const files = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', 'google*.html', '404.html']
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    for (const file of files) {
        let urlPath = file.replace(/\\/g, '/');
        if (urlPath.endsWith('index.html')) {
            urlPath = urlPath.replace('index.html', '');
        }

        // Ensure leading slash
        if (!urlPath.startsWith('/')) {
            urlPath = '/' + urlPath;
        }

        // Remove trailing slash if it's just a file (but keep for directories if desired, though standard is usually no trailing slash for files)
        // Actually, for static sites, /about/index.html usually maps to /about/
        // So if we stripped index.html, we have /about/

        const fullUrl = `${DOMAIN}${urlPath}`;
        const lastMod = new Date().toISOString();

        xml += `  <url>
    <loc>${fullUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    xml += `</urlset>`;

    await fs.writeFile(path.join(SITE_ROOT, 'sitemap.xml'), xml);
    console.log(`Sitemap generated with ${files.length} URLs.`);
}

generateSitemap().catch(console.error);
