const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname).replace(/\\/g, '/');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets').replace(/\\/g, '/');

async function analyzeAssets() {
    console.log('🔍 Starting CSS/JS Analysis...');

    // 1. Inventory: Find all JS and CSS files in assets/ (excluding storage/uploads)
    const assetFiles = glob.sync(`${ASSETS_DIR}/**/*.{js,css}`, {
        ignore: [`${ASSETS_DIR}/storage/**`, `${ASSETS_DIR}/wp-content/uploads/**`]
    }).map(f => f.replace(/\\/g, '/'));

    console.log(`📂 Found ${assetFiles.length} asset files in assets/ (excluding storage).`);

    // 2. Scan HTML for references
    const htmlFiles = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`, `${ROOT_DIR}/.gemini/**`]
    });

    console.log(`📄 Scanning ${htmlFiles.length} HTML files for references...`);

    const referencedAssets = new Set();
    const librarySignatures = new Map(); // File -> [Lib Name, Version]

    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content);
        const fileDir = path.dirname(file).replace(/\\/g, '/');

        // Helper to resolve paths
        const resolveAssetPath = (linkPath) => {
            if (!linkPath) return null;
            // Clean query params ?ver=1.2.3
            const cleanPath = linkPath.split('?')[0].split('#')[0];

            if (cleanPath.startsWith('http')) return null; // External

            let absolutePath;
            if (cleanPath.startsWith('/')) {
                // Root relative
                absolutePath = path.join(ROOT_DIR, cleanPath).replace(/\\/g, '/');
            } else {
                // Relative to potential file
                absolutePath = path.resolve(fileDir, cleanPath).replace(/\\/g, '/');
            }
            return absolutePath;
        };

        $('link[rel="stylesheet"]').each((i, el) => {
            const href = $(el).attr('href');
            const resolved = resolveAssetPath(href);
            if (resolved && assetFiles.includes(resolved)) {
                referencedAssets.add(resolved);
            }
        });

        $('script[src]').each((i, el) => {
            const src = $(el).attr('src');
            const resolved = resolveAssetPath(src);
            if (resolved && assetFiles.includes(resolved)) {
                referencedAssets.add(resolved);
            }
        });
    }

    // 3. Compare
    const unusedFiles = assetFiles.filter(f => !referencedAssets.has(f));
    const usedFiles = assetFiles.filter(f => referencedAssets.has(f));

    console.log(`✅ Used Files: ${usedFiles.length}`);
    console.log(`❌ Unused Files: ${unusedFiles.length}`);

    // 4. Content Analysis on Used Files (Duplicates?)
    const libraries = {}; // "jquery" -> ["version 1", "version 2"]

    for (const file of usedFiles) {
        const content = fs.readFileSync(file, 'utf8').substring(0, 2000); // Check header
        const filename = path.basename(file).toLowerCase();

        if (filename.includes('jquery') && !filename.includes('ui')) {
            libraries['jQuery'] = libraries['jQuery'] || [];
            libraries['jQuery'].push(file);
        }
        if (filename.includes('bootstrap')) {
            libraries['Bootstrap'] = libraries['Bootstrap'] || [];
            libraries['Bootstrap'].push(file);
        }
        if (filename.includes('font-awesome') || filename.includes('fontawesome')) {
            libraries['FontAwesome'] = libraries['FontAwesome'] || [];
            libraries['FontAwesome'].push(file);
        }
    }

    // 5. Generate Report
    const reportPath = path.join(__dirname, 'asset_cleanup_report.md');
    let report = `# Asset Cleanup Report\n\n`;

    report += `## Summary\n`;
    report += `- Total Assets Scanned: ${assetFiles.length}\n`;
    report += `- Used: ${usedFiles.length}\n`;
    report += `- Unused: ${unusedFiles.length}\n\n`;

    report += `## 1. Duplicate Libraries (Potential)\n`;
    Object.keys(libraries).forEach(lib => {
        if (libraries[lib].length > 1) {
            report += `### ${lib}\n`;
            libraries[lib].forEach(f => report += `- ${path.relative(ROOT_DIR, f)}\n`);
        }
    });

    report += `\n## 2. Unused Files (Candidate for Deletion)\n`;
    unusedFiles.sort().forEach(f => {
        report += `- [ ] ${path.relative(ROOT_DIR, f)}\n`;
    });

    report += `\n## 3. Used Files (Keep)\n`;
    usedFiles.sort().forEach(f => {
        report += `- ${path.relative(ROOT_DIR, f)}\n`;
    });

    fs.writeFileSync(reportPath, report);
    console.log(`📝 Report generated at: ${reportPath}`);
}

analyzeAssets().catch(console.error);
