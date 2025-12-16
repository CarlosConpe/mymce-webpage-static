const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const SITE_ROOT = '.';
const ASSETS_DIR = 'assets';
const BLOG_DIR = 'blog';
const PORTFOLIO_DIR = 'portfolio';
const SERVICES_DIR = 'services';

const FOLDER_MAPPINGS = {
    'wp-content': 'assets/wp-content',
    'core': 'assets/core',
    'lib': 'assets/lib',
    'storage': 'assets/storage',
    '2023': 'blog/2023',
};

async function restructure() {
    console.log('Starting restructuring (Copy+Remove Mode)...');

    fs.ensureDirSync(ASSETS_DIR);
    fs.ensureDirSync(BLOG_DIR);
    fs.ensureDirSync(PORTFOLIO_DIR);
    fs.ensureDirSync(SERVICES_DIR);

    const fileMap = {};

    // Load existing map if available to avoid double processing
    try {
        const existingMap = fs.readJsonSync('scripts/file-map.json');
        Object.assign(fileMap, existingMap);
    } catch (e) { }

    const items = fs.readdirSync(SITE_ROOT);
    console.log(`Found ${items.length} items.`);

    for (const item of items) {
        if (['node_modules', 'scripts', '_backup_raw.zip', 'package.json', 'package-lock.json', 'task.md', 'implementation_plan.md', 'assets', 'blog', 'portfolio', 'services'].includes(item)) continue;

        const itemPath = path.join(SITE_ROOT, item);
        let stats;
        try {
            stats = fs.statSync(itemPath);
        } catch (e) {
            continue;
        }

        if (stats.isDirectory()) {
            let targetDir = null;

            if (FOLDER_MAPPINGS[item]) {
                targetDir = FOLDER_MAPPINGS[item];
            } else if (item.includes('modelo')) {
                targetDir = path.join(PORTFOLIO_DIR, item);
            } else if (item.includes('carpinteria') || item.includes('diseno') || item.includes('maquila') || item.includes('electrodomesticos') || item.includes('venta')) {
                targetDir = path.join(SERVICES_DIR, item);
            }

            if (targetDir) {
                // Check if already moved (exists in target)
                if (fs.existsSync(targetDir)) {
                    console.log(`Target ${targetDir} already exists. Skipping move for ${item}.`);
                    fileMap[item] = targetDir; // Ensure it's in the map
                    continue;
                }

                try {
                    console.log(`Copying: ${item} -> ${targetDir}`);
                    fs.copySync(itemPath, targetDir);
                    console.log(`Removing original: ${item}`);
                    fs.removeSync(itemPath);
                    console.log(`SUCCESS: Moved ${item}`);
                    fileMap[item] = targetDir;
                } catch (err) {
                    console.error(`FAILED to move ${item}:`, err.message);
                }
            }
        }
    }

    // Path Update Logic
    console.log('Updating paths...');
    const files = glob.sync('**/*.{html,css}', { cwd: SITE_ROOT, ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip'] });
    console.log(`Found ${files.length} files to update.`);

    const movedDirs = Object.keys(fileMap).sort((a, b) => b.length - a.length);

    for (const file of files) {
        const filePath = path.join(SITE_ROOT, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        for (const oldDir of movedDirs) {
            const newDir = fileMap[oldDir];

            // Absolute paths
            const regexAbs = new RegExp(`(["'(])/(${oldDir})/`, 'g');
            content = content.replace(regexAbs, `$1/${newDir}/`);

            // CSS url(/oldDir/...)
            const regexCss = new RegExp(`url\\((["']?)/(${oldDir})/`, 'g');
            content = content.replace(regexCss, `url($1/${newDir}/`);
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
        }
    }

    fs.writeJsonSync('scripts/file-map.json', fileMap, { spaces: 2 });
    console.log('Restructuring complete.');
}

restructure().catch(console.error);
