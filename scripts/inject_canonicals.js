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

    // Calculate URL Path
    let urlPath = '/' + file.replace(/\\/g, '/');
    if (urlPath.endsWith('index.html')) {
        urlPath = urlPath.substring(0, urlPath.length - 'index.html'.length);
    }

    // Prepare Injection Block
    const injectionBlock = `
<!-- Dynamic Canonical & Hreflang -->
    <link rel="alternate" hreflang="es" href="https://www.grupomymce.com${urlPath}">
    <link rel="alternate" hreflang="es-MX" href="https://www.mymce.com.mx${urlPath}">
    <link rel="canonical" href="${urlPath}">
    <script>
    (function() {
        var link = document.querySelector("link[rel='canonical']");
        var loc = window.location;
        if (!link) {
            link = document.createElement("link");
            link.setAttribute("rel", "canonical");
            document.head.appendChild(link);
        }
        // Ensure canonical is absolute and self-referencing
        // This makes the relative path absolute (e.g. /foo -> https://domain.com/foo)
        if (link.getAttribute("href").indexOf("http") !== 0) {
            link.setAttribute("href", loc.origin + loc.pathname);
        }
    })();
    </script>
<!-- End Dynamic Canonical -->`;

    // Inject before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${injectionBlock}\n</head>`);
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
    } else {
        console.warn(`[WARNING] No </head> found in ${file}`);
    }
});

console.log(`Total files updated: ${modifiedCount}`);
