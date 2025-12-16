const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';
const REPORT_FILE = 'unused_files_report.txt';

// Extensions to scan for references
const SCAN_EXTENSIONS = ['.html', '.css', '.js', '.json'];

// Extensions to consider as "assets" that might be unused
const ASSET_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm'];

async function findUnused() {
    console.log('Starting Dead Code Elimination Analysis...');

    // 1. Find all files that *could* contain references
    const sourceFiles = glob.sync(`**/*+(${SCAN_EXTENSIONS.join('|')})`, {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', 'optimized_site.zip', 'unused_files_report.txt', 'package.json', 'package-lock.json', 'README.md', 'LICENSE', 'llms.txt', 'implementation_plan.md', 'task.md', 'walkthrough.md', '.git/**', '.vscode/**']
    });

    console.log(`Scanning ${sourceFiles.length} source files for references...`);

    const referencedPaths = new Set();

    // Helper to add normalized path
    const addRef = (refPath, sourceFile) => {
        if (!refPath) return;

        // Clean up
        let cleanPath = refPath.split('?')[0].split('#')[0];

        // Ignore external, data, mailto
        if (cleanPath.startsWith('http') || cleanPath.startsWith('//') || cleanPath.startsWith('data:') || cleanPath.startsWith('mailto:') || cleanPath.startsWith('tel:')) {
            return;
        }

        let absolutePath;
        if (cleanPath.startsWith('/')) {
            absolutePath = path.join(SITE_ROOT, cleanPath);
        } else {
            absolutePath = path.join(path.dirname(sourceFile), cleanPath);
        }

        // Normalize to relative path from root
        try {
            const relPath = path.relative(SITE_ROOT, absolutePath).split(path.sep).join('/');
            referencedPaths.add(relPath);

            // Also add decoded version if it contains URI encoded chars
            if (relPath.includes('%')) {
                try {
                    referencedPaths.add(decodeURIComponent(relPath));
                } catch (e) { }
            }
        } catch (e) {
            // ignore invalid paths
        }
    };

    for (const file of sourceFiles) {
        const content = await fs.readFile(file, 'utf8');
        const ext = path.extname(file).toLowerCase();

        if (ext === '.html') {
            const $ = cheerio.load(content);
            $('a, link, script, img, source, video, audio, iframe, object, embed').each((i, el) => {
                addRef($(el).attr('href'), file);
                addRef($(el).attr('src'), file);
                addRef($(el).attr('srcset'), file);
                addRef($(el).attr('poster'), file);
                addRef($(el).attr('data-src'), file); // Common lazy load
            });

            // Inline styles
            $('[style]').each((i, el) => {
                const style = $(el).attr('style');
                const urls = style.match(/url\(['"]?([^'"\)]+)['"]?\)/g);
                if (urls) {
                    urls.forEach(u => {
                        const match = u.match(/url\(['"]?([^'"\)]+)['"]?\)/);
                        if (match) addRef(match[1], file);
                    });
                }
            });
        } else if (ext === '.css') {
            const urls = content.match(/url\(['"]?([^'"\)]+)['"]?\)/g);
            if (urls) {
                urls.forEach(u => {
                    const match = u.match(/url\(['"]?([^'"\)]+)['"]?\)/);
                    if (match) addRef(match[1], file);
                });
            }
        }

        // Naive string scan for JS/JSON (and fallback for others)
        // Look for strings that look like filenames we know exist
        // This is heuristic but helpful for dynamic loading
    }

    // 2. Find all actual asset files on disk
    const allAssets = glob.sync(`**/*+(${ASSET_EXTENSIONS.join('|')})`, {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', 'optimized_site.zip', 'unused_files_report.txt', 'package.json', 'package-lock.json', 'README.md', 'LICENSE', 'llms.txt', 'implementation_plan.md', 'task.md', 'walkthrough.md', '.git/**', '.vscode/**']
    });

    console.log(`Found ${allAssets.length} total asset files on disk.`);

    // 3. Compare
    const unusedFiles = [];
    let totalSize = 0;

    for (const asset of allAssets) {
        // Normalize asset path for comparison
        const normalizedAsset = asset.split(path.sep).join('/');

        // Check if referenced
        // We need to be careful about matching. 
        // referencedPaths contains relative paths like "assets/img/foo.jpg"

        if (!referencedPaths.has(normalizedAsset)) {
            // Double check: sometimes references are just filenames "foo.jpg" if in same dir
            // But we resolved everything to root-relative in addRef, so it should be fine.
            // One edge case: "foo.jpg" referenced in CSS might be resolved correctly, but what if JS does "img/" + "foo.jpg"?
            // We'll assume strict references for now.

            unusedFiles.push(normalizedAsset);
            const stat = await fs.stat(asset);
            totalSize += stat.size;
        }
    }

    console.log(`Found ${unusedFiles.length} potentially unused files.`);
    console.log(`Total potential savings: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    const report = `
DEAD CODE ELIMINATION REPORT
============================
Total Assets Scanned: ${allAssets.length}
Unused Files Found: ${unusedFiles.length}
Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB

FILES TO DELETE:
${unusedFiles.join('\n')}
    `;

    await fs.writeFile(REPORT_FILE, report);
    console.log(`Report written to ${REPORT_FILE}`);
}

findUnused().catch(console.error);
