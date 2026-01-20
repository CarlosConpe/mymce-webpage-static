const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SITE_URL = 'https://www.grupomymce.com';
const ROOT_DIR = path.join(__dirname, '..');

// Logic derived from existing sitemap.xml
// Home: 1.0
// Main Sections (/portafolio/, /servicios/, /equipamiento/): 0.80
// Others: 0.64
function getPriority(urlPath) {
    if (urlPath === '/') return '1.00';
    if (urlPath === '/portafolio/' || urlPath === '/servicios/' || urlPath === '/equipamiento/') return '0.80';
    return '0.64';
}

function generateSitemap() {
    const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', 'scripts/**', 'functions/**'] });
    files.sort(); // Consistent order

    function createSitemap(baseUrl, filename) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

        files.forEach(file => {
            // Construct URL path
            let urlPath = '/' + file.replace(/\\/g, '/');

            // Remove index.html for clean URLs
            if (urlPath.endsWith('index.html')) {
                urlPath = urlPath.substring(0, urlPath.length - 'index.html'.length);
            }

            // Skip 404 pages or raw assets if accidentally included (though glob limits to html)
            if (urlPath.includes('404')) return;

            const fullPath = path.join(ROOT_DIR, file);
            const stats = fs.statSync(fullPath);
            const lastMod = stats.mtime.toISOString().split('T')[0]; // YYYY-MM-DD
            const priority = getPriority(urlPath);

            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${urlPath}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <priority>${priority}</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        const outputPath = path.join(ROOT_DIR, filename);
        fs.writeFileSync(outputPath, xml, 'utf8');
        console.log(`Sitemap generated for ${baseUrl} at ${outputPath}`);
    }

    createSitemap('https://www.grupomymce.com', 'sitemap.xml');
    createSitemap('https://www.mymce.com.mx', 'sitemap_mx.xml');
}

generateSitemap();
