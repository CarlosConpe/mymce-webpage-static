const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const domain = 'grupomymce.com';
const rootDir = process.cwd();

const htmlFiles = glob.sync('**/*.html', { cwd: rootDir, ignore: ['node_modules/**'] });

const externalAssets = {
    images: new Set(),
    videos: new Set(),
    scripts: new Set(),
    styles: new Set(),
    links: new Set(), // Anchors
    other: new Set()
};

const fileMap = []; // { file: 'path/to/file.html', references: [] }

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    const references = [];

    // Check elements with src or href
    $('*').each((i, el) => {
        const checkAttr = (attrName) => {
            const val = $(el).attr(attrName);
            if (val && (val.includes(domain) || val.startsWith('http'))) {
                // We are strictly looking for the bad domain to localize
                if (val.includes(domain)) {
                    references.push({ tag: el.tagName, attr: attrName, val: val });

                    if (el.tagName === 'img') externalAssets.images.add(val);
                    else if (el.tagName === 'video' || el.tagName === 'source') externalAssets.videos.add(val);
                    else if (el.tagName === 'script') externalAssets.scripts.add(val);
                    else if (el.tagName === 'link' && $(el).attr('rel') === 'stylesheet') externalAssets.styles.add(val);
                    else if (el.tagName === 'a') externalAssets.links.add(val);
                    else externalAssets.other.add(val);
                }
            }
        };
        checkAttr('src');
        checkAttr('href');
        checkAttr('srcset');
    });

    if (references.length > 0) {
        fileMap.push({ file, references });
    }
});

const report = {
    assets: {
        images: Array.from(externalAssets.images),
        videos: Array.from(externalAssets.videos),
        scripts: Array.from(externalAssets.scripts),
        styles: Array.from(externalAssets.styles),
        links: Array.from(externalAssets.links),
        other: Array.from(externalAssets.other)
    },
    files: fileMap
};

fs.writeFileSync('external_assets.json', JSON.stringify(report, null, 2));
console.log('Audit complete. See external_assets.json');
console.log(`Found:
- Images: ${report.assets.images.length}
- Videos: ${report.assets.videos.length}
- Scripts: ${report.assets.scripts.length}
- Styles: ${report.assets.styles.length}
- Links: ${report.assets.links.length}
`);
