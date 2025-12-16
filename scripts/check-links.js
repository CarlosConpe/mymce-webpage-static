const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';

async function checkLinks() {
    console.log('Starting Link Checker...');

    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', '_dist/**', '.gemini/**']
    });

    let errorCount = 0;
    let checkedCount = 0;

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        const dirName = path.dirname(filePath);

        $('a, link, script, img').each((i, el) => {
            let src = $(el).attr('href') || $(el).attr('src');

            if (!src) return;

            // Ignore external links, anchors, mailto, tel
            if (src.startsWith('http') || src.startsWith('//') || src.startsWith('#') || src.startsWith('mailto:') || src.startsWith('tel:')) {
                return;
            }

            // Ignore data URIs
            if (src.startsWith('data:')) return;

            // Normalize path
            let targetPath;
            if (src.startsWith('/')) {
                // Absolute path relative to site root
                targetPath = path.join(SITE_ROOT, src);
            } else {
                // Relative path
                targetPath = path.join(dirName, src);
            }

            // Remove query strings and hashes
            targetPath = targetPath.split('?')[0].split('#')[0];

            // Check if file exists
            if (!fs.existsSync(targetPath)) {
                // Try checking if it's a directory with index.html
                if (fs.existsSync(path.join(targetPath, 'index.html'))) {
                    return;
                }

                console.error(`[BROKEN LINK] In ${file}: ${src} -> ${targetPath} not found`);
                errorCount++;
            }
            checkedCount++;
        });
    }

    console.log(`Link check complete. Checked ${checkedCount} links. Found ${errorCount} errors.`);
}

checkLinks().catch(console.error);
