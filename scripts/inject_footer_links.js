const fs = require('fs');
const path = require('path');
const glob = require('glob');

const rootDir = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: rootDir, ignore: 'node_modules/**' });

console.log(`Scanning ${files.length} HTML files in ${rootDir}...`);

let modifiedCount = 0;
let skippedCount = 0;
let notFoundCount = 0;

const INJECTION_HTML = '<br><span style="font-size: 11px; opacity: 0.8; margin-top: 5px; display: inline-block;">Una empresa de <a href="https://grupomymce.com" style="color: inherit; text-decoration: underline;">Grupo MYMCE</a> y <a href="https://mymce.com.mx" style="color: inherit; text-decoration: underline;">MYMCE</a></span>';
const MARKER = 'class="col-md-12 copy-text"';

files.forEach(file => {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const markerIndex = content.indexOf(MARKER);

    if (markerIndex !== -1) {
        // Find the next </div> distinct from the marker
        // We look in the substring starting from the marker to ensure we get the closing div of *this* element
        const contentAfterMarker = content.substring(markerIndex);
        const relativeDivIndex = contentAfterMarker.indexOf('</div>');

        if (relativeDivIndex !== -1) {
            const absoluteDivIndex = markerIndex + relativeDivIndex;

            // Check for existence in this block specifically or globally
            if (content.includes('grupomymce.com')) {
                skippedCount++;
                return;
            }

            // Slice and dice
            const newContent = content.substring(0, absoluteDivIndex) +
                INJECTION_HTML +
                content.substring(absoluteDivIndex);

            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`[UPDATED] ${file}`);
            modifiedCount++;
        } else {
            console.warn(`[WARNING] Closing div not found for ${file}`);
            notFoundCount++;
        }
    } else {
        console.warn(`[WARNING] Marker class not found in: ${file}`);
        notFoundCount++;
    }
});

console.log('--------------------------------------------------');
console.log(`Summary:`);
console.log(`Modified: ${modifiedCount}`);
console.log(`Skipped: ${skippedCount}`);
console.log(`Not Found/Error: ${notFoundCount}`);
console.log('--------------------------------------------------');
