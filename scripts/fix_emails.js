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

    // 1. Restore plain text / mailto emails
    content = content.replace(/contacto@mymce\.com\.mx/g, 'contacto@grupomymce.com');
    // Also support any other user prefix matching that got replaced (e.g. ventas@mymce.com.mx -> ventas@grupomymce.com)
    // Actually, only contacto@... is known to be in use, but let's be safe
    content = content.replace(/([a-zA-Z0-9.-]+)@mymce\.com\.mx/g, '$1@grupomymce.com');

    // 2. Restore protected emails: data-d="mymce.com.mx"
    // To be safe, only if it's accompanied by data-u=
    content = content.replace(/(data-d=["'])mymce\.com\.mx(["'])/g, '$1grupomymce.com$2');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Restored emails in: " + file);
        modifiedCount++;
    }
});

console.log(`Total files with emails restored: ${modifiedCount}`);
