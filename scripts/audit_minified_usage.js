const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BASE_DIR = path.resolve(__dirname, '../');

console.log(`Scanning for unminified asset usage in: ${BASE_DIR}`);

// Normalize path for glob usage (always forward slashes)
const globPattern = `${BASE_DIR.replace(/\\/g, '/')}/assets/**/*.{js,css}`;
console.log(`Glob pattern: ${globPattern}`);

// 1. Map all assets
const allAssets = glob.sync(globPattern, {
    ignore: ['**/node_modules/**']
});

console.log(`Total assets found: ${allAssets.length}`);

// Set of available .min files (absolute paths)
const minifiedAssets = new Set(
    allAssets.filter(f => f.includes('.min.'))//.map(f => f.replace(/\\/g, '/'))
);

// Map of non-min -> min (if min exists)
const replacements = {};
allAssets.forEach(f => {
    if (f.includes('.min.')) return;

    // Construct expected min path
    const ext = path.extname(f); // .js
    const base = f.slice(0, -ext.length); // /path/to/foo
    const minPath = `${base}.min${ext}`; // /path/to/foo.min.js

    if (minifiedAssets.has(minPath)) {
        replacements[f] = minPath;
    }
});

console.log(`Found ${Object.keys(replacements).length} assets that have a minified version.`);

// 2. Scan HTML files
const htmlFiles = glob.sync(`${BASE_DIR}/**/*.html`, {
    ignore: ['**/node_modules/**', '**/.git/**']
});

let issuesCount = 0;
let filesWithIssues = 0;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let fileHasIssues = false;

    // We search for strings that look like references to the non-minified assets
    // Since we don't know the exact relative path used in HTML, we'll try to match by filename
    // Be careful with false positives. 
    // Best approach: Parse HTML? Or simpler: 
    // Iterate over our 'replacements' map. For each non-min file, see if it is referenced in content.
    // However, replacements has absolute paths. We need to check relative usages in HTML.

    // Better strategy for speed/accuracy:
    // Extract everything that looks like a src="..." or href="..." ending in .js or .css
    const references = content.match(/(?:src|href)=["']([^"']+\.(js|css))["']/g) || [];

    references.forEach(refStr => {
        // Extract URL part: src="foo.js" -> foo.js
        const match = refStr.match(/["']([^"']+)["']/);
        if (!match) return;

        let url = match[1];
        if (url.includes('.min.')) return; // Already minified

        // Resolve to absolute path to check against 'replacements'
        // This is tricky because of relative paths.
        // Let's assume it starts with /assets or is relative.

        let absoluteAssetPath = null;

        if (url.startsWith('/')) {
            // Absolute from root
            absoluteAssetPath = path.join(BASE_DIR, url);
        } else if (url.startsWith('http')) {
            // Ignore external
            return;
        } else {
            // Relative to HTML file
            absoluteAssetPath = path.resolve(path.dirname(file), url);
        }

        // Check if this absolute path is in our 'replacements' map
        // Need to normalize paths for Windows comparison
        // absoluteAssetPath = absoluteAssetPath.replace(/\\/g, '/'); // Normalize if needed, but 'fs' paths usually standard

        // Actually, let's keep it simple: normalize everything to forward slashes for comparison key
        if (replacements[absoluteAssetPath]) {
            console.log(`[UNOPTIMIZED] In ${path.relative(BASE_DIR, file)}`);
            console.log(`    Refers to: ${url}`);
            console.log(`    Should be: ${url.replace(/(\.css|\.js)$/, '.min$1')}`);
            fileHasIssues = true;
            issuesCount++;
        }
    });

    if (fileHasIssues) filesWithIssues++;
});

console.log(`\nAudit Complete.`);
console.log(`Files with issues: ${filesWithIssues}`);
console.log(`Total unoptimized references: ${issuesCount}`);
