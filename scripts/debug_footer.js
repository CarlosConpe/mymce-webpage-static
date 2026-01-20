const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');

try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Find the copyright div
    const searchMarker = 'class="col-md-12 copy-text"';
    const index = content.indexOf(searchMarker);

    console.log(`Marker found at: ${index}`);

    if (index !== -1) {
        // Grab the next 300 chars
        const snippet = content.substring(index, index + 300);
        console.log('--- SNIPPET ---');
        console.log(snippet);
        console.log('--- HEX DUMP ---');
        for (let i = 0; i < snippet.length; i++) {
            const charCode = snippet.charCodeAt(i);
            process.stdout.write(charCode.toString(16).padStart(4, '0') + ' ');
            if ((i + 1) % 16 === 0) console.log();
        }
        console.log('\n--- END DUMP ---');
    } else {
        console.log('Marker not found!');
    }
} catch (e) {
    console.error(e);
}
