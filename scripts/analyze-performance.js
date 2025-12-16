const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

// Use forward slashes for Windows compatibility
const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

const RESULTS_FILE = path.join(ROOT_DIR, 'performance_analysis.md');

// Thresholds
const LARGE_FILE_THRESHOLD = 500 * 1024; // 500KB
const PAGE_WEIGHT_THRESHOLD = 2 * 1024 * 1024; // 2MB

async function analyzePerformance() {
    console.log('🚀 Starting Performance Analysis...');

    let report = '# Performance Audit Report\n\n';
    report += `**Date:** ${new Date().toISOString()}\n\n`;

    // 1. Large File Scan
    report += '## 1. Heavy Assets (> 500KB)\n';
    report += '| File | Size (MB) | Type |\n|---|---|---|\n';

    const allFiles = glob.sync(`${ROOT_DIR}/**/*`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/.gemini/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/*.zip`]
    });

    let heavyFilesCount = 0;

    for (const file of allFiles) {
        const stats = fs.statSync(file);
        if (stats.size > LARGE_FILE_THRESHOLD && !fs.lstatSync(file).isDirectory()) {
            const relativePath = path.relative(ROOT_DIR, file);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            const ext = path.extname(file);
            report += `| \`${relativePath}\` | ${sizeMB} MB | ${ext} |\n`;
            heavyFilesCount++;
        }
    }

    if (heavyFilesCount === 0) report += '| None | - | - |\n';
    report += '\n';

    // 2. Page Weight & Image Optimization Analysis
    report += '## 2. Page Level Analysis (Slowest Pages)\n';
    report += '| Page | Image Count | Missing Lazy | Total Weight (Est) | Blocking Scripts |\n|---|---|---|---|---|\n';

    const htmlFiles = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`]
    });

    let slowPages = [];

    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content);
        const relativePath = path.relative(ROOT_DIR, file);

        // Blocking Scripts (in head, not async/defer)
        const blockingScripts = $('head script[src]').filter((i, el) => {
            return !$(el).attr('async') && !$(el).attr('defer');
        }).length;

        // Images
        const imgs = $('img');
        let totalImages = imgs.length;
        let missingLazy = 0;
        let localAssetsWeight = 0; // Estimated from local files found in src

        imgs.each((i, el) => {
            const src = $(el).attr('src');
            const loading = $(el).attr('loading');

            // Check Lazy Loading (heuristic: first 2-3 images might be eager, rest should be lazy)
            // But strict check: if not lazy and not hero, flag it.
            // Simplified: Count how many explicit lazy vs not.
            if (loading !== 'lazy') missingLazy++;

            // Estimate size if local
            if (src && !src.startsWith('http') && !src.startsWith('//')) {
                try {
                    // removing query params ?v=...
                    const cleanSrc = src.split('?')[0];
                    const localPath = path.join(ROOT_DIR, cleanSrc.startsWith('/') ? cleanSrc.slice(1) : cleanSrc);
                    if (fs.existsSync(localPath)) {
                        localAssetsWeight += fs.statSync(localPath).size;
                    }
                } catch (e) {
                    // ignore resolution errors
                }
            }
        });

        // Add CSS/JS weight if local
        $('link[rel="stylesheet"], script[src]').each((i, el) => {
            const src = $(el).attr('href') || $(el).attr('src');
            if (src && !src.startsWith('http') && !src.startsWith('//')) {
                try {
                    const cleanSrc = src.split('?')[0];
                    const localPath = path.join(ROOT_DIR, cleanSrc.startsWith('/') ? cleanSrc.slice(1) : cleanSrc);
                    if (fs.existsSync(localPath)) {
                        localAssetsWeight += fs.statSync(localPath).size;
                    }
                } catch (e) { }
            }
        });

        // Add HTML size
        localAssetsWeight += fs.statSync(file).size;

        const weightMB = (localAssetsWeight / (1024 * 1024)).toFixed(2);

        // Filter: Only report if weight > 1MB OR > 5 blocking scripts OR > 10 missing lazy images
        if (localAssetsWeight > 1024 * 1024 || blockingScripts > 3 || missingLazy > 5) {
            slowPages.push({
                page: relativePath,
                imgs: totalImages,
                lazy: missingLazy,
                weight: weightMB,
                blocking: blockingScripts,
                weightRaw: localAssetsWeight
            });
        }
    }

    // Sort by weight descending
    slowPages.sort((a, b) => b.weightRaw - a.weightRaw);

    // List top 20
    slowPages.slice(0, 20).forEach(p => {
        report += `| \`${p.page}\` | ${p.imgs} | ${p.lazy} | ${p.weight} MB | ${p.blocking} |\n`;
    });

    if (slowPages.length === 0) report += '| All Good | < 1MB | - | - | -\n';

    await fs.writeFile(RESULTS_FILE, report);
    console.log(`✅ Analysis Saved to ${RESULTS_FILE}`);
}

analyzePerformance().catch(err => console.error(err));
