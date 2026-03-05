const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1 (Header): Israel 448, Ricardo B Anaya 2da Sección. S.L.P.
    const pattern1 = /Israel 448, Ricardo B Anaya 2da\s+Sección\.\s*S\.L\.P\./g;
    if (pattern1.test(content)) {
        content = content.replace(pattern1, 'Israel 448, Ricardo B. Anaya 2da Sección, San Luis Potosí, SLP.');
        modified = true;
    }

    // Pattern 2 (Footer): Israel 448, Ricardo B. Anaya 2da Sec.
    const pattern2 = /Israel 448, Ricardo B\. Anaya 2da Sec\./g;
    if (pattern2.test(content)) {
        content = content.replace(pattern2, 'Israel 448, Ricardo B. Anaya 2da Sección, San Luis Potosí, SLP.');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated address NAP in ${file}`);
    }
});
