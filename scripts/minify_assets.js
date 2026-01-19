const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Terser = require('terser');
const CleanCSS = require('clean-css');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets').replace(/\\/g, '/');
const JS_PATTERN = '**/*.js';
const CSS_PATTERN = '**/*.css';

// Files/Folders to ignore
const IGNORE_PATTERNS = [
    '**/node_modules/**',
    '**/.git/**',
    '**/*.min.js', // Don't minify already minified files
    '**/*.min.css',
    '**/scripts/minify_assets.js',
    '**/scripts/verify_links.js',
    '**/ignore/**'
];

async function minifyFile(filePath) {
    const ext = path.extname(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const minFilePath = filePath.replace(ext, '.min' + ext);

    try {
        if (ext === '.js') {
            const result = await Terser.minify(content);
            if (result.error) throw result.error;
            fs.writeFileSync(minFilePath, result.code);
            console.log(`Minified JS: ${path.relative(ROOT_DIR, filePath)} -> ${path.relative(ROOT_DIR, minFilePath)}`);
        } else if (ext === '.css') {
            const result = new CleanCSS().minify(content);
            if (result.errors.length > 0) throw new Error(result.errors.join(', '));
            fs.writeFileSync(minFilePath, result.styles);
            console.log(`Minified CSS: ${path.relative(ROOT_DIR, filePath)} -> ${path.relative(ROOT_DIR, minFilePath)}`);
        }
    } catch (err) {
        console.error(`Error minifying ${filePath}:`, err.message);
    }
}

async function run() {
    console.log('Starting asset minification...');

    // Use forward slashes for glob logic
    const assetsJs = glob.sync(`${ASSETS_DIR}/${JS_PATTERN}`, { ignore: IGNORE_PATTERNS });
    const assetsCss = glob.sync(`${ASSETS_DIR}/${CSS_PATTERN}`, { ignore: IGNORE_PATTERNS });

    const rootJs = glob.sync(`${ROOT_DIR}/js/${JS_PATTERN}`, { ignore: IGNORE_PATTERNS });
    const rootCss = glob.sync(`${ROOT_DIR}/css/${CSS_PATTERN}`, { ignore: IGNORE_PATTERNS });

    const allFiles = [...assetsJs, ...assetsCss, ...rootJs, ...rootCss];

    console.log(`Found ${allFiles.length} files to minify.`);

    for (const file of allFiles) {
        await minifyFile(file);
    }

    console.log('Minification complete.');
}

run();
