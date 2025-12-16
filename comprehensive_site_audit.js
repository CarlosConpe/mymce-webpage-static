const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const rootDir = process.cwd();
const htmlFiles = glob.sync('**/*.html', { cwd: rootDir, ignore: ['node_modules/**', 'dist/**'] });

const report = {
    summary: {
        totalFiles: htmlFiles.length,
        filesWithIssues: 0,
        totalIssues: 0
    },
    seo: {
        missingTitle: [],
        missingMetaDescription: [],
        missingH1: [],
        multipleH1: [],
        duplicateTitles: {} // title -> [files]
    },
    accessibility: {
        imagesMissingAlt: [] // { file: ..., count: ... }
    },
    integrity: {
        brokenInternalLinks: [] // { file: ..., link: ... }
    },
    performance: {
        largeImages: [] // Not implementing size check yet, relying on previous usage audit
    }
};

const titleMap = {};

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    let hasIssues = false;

    // --- SEO CHECKS ---

    // Title
    const title = $('title').text().trim();
    if (!title) {
        report.seo.missingTitle.push(file);
        hasIssues = true;
    } else {
        if (!titleMap[title]) titleMap[title] = [];
        titleMap[title].push(file);
    }

    // Meta Description
    const metaDesc = $('meta[name="description"]').attr('content');
    if (!metaDesc || metaDesc.trim() === '') {
        report.seo.missingMetaDescription.push(file);
        hasIssues = true;
    }

    // H1
    const h1Count = $('h1').length;
    if (h1Count === 0) {
        report.seo.missingH1.push(file);
        hasIssues = true;
    } else if (h1Count > 1) {
        report.seo.multipleH1.push(file);
        hasIssues = true;
    }

    // --- ACCESSIBILITY CHECKS ---

    // Images Alt
    let missingAltCount = 0;
    $('img').each((i, el) => {
        const alt = $(el).attr('alt');
        if (alt === undefined || alt === null) {
            // empty alt="" is valid for decorative, but missing attribute is bad
            missingAltCount++;
        }
    });
    if (missingAltCount > 0) {
        report.accessibility.imagesMissingAlt.push({ file, count: missingAltCount });
        hasIssues = true;
    }

    // --- INTEGRITY CHECKS (Basic) ---
    // Check local internal links
    $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            // Local link. Normalize and check existence.
            // Remove query params/hash
            const cleanHref = href.split('#')[0].split('?')[0];
            if (cleanHref === '/' || cleanHref === '') return; // Root is fine

            // Resolve path
            let targetPath;
            if (cleanHref.startsWith('/')) {
                // Absolute from root
                targetPath = path.join(rootDir, cleanHref);
            } else {
                // Relative to file
                targetPath = path.join(path.dirname(filePath), cleanHref);
            }

            // If it ends in slash, look for index.html
            if (targetPath.endsWith(path.sep) || targetPath.endsWith('/')) {
                targetPath = path.join(targetPath, 'index.html');
            } else {
                // If extension missing, assume dir -> index.html? Or loose match?
                if (!path.extname(targetPath)) {
                    // Try exact, then try /index.html
                    if (!fs.existsSync(targetPath) && fs.existsSync(path.join(targetPath, 'index.html'))) {
                        targetPath = path.join(targetPath, 'index.html');
                    }
                }
            }

            try {
                if (!fs.existsSync(targetPath)) {
                    // One last retry: sometimes people link /foo/bar and it means /foo/bar.html
                    if (fs.existsSync(targetPath + '.html')) {
                        // This exists, so it's technically okay if server rewrites, but for static it might fail.
                        // Let's flag as warning? No, strict check: broken if file doesn't exist.
                    } else {
                        report.integrity.brokenInternalLinks.push({ file, link: href });
                        hasIssues = true;
                    }
                }
            } catch (e) {
                // Ignore weird paths
            }
        }
    });

    if (hasIssues) {
        report.summary.filesWithIssues++;
    }
});

// Process duplicates
for (const [t, files] of Object.entries(titleMap)) {
    if (files.length > 1) {
        report.seo.duplicateTitles[t] = files.length;
    }
}

fs.writeFileSync('site_audit_raw.json', JSON.stringify(report, null, 2));
console.log('Audit complete. Results saved to site_audit_raw.json');
