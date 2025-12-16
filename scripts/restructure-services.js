const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Use forward slashes for glob compatibility
const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

const MOVES = [
    {
        from: 'puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc',
        to: 'services/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc'
    },
    {
        from: 'puertas-y-piezas-recubiertas-con-foil-pvc',
        to: 'services/puertas-y-piezas-recubiertas-con-foil-pvc'
    },
    {
        from: 'pvc-foil-covered-cabinet-doors-drawer-fronts',
        to: 'services/pvc-foil-covered-cabinet-doors-drawer-fronts'
    }
];

async function restructure() {
    console.log('🚀 Starting Service Restructuring...');
    console.log(`📂 Root Dir: ${ROOT_DIR}`);

    // 1. Move Directories
    for (const move of MOVES) {
        const srcPath = path.join(ROOT_DIR, move.from);
        const destPath = path.join(ROOT_DIR, move.to);

        if (fs.existsSync(srcPath)) {
            console.log(`📂 Moving ${move.from} -> ${move.to}`);
            await fs.move(srcPath, destPath, { overwrite: true });
        } else {
            // Check if already moved
            if (fs.existsSync(destPath)) {
                console.log(`✅ Already moved: ${move.to}`);
            } else {
                console.warn(`⚠️ Source directory not found: ${move.from}`);
            }
        }
    }

    // 2. Update Links in HTML/CSS/JS
    console.log('🔗 Updating internal links...');
    const files = glob.sync(`${ROOT_DIR}/**/*.{html,css,js,json,xml}`, {
        ignore: [
            `${ROOT_DIR}/node_modules/**`,
            `${ROOT_DIR}/.gemini/**`,
            `${ROOT_DIR}/scripts/**`,
            `${ROOT_DIR}/_dist/**`,
            `${ROOT_DIR}/optimized_site*.zip`
        ]
    });

    console.log(`Found ${files.length} files to scan.`);

    let updatedFiles = 0;

    for (const file of files) {
        let content = await fs.readFile(file, 'utf8');
        let modified = false;

        for (const move of MOVES) {
            // Strings to search for
            // Case 1: "/folder-name" (Most common in hrefs)
            const searchTotal = `/${move.from}`;
            const replaceTotal = `/${move.to}`;

            // Case 2: "folder-name/" (Relative path at start) - less likely but possible
            // We focus on the HREF="/..." pattern mostly

            if (content.includes(searchTotal)) {
                // Use global replace
                content = content.split(searchTotal).join(replaceTotal);
                modified = true;
            }

            // Special case: Sometimes it might be encoded or something, but usually raw in HTML
        }

        if (modified) {
            await fs.writeFile(file, content, 'utf8');
            updatedFiles++;
        }
    }

    console.log(`✅ Updated links in ${updatedFiles} files.`);
    console.log('🎉 Restructuring Complete!');
}

restructure().catch(err => console.error(err));
