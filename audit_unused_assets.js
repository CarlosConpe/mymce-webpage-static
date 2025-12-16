const fs = require('fs');
const path = require('path');
const glob = require('glob');

const rootDir = process.cwd();
const assetsDir = path.join(rootDir, 'assets');

// 1. Gather all assets
const assetFiles = glob.sync('assets/**/*', {
    cwd: rootDir,
    nodir: true,
    ignore: ['assets/**/*.css', 'assets/**/*.js'] // We treat CSS/JS in assets as "code" to scan, or "assets" to check?
    // User wants to clean "assets section". Usually this means images/videos.
    // However, if there are unused CSS/JS files in assets, we should report them too.
    // Let's include everything in assets, but we must be careful:
    // A CSS file in assets is likely used by an HTML file.
    // An image in assets is likely used by HTML or CSS.
});

// We'll separate "media assets" (images, videos, fonts) from "code assets" (css, js) for clarity, 
// or just treat them all as "files to check usage of".
// Let's check usage of EVERYTHING in assets/.

const allAssets = glob.sync('assets/**/*', { cwd: rootDir, nodir: true });

// 2. Gather all files that might REFERENCE assets
// This includes HTML, CSS, JS files throughout the project.
// We must also include the assets themselves (e.g. a CSS file referencing an image).
const sourceFiles = glob.sync('**/*.{html,css,js,json}', {
    cwd: rootDir,
    ignore: ['node_modules/**', 'dist/**', '.git/**']
});

console.log(`Scanning ${allAssets.length} assets against ${sourceFiles.length} source files...`);

// Pre-read all source content to speed up (concatenating might be too big, let's keep array)
// Actually, reading 100 HTML files is fast.
const sourceContents = sourceFiles.map(f => {
    return {
        path: f,
        content: fs.readFileSync(path.join(rootDir, f), 'utf8')
    };
});

const unusedAssets = [];
let totalUnusedBytes = 0;

allAssets.forEach((assetRelPath, index) => {
    if (index % 50 === 0) process.stdout.write('.');

    const assetName = path.basename(assetRelPath);
    const assetFullPath = path.join(rootDir, assetRelPath);

    // Skip checking if it's a known system file? No, check everything.

    // Determine strictness:
    // If we just search for "image.jpg", we might find it.
    // If we search for "assets/path/to/image.jpg", it's safer.
    // Given the previous task localized things to "assets/storage/...", 
    // we should look for "assets/storage/..." OR just "storage/..." if relative?
    // Let's search for the *filename* first. If not found, definitely unused.
    // If found, we assume used for now (safest approach to avoid deleting good files).

    let isUsed = false;

    for (const src of sourceContents) {
        // Don't check file against itself
        if (src.path === assetRelPath) continue;

        if (src.content.includes(assetName)) {
            // Found the filename! 
            // Only edge case: "bg.jpg" matches "big.jpg". 
            // So we should check boundary or just assume loose match implies usage?
            // "big.jpg" includes "g.jpg" - wait, string.includes is exact substring.
            // "big.jpg" does NOT include "bg.jpg". 
            // But "background.jpg" includes "round.jpg".
            // So short filenames are risky.

            // Refinement: if filename length < 5, maybe require path parts?
            // Let's stick to: if matches, assume used. We want to find *definitely* unused stuff.
            isUsed = true;
            break;
        }
    }

    if (!isUsed) {
        const stats = fs.statSync(assetFullPath);
        unusedAssets.push({
            path: assetRelPath,
            size: stats.size
        });
        totalUnusedBytes += stats.size;
    }
});

console.log('\nScan complete.');

// Sort by size desc
unusedAssets.sort((a, b) => b.size - a.size);

const report = {
    totalUnusedFiles: unusedAssets.length,
    totalUnusedBytes: totalUnusedBytes,
    totalUnusedMB: (totalUnusedBytes / 1024 / 1024).toFixed(2),
    files: unusedAssets
};

fs.writeFileSync('unused_assets_report.json', JSON.stringify(report, null, 2));

console.log(`Found ${unusedAssets.length} unused files.`);
console.log(`Potential savings: ${report.totalUnusedMB} MB`);
