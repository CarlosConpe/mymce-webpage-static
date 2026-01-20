const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
const content = fs.readFileSync(filePath, 'utf8');

const MARKER = 'class="col-md-12 copy-text"';
const INJECTION_HTML = '<br><span>LINK CHECK</span>';

console.log(`Analyzing: ${filePath}`);
const markerIndex = content.indexOf(MARKER);
console.log(`Marker Index: ${markerIndex}`);

if (markerIndex !== -1) {
    const afterMarker = content.substring(markerIndex);
    const relativeDivIndex = afterMarker.indexOf('</div>');
    console.log(`Relative Div Index: ${relativeDivIndex}`);

    if (relativeDivIndex !== -1) {
        const absoluteDivIndex = markerIndex + relativeDivIndex;
        console.log(`Absolute Div Index: ${absoluteDivIndex}`);

        console.log('--- CONTENT BEFORE SPLIT (Last 50 chars) ---');
        console.log(content.substring(absoluteDivIndex - 50, absoluteDivIndex));
        console.log('--- CONTENT AFTER SPLIT (First 20 chars) ---');
        console.log(content.substring(absoluteDivIndex, absoluteDivIndex + 20));

        const newContent = content.substring(0, absoluteDivIndex) + INJECTION_HTML + content.substring(absoluteDivIndex);

        // DRY RUN
        console.log('--- PREVIEW RESULT (Around Split) ---');
        const splitPoint = absoluteDivIndex;
        console.log(newContent.substring(splitPoint - 50, splitPoint + 50));

        // FORCE WRITE
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('FORCED WRITE COMPLETED.');

        // IMMEDIATE RE-READ
        const reRead = fs.readFileSync(filePath, 'utf8');
        console.log(`Has CHECK? ${reRead.includes('LINK CHECK')}`);
    }
}
