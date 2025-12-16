const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

// Mapping from Current State (servicios-carpinteria) to New State (servicios / equipamiento)
const MOVES = [
    // 1. Rename parent services folder (implicitly handled by moving children)

    // 2. Specific Silos
    {
        from: 'servicios-carpinteria/diseno-y-fabricacion-de-cocinas-integrales',
        to: 'servicios/cocinas'
    },
    {
        from: 'servicios-carpinteria/diseno-y-fabricacion-de-closets-y-vestidores',
        to: 'servicios/closets-vestidores'
    },
    {
        from: 'servicios-carpinteria/venta-de-electrodomesticos',
        to: 'equipamiento' // Root level silo
    },

    // 3. Move everything else from servicios-carpinteria to servicios (Generic Move)
    // We will handle this by listing the directory dynamically in the script
];

async function restructureSEO() {
    console.log('🚀 Starting SEO Architecture Restructure (Phase 20)...');

    // A. Perform Specific Moves
    for (const move of MOVES) {
        const srcPath = path.join(ROOT_DIR, move.from);
        const destPath = path.join(ROOT_DIR, move.to);

        if (fs.existsSync(srcPath)) {
            console.log(`📂 Moving Silo: ${move.from} -> ${move.to}`);
            await fs.move(srcPath, destPath, { overwrite: true });
        } else {
            console.warn(`⚠️ Source not found: ${move.from}`);
        }
    }

    // B. Move remaining items from servicios-carpinteria to servicios
    const oldServicesDir = path.join(ROOT_DIR, 'servicios-carpinteria');
    const newServicesDir = path.join(ROOT_DIR, 'servicios');

    if (fs.existsSync(oldServicesDir)) {
        await fs.ensureDir(newServicesDir);
        const remaining = fs.readdirSync(oldServicesDir);
        for (const item of remaining) {
            const src = path.join(oldServicesDir, item);
            const dest = path.join(newServicesDir, item);
            console.log(`📂 Moving Generic: ${item} -> servicios/${item}`);
            await fs.move(src, dest, { overwrite: true });
        }
        // Remove empty old dir
        if (fs.readdirSync(oldServicesDir).length === 0) {
            await fs.remove(oldServicesDir);
        }
    }

    // C. Update Links Site-Wide
    console.log('🔗 Updating Internal Links...');
    const files = glob.sync(`${ROOT_DIR}/**/*.{html,css,js,json,xml}`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/.gemini/**`, `${ROOT_DIR}/scripts/**`, `${ROOT_DIR}/_dist/**`]
    });

    let modifiedCount = 0;

    for (const file of files) {
        let content = await fs.readFile(file, 'utf8');
        let modified = false;

        // Replacement Rules (Order matters! Specific first)
        const replacements = [
            { from: '/servicios-carpinteria/diseno-y-fabricacion-de-cocinas-integrales', to: '/servicios/cocinas' },
            { from: '/services/diseno-y-fabricacion-de-cocinas-integrales', to: '/servicios/cocinas' }, // Old legacy check

            { from: '/servicios-carpinteria/diseno-y-fabricacion-de-closets-y-vestidores', to: '/servicios/closets-vestidores' },
            { from: '/services/diseno-y-fabricacion-de-closets-y-vestidores', to: '/servicios/closets-vestidores' },

            { from: '/servicios-carpinteria/venta-de-electrodomesticos', to: '/equipamiento' },
            { from: '/services/venta-de-electrodomesticos', to: '/equipamiento' },

            // Generic parent replacements (for things moved in Step B)
            { from: '/servicios-carpinteria/', to: '/servicios/' },
            { from: '/services/', to: '/servicios/' } // Final catch-all for old 'services'
        ];

        for (const rep of replacements) {
            if (content.includes(rep.from)) {
                // Global replace
                content = content.split(rep.from).join(rep.to);
                modified = true;
            }
        }

        if (modified) {
            await fs.writeFile(file, content, 'utf8');
            modifiedCount++;
        }
    }

    console.log(`✅ Updated links in ${modifiedCount} files.`);
}

restructureSEO().catch(console.error);
