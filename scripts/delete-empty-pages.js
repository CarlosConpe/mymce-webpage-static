
const fs = require('fs-extra');
const path = require('path');

const SITE_ROOT = '.';
const REPORT_FILE = 'empty_pages_report.txt';

async function deleteEmptyPages() {
    console.log('Starting deletion of empty pages...');

    if (!fs.existsSync(REPORT_FILE)) {
        console.error(`Report file not found: ${REPORT_FILE}`);
        return;
    }

    const reportContent = await fs.readFile(REPORT_FILE, 'utf8');
    const lines = reportContent.split('\n');
    let deletedCount = 0;

    for (const line of lines) {
        if (!line.trim() || line.startsWith('Found')) continue;

        // Parse format: [Reason] Path
        const match = line.match(/^\[.*\] (.*)$/);
        if (match && match[1]) {
            let relativePath = match[1].trim();
            const fullPath = path.join(SITE_ROOT, relativePath);

            // SAFETY CHECK: Do NOT delete 404.html
            if (relativePath.includes('404.html')) {
                console.log(`Skipping protected file: ${relativePath}`);
                continue;
            }

            if (fs.existsSync(fullPath)) {
                await fs.remove(fullPath);
                console.log(`Deleted: ${relativePath}`);
                deletedCount++;

                // Try to delete parent directory if empty
                try {
                    const parentDir = path.dirname(fullPath);
                    const siblings = await fs.readdir(parentDir);
                    if (siblings.length === 0) {
                        await fs.rmdir(parentDir);
                        console.log(`Deleted empty directory: ${parentDir}`);
                    }
                } catch (e) {
                    // Ignore directory deletion errors
                }
            } else {
                console.warn(`File already gone: ${relativePath}`);
            }
        }
    }

    console.log(`Deletion Complete. Removed ${deletedCount} files.`);
}

deleteEmptyPages().catch(console.error);
