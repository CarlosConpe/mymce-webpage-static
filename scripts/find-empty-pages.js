
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';
const REPORT_FILE = 'empty_pages_report.txt';

async function findEmptyPages() {
    console.log('Scanning for empty pages...');
    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', 'optimized_site*.zip', '_trash/**']
    });

    let emptyCandidates = [];

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);

        // Remove header, footer, nav, and scripts to analyze "real" content
        $('header').remove();
        $('footer').remove();
        $('nav').remove();
        $('script').remove();
        $('style').remove();
        $('noscript').remove();

        const textContent = $('body').text().replace(/\s+/g, ' ').trim();
        const wordCount = textContent.split(' ').length;

        // Criteria for "Empty"
        const isVeryShort = wordCount < 50; // Very aggressive threshold
        const hasNoResults = textContent.includes('Nothing Found') || textContent.includes('No se encontraron resultados') || textContent.includes('404 Not Found');
        const isEmptyBody = $('body').children().length === 0;

        if (isVeryShort || hasNoResults || isEmptyBody) {
            emptyCandidates.push({
                file,
                reason: isVeryShort ? `Low Word Count (${wordCount})` : (hasNoResults ? 'Contains "No Results"' : 'Empty Body')
            });
        }
    }

    // Sort by file path
    emptyCandidates.sort((a, b) => a.file.localeCompare(b.file));

    // Generate Report
    let report = `Found ${emptyCandidates.length} potential empty pages:\n\n`;
    emptyCandidates.forEach(c => {
        report += `[${c.reason}] ${c.file}\n`;
    });

    await fs.writeFile(REPORT_FILE, report);
    console.log(`Report generated: ${REPORT_FILE}`);
    console.log(report);
}

findEmptyPages().catch(console.error);
