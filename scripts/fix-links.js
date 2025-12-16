const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const SITE_ROOT = '.';
const ASSETS_DIR = 'assets';
const BLOG_DIR = 'blog';
const PORTFOLIO_DIR = 'portfolio';
const SERVICES_DIR = 'services';

async function fixLinks() {
    console.log('Starting Link Fixer...');

    const fileMap = {};

    // 1. Reconstruct Map from Destinations
    // Portfolio
    if (fs.existsSync(PORTFOLIO_DIR)) {
        const items = fs.readdirSync(PORTFOLIO_DIR);
        for (const item of items) {
            fileMap[item] = `portfolio/${item}`;
        }
    }
    // Services
    if (fs.existsSync(SERVICES_DIR)) {
        const items = fs.readdirSync(SERVICES_DIR);
        for (const item of items) {
            fileMap[item] = `services/${item}`;
        }
    }
    // Blog (Recursive? No, usually year folders. But the links might be /2023/...)
    // The blog structure was moved as '2023' -> 'blog/2023'.
    // So links to /2023/... need to be /blog/2023/...
    fileMap['2023'] = 'blog/2023';

    // Assets
    fileMap['wp-content'] = 'assets/wp-content';
    fileMap['core'] = 'assets/core';
    fileMap['lib'] = 'assets/lib';
    fileMap['storage'] = 'assets/storage';

    console.log(`Mapped ${Object.keys(fileMap).length} items.`);

    // 2. Update HTML Files
    const files = glob.sync('**/*.html', { cwd: SITE_ROOT, ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip'] });
    console.log(`Found ${files.length} HTML files to update.`);

    const sortedKeys = Object.keys(fileMap).sort((a, b) => b.length - a.length); // Longest first

    for (const file of files) {
        const filePath = path.join(SITE_ROOT, file);
        let content = await fs.readFile(filePath, 'utf8');
        let originalContent = content;

        for (const oldDir of sortedKeys) {
            const newDir = fileMap[oldDir].replace(/\\/g, '/'); // Ensure forward slashes

            // Regex to match href="/oldDir..." or src="/oldDir..."
            // We match:
            // 1. Quote (["'])
            // 2. Slash /
            // 3. oldDir
            // 4. Optional slash or end of string or other char

            // Case 1: href="/oldDir" or href="/oldDir/"
            // We want to replace /oldDir with /newDir

            const regex = new RegExp(`(["'])/(${oldDir})([/"'])`, 'g');
            // Replacement: $1/newDir$3
            content = content.replace(regex, `$1/${newDir}$3`);

            // Also handle CSS url(/oldDir...)
            const regexCss = new RegExp(`url\\((["']?)/(${oldDir})([/"'])`, 'g');
            content = content.replace(regexCss, `url($1/${newDir}$3`);
        }

        if (content !== originalContent) {
            await fs.writeFile(filePath, content);
            // console.log(`Updated ${file}`);
        }
    }

    console.log('Link fixing complete.');
}

fixLinks().catch(console.error);
