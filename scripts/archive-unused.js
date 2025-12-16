const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const REPORT_FILE = 'unused_files_report.txt';
const TRASH_DIR = '_trash';

async function archiveUnused() {
    if (!fs.existsSync(REPORT_FILE)) {
        console.error('Report file not found. Run find-unused.js first.');
        return;
    }

    console.log(`Reading ${REPORT_FILE}...`);

    const fileStream = fs.createReadStream(REPORT_FILE);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let startReading = false;
    let count = 0;

    await fs.ensureDir(TRASH_DIR);

    for await (const line of rl) {
        if (line.trim() === 'FILES TO DELETE:') {
            startReading = true;
            continue;
        }

        if (startReading && line.trim()) {
            const filePath = line.trim();
            const srcPath = path.join('.', filePath);
            const destPath = path.join(TRASH_DIR, filePath);

            if (fs.existsSync(srcPath)) {
                try {
                    await fs.move(srcPath, destPath, { overwrite: true });
                    console.log(`Moved: ${filePath}`);
                    count++;
                } catch (err) {
                    console.error(`Failed to move ${filePath}: ${err.message}`);
                }
            } else {
                console.warn(`File not found (already moved?): ${filePath}`);
            }
        }
    }

    console.log(`\nArchived ${count} files to ${TRASH_DIR}/`);
}

archiveUnused().catch(console.error);
