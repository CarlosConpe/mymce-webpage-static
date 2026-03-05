const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.{html,js}', { cwd: ROOT_DIR, ignore: ['node_modules/**', 'scripts/expert-seo-analyzer.js', 'scripts/apply-expert-seo.js', 'functions/**'] });

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    if (filePath === __filename) return;

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return;
    }

    const originalContent = content;

    // We want to replace grupomymce.com with mymce.com.mx
    // But EXCLUDE:
    // - contacto@grupomymce.com
    // - data-d="grupomymce.com"

    let newContent = content.replace(/grupomymce\.com/g, (match, offset, str) => {
        const prev1 = str.charAt(offset - 1);
        const prev8 = str.substring(offset - 8, offset);

        if (prev1 === '@') {
            return match; // don't replace emails
        }
        if (prev8 === 'data-d="') {
            return match; // don't replace protected emails
        }

        return 'mymce.com.mx';
    });

    if (newContent !== originalContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log("Updated: " + file);
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
