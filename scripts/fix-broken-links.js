const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

async function fixBrokenLinks() {
    console.log('🚀 Starting Broken Link Fixer...');

    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`, `${ROOT_DIR}/.gemini/**`]
    });

    let modifiedCount = 0;

    for (const file of files) {
        let content = await fs.readFile(file, 'utf8');
        let modified = false;

        // Specific fix for the missed parent directory link
        // We use string replacement to avoid regex complexity with special chars if possible, 
        // but regex is better for word boundaries if needed. 
        // Here, we want to replace "/servicios-carpinteria" not followed by "-" or alphanumeric (to avoid replacing if it was part of a different valid name, though unlikely).
        // Actually, just replacing "/servicios-carpinteria" with "/servicios" is safe because "servicios-carpinteria" IS the old name to be fully replaced.

        // However, we must be careful not to double replace if I run this multiple times or if I have "/servicios-carpinteria/something".
        // My previous script replaced "/servicios-carpinteria/" with "/servicios/".
        // So "/servicios-carpinteria" (no slash) remains.

        if (content.includes('/servicios-carpinteria')) {
            // Replace "/servicios-carpinteria" with "/servicios"
            // We check that it's not followed by something that indicates it was already fixed?
            // No, if it was fixed, it would be "/servicios/..." 
            // So finding "/servicios-carpinteria" means it wasn't fixed.

            content = content.replace(/\/servicios-carpinteria/g, '/servicios');
            modified = true;
        }

        // Fix for /contact -> /corporate/contact (introduced in E-E-A-T injection)
        if (content.includes('href="/contact"')) {
            content = content.replace(/href="\/contact"/g, 'href="/corporate/contact"');
            modified = true;
        }

        // Also check for any other potential missed sub-paths if they didn't have trailing slash in the source code
        const otherMisses = [
            { from: '/diseno-y-fabricacion-de-cocinas-integrales', to: '/cocinas' },
            // Wait, the previous logic mapped full paths: /servicios-carpinteria/diseno... -> /servicios/cocinas
            // If the code had <a href="/servicios-carpinteria/diseno-y-fabricacion-de-cocinas-integrales"> (no slash)
            // My previous script: { from: '...integrales', to: '...cocinas' }
            // It did NOT have trailing slash in the `from` for sub-paths!
            // Let's re-verify restructure-seov2.js:
            // { from: '/servicios-carpinteria/diseno-y-fabricacion-de-cocinas-integrales', to: '/servicios/cocinas' }
            // This DOES NOT have a trailing slash. So it should have matched.

            // The issue specifically reported in logs was likely just the parent category link.
        ];

        if (modified) {
            await fs.writeFile(file, content, 'utf8');
            modifiedCount++;
        }
    }

    console.log(`✅ Fixed broken links in ${modifiedCount} files.`);
}

fixBrokenLinks().catch(console.error);
