const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '../');
const DIST_DIR = path.resolve(__dirname, '../_dist');

async function prepareDist() {
    console.log('📦 Preparing distribution folder...');

    // Clean dist matches safely
    try {
        await fs.emptyDir(DIST_DIR);
    } catch (e) {
        console.warn('⚠️ Could not empty dir completely, attempting to overwrite...', e.message);
        await fs.ensureDir(DIST_DIR);
    }

    // Everything to copy
    const files = glob.sync(`${ROOT_DIR}/**/*`, {
        ignore: [
            `${ROOT_DIR}/node_modules/**`,
            `${ROOT_DIR}/scripts/**`,
            `${ROOT_DIR}/.gemini/**`,
            `${ROOT_DIR}/_dist/**`,
            `${ROOT_DIR}/_site/**`,
            `${ROOT_DIR}/_backup/**`,
            `${ROOT_DIR}/*.zip`,
            `${ROOT_DIR}/*.log`,
            `${ROOT_DIR}/*.md`,
            `${ROOT_DIR}/*.json`,
            `${ROOT_DIR}/package*.json`,
            `${ROOT_DIR}/.gitignore`
        ],
        nodir: true,
        dot: true // include .htaccess or .well-known if any (though ignore list filters .gemini)
    });

    // Copy files
    for (const file of files) {
        const relativePath = path.relative(ROOT_DIR, file);
        const destPath = path.join(DIST_DIR, relativePath);
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(file, destPath);
    }

    console.log(`✅ Copied ${files.length} files to _dist/`);
}

prepareDist().catch(err => console.error(err));
