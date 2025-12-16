const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';
const DOMAIN = 'https://www.grupomymce.com';

async function fixSchema() {
    console.log('Fixing Schema...');

    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip']
    });

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // Find JSON-LD scripts
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const json = JSON.parse($(el).html());
                let jsonModified = false;

                // Helper to traverse and fix
                const traverse = (obj) => {
                    if (!obj || typeof obj !== 'object') return;

                    // Fix Logo URL
                    if (obj.logo === '/path‑to‑logo.png') {
                        obj.logo = `${DOMAIN}/assets/storage/2016/12/mymce-logo-1664856016.png`;
                        jsonModified = true;
                    }

                    // Fix URL field if empty
                    if (obj.url === '') {
                        obj.url = DOMAIN;
                        jsonModified = true;
                    }

                    // Fix sameAs localhost
                    if (Array.isArray(obj.sameAs)) {
                        obj.sameAs = obj.sameAs.filter(link => !link.includes('localhost'));
                        // Add real ones if missing? 
                        // For now just remove bad ones.
                        jsonModified = true;
                    }

                    // Recursive
                    Object.values(obj).forEach(val => {
                        if (Array.isArray(val)) {
                            val.forEach(item => traverse(item));
                        } else {
                            traverse(val);
                        }
                    });
                };

                traverse(json);

                if (jsonModified) {
                    $(el).html(JSON.stringify(json, null, 2));
                    modified = true;
                }
            } catch (e) {
                // console.error(`Error parsing JSON-LD in ${file}`);
            }
        });

        if (modified) {
            await fs.writeFile(filePath, $.html());
            // console.log(`Fixed Schema in ${file}`);
        }
    }

    console.log('Schema Fix Complete.');
}

fixSchema().catch(console.error);
