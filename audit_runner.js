const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = __dirname;
const REPORT_FILE = path.join(ROOT_DIR, 'performance_audit_raw.json');

// Thresholds
const MAX_CSS_SIZE = 50 * 1024; // 50KB
const MAX_IMAGE_SIZE = 200 * 1024; // 200KB

function getFileSize(relPath) {
    try {
        // Handle query strings
        const cleanPath = relPath.split('?')[0];
        // Handle absolute paths / relative paths
        let fullPath;
        if (cleanPath.startsWith('/')) {
            fullPath = path.join(ROOT_DIR, cleanPath);
        } else {
            fullPath = path.join(ROOT_DIR, cleanPath);
        }

        if (fs.existsSync(fullPath)) {
            return fs.statSync(fullPath).size;
        }
    } catch (e) {
        // Ignore file read errors
    }
    return 0;
}

function auditSite() {
    console.log("Starting Site Audit...");
    const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', '_dist/**', 'scripts/**', '.gemini/**'] });

    const results = {
        scanDate: new Date().toISOString(),
        totalPages: files.length,
        pages: []
    };

    files.forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) return;

        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);

        const pageAudit = {
            file: file,
            score: 100, // Pseudo-score
            issues: [],
            assets: {
                totalSize: 0,
                heavyImages: [],
                blockingCSS: 0
            }
        };

        // 1. IMAGES
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (!src) return;

            const w = $(el).attr('width');
            const h = $(el).attr('height');

            // CLS Check
            if (!w || !h) {
                pageAudit.issues.push(`CLS Risk: Image missing width/height (${src})`);
                pageAudit.score -= 2;
            }

            // Size Check
            const size = getFileSize(src);
            pageAudit.assets.totalSize += size;

            if (size > MAX_IMAGE_SIZE) {
                pageAudit.assets.heavyImages.push({ src, size });
                pageAudit.issues.push(`Heavy Image: ${(size / 1024).toFixed(0)}KB (${src})`);
                pageAudit.score -= 5;
            }
        });

        // 2. CSS
        let cssCount = 0;
        $('head link[rel="stylesheet"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                const size = getFileSize(href);
                pageAudit.assets.totalSize += size;
                cssCount++;
            }
        });

        // Check for non-bundled CSS behavior
        if (cssCount > 3) {
            pageAudit.issues.push(`Too many blocking CSS files (${cssCount})`);
            pageAudit.score -= 5;
        }

        // 3. JS
        $('head script[src]').each((i, el) => {
            const src = $(el).attr('src');
            const defer = $(el).attr('defer');
            const async = $(el).attr('async');
            if (!defer && !async) {
                pageAudit.issues.push(`Blocking Script in Head (${src})`);
                pageAudit.score -= 10;
            }
        });

        // 4. META
        const desc = $('meta[name="description"]').attr('content');
        if (!desc) {
            pageAudit.issues.push(`Missing Meta Description`);
            pageAudit.score -= 5;
        } else if (desc.length < 50 || desc.length > 160) {
            pageAudit.issues.push(`Meta Description length warning (${desc.length} chars)`);
        }

        results.pages.push(pageAudit);
    });

    // Write Results
    fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
    console.log("Audit Complete.");
}

auditSite();
