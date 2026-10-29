const fs = require('fs');
const path = require('path');
const glob = require('glob');

// The Yoast graph on portfolio pages was relabeled from Article to Product in
// "Optimization Webpage Site Audit" (8d84257). The node still describes an article
// (headline, author, datePublished) and has no name, offers or reviews, so Google
// reads it as an incomplete Product. Restore the Article type.
const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/index.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(/"@type":"Product"(,"@id":"[^"]*#article")/g, '"@type":"Article"$1');
    if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
