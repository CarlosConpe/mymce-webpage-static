const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', 'scripts/**', 'functions/**'] });

let modifiedCount = 0;

console.log(`Scanning ${files.length} files for Canonical & Hreflang injection...`);

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove existing canonical tags (we will use JS)
    const canonicalRegex = /<link rel=["']canonical["'].*?>/gi;
    if (canonicalRegex.test(content)) {
        content = content.replace(canonicalRegex, '');
    }

    // 2. Remove existing hreflang tags to avoid duplicates
    const hreflangRegex = /<link rel=["']alternate["'] hreflang=.*?>/gi;
    if (hreflangRegex.test(content)) {
        content = content.replace(hreflangRegex, '');
    }

    // 3. Remove existing Injection Script if present (to update it)
    const scriptStartMarker = '<!-- Dynamic Canonical & Hreflang -->';
    const scriptEndMarker = '<!-- End Dynamic Canonical -->';
    // Simple regex to remove the block if it exists
    const scriptBlockRegex = new RegExp(`${scriptStartMarker}[\\s\\S]*?${scriptEndMarker}`, 'g');
    if (scriptBlockRegex.test(content)) {
        content = content.replace(scriptBlockRegex, '');
    }

    // Also remove the new format if we run it multiple times
    const newStartMarker = '<!-- SEO Canonical & Hreflang -->';
    const newEndMarker = '<!-- End SEO Canonical -->';
    const newBlockRegex = new RegExp(`${newStartMarker}[\\s\\S]*?${newEndMarker}`, 'g');
    if (newBlockRegex.test(content)) {
        content = content.replace(newBlockRegex, '');
    }

    // Calculate URL Path
    let urlPath = '/' + file.replace(/\\/g, '/');
    if (urlPath.endsWith('index.html')) {
        urlPath = urlPath.substring(0, urlPath.length - 'index.html'.length);
    }

    // Prepare Injection Block
    const injectionBlock = `
${newStartMarker}
    <link rel="alternate" hreflang="es" href="https://www.mymce.com.mx${urlPath}">
    <link rel="alternate" hreflang="es-MX" href="https://www.mymce.com.mx${urlPath}">
    <link rel="canonical" href="https://www.mymce.com.mx${urlPath}">
${newEndMarker}`;

    // Inject before </head>
    const headEndMatch = content.match(/<\/head\s*>/i);
    if (headEndMatch) {
        content = content.replace(headEndMatch[0], `${injectionBlock}\n${headEndMatch[0]}`);
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
    } else {
        console.warn(`[WARNING] No </head> found in ${file}`);
    }
});

console.log(`Total files updated: ${modifiedCount} `);
