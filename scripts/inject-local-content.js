
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';

async function injectLocalContent() {
    console.log('Injecting Local SEO Content...');
    let updatedCount = 0;

    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip', 'optimized_site.zip']
    });

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // 1. Footer Injection (All Pages)
        // Find the footer column with address (usually .footer-left or similar)
        const footerAddress = $('.footer-left');
        if (footerAddress.length > 0) {
            // Check if already injected
            if (!footerAddress.text().includes('Zona de Cobertura')) {
                footerAddress.append('<hr class="space s"><p class="text-s"><strong>Zona de Cobertura:</strong> San Luis Potosí, Lomas, Carranza, Zona Industrial, Pozos, y alrededores.</p>');
                modified = true;
            }
        }

        // 2. Home Page Specific Injection
        if (file === 'index.html') {
            const introText = $('.title-base p');
            if (introText.length > 0) {
                if (!introText.text().includes('San Luis Potosí')) {
                    introText.append(' Atendemos proyectos residenciales y comerciales en toda la zona metropolitana de San Luis Potosí.');
                    modified = true;
                }
            }
        }

        if (modified) {
            await fs.writeFile(filePath, $.html());
            console.log(`Injected Content in: ${file}`);
            updatedCount++;
        }
    }

    console.log(`Content Injection Complete. Modified ${updatedCount} files.`);
}

injectLocalContent().catch(console.error);
