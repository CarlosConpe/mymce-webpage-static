const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const BASE_DIR = path.resolve(__dirname, '../');

console.log(`Scanning for broken links in: ${BASE_DIR}`);

const htmlFiles = glob.sync(`${BASE_DIR}/**/*.html`, {
    ignore: [`${BASE_DIR}/node_modules/**`, `${BASE_DIR}/.git/**`]
});

let errorCount = 0;
let checkedLinks = 0;

htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf-8');
    const $ = cheerio.load(html);
    const fileDir = path.dirname(file);

    // Helper to check path
    const checkPath = (linkType, linkUrl, element) => {
        if (!linkUrl) return;

        // Ignore special links
        if (linkUrl.startsWith('http') ||
            linkUrl.startsWith('//') ||
            linkUrl.startsWith('mailto:') ||
            linkUrl.startsWith('tel:') ||
            linkUrl.startsWith('#') ||
            linkUrl.startsWith('/cdn-cgi/') ||
            linkUrl.startsWith('javascript:')) {
            return;
        }

        checkedLinks++;

        // Remove query params and hashes
        let cleanUrl = linkUrl.split('?')[0].split('#')[0];

        let targetPath;
        if (cleanUrl.startsWith('/')) {
            // Absolute from root
            targetPath = path.join(BASE_DIR, cleanUrl);
        } else {
            // Relative
            targetPath = path.join(fileDir, cleanUrl);
        }

        // Handle directory links (e.g. /contact -> /contact/index.html or /contact directory)
        // If it looks like a directory, check for directory existence OR directory/index.html
        let exists = fs.existsSync(targetPath);

        // If it doesn't exist optionally check if it's a directory reference without trailing slash that needs resolution
        // or if it's a directory, check for index.html inside it
        if (exists && fs.statSync(targetPath).isDirectory()) {
            // If it's a directory, technically the link works if the server serves index.html
            // But let's check if index.html exists explicitly to be sure
            if (!fs.existsSync(path.join(targetPath, 'index.html'))) {
                // Directory exists but no index.html? might be an issue depending on server config, but usually 403.
                // We'll flag it if it's not a generic asset folder.
                // But for navigation links, it should have index.html
            }
        }
        else if (!exists) {
            // Maybe it was a link to a directory without trailing slash? e.g. "corporate/contact"
            // We already constructed targetPath. Check if it exists as a directory? 
            // We checked fs.existsSync above.

            // Try appending /index.html just in case the link was to a file that is actually a folder? 
            // No, targetPath is what we looked for.

            // Special case: sometimes links are /foo/bar and the file is /foo/bar.html? 
            // Or /foo/bar/index.html.

            const asFileHtml = targetPath + '.html';
            const asDirIndex = path.join(targetPath, 'index.html');

            if (fs.existsSync(asFileHtml)) {
                // Determine if this is "broken" or just "ugly". For now valid.
                exists = true;
            } else if (fs.existsSync(asDirIndex)) {
                exists = true;
            }
        }

        if (!exists) {
            console.error(`[BROKEN] ${path.relative(BASE_DIR, file)} -> ${linkUrl}`);
            errorCount++;
        }
    };

    $('a').each((i, el) => checkPath('href', $(el).attr('href'), el));
    $('img').each((i, el) => checkPath('src', $(el).attr('src'), el));
    $('link').each((i, el) => checkPath('href', $(el).attr('href'), el));
    $('script').each((i, el) => checkPath('src', $(el).attr('src'), el));
});

console.log(`\nVerification Complete.`);
console.log(`Checked ${checkedLinks} links.`);
console.log(`Found ${errorCount} broken links.`);

if (errorCount > 0) {
    process.exit(1);
}
