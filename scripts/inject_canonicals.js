const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SITE_URL = 'https://www.grupomymce.com';
const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', 'scripts/**', 'functions/**'] });

let modifiedCount = 0;

console.log(`Scanning ${files.length} files for Canonical injection...`);

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if canonical already exists
    if (content.includes('rel="canonical"') || content.includes("rel='canonical'")) {
        // console.log(`[SKIP] Canonical exists in ${file}`);
        return;
    }

    // Construct Canonical URL
    let urlPath = '/' + file.replace(/\\/g, '/');
    if (urlPath.endsWith('index.html')) {
        urlPath = urlPath.substring(0, urlPath.length - 'index.html'.length);
    }

    // Ensure trailing slash for non-root, or match preferred style. 
    // Usually root is https://site.com/
    // Subpages: https://site.com/folder/

    const canonicalUrl = `${SITE_URL}${urlPath}`;
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;

    // Inject before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `  ${canonicalTag}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        // console.log(`[UPDATED] ${file} -> ${canonicalUrl}`);
        modifiedCount++;
    } else {
        console.warn(`[WARNING] No </head> found in ${file}`);
    }
});

console.log(`Total files updated with Canonical tags: ${modifiedCount}`);
