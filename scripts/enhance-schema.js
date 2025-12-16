
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';

async function enhanceSchema() {
    console.log('Enhancing Schema with Local SEO Data...');
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

        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const json = JSON.parse($(el).html());
                let jsonModified = false;

                const traverse = (obj) => {
                    if (!obj || typeof obj !== 'object') return;

                    // Target LocalBusiness or Organization
                    if (obj['@type'] === 'LocalBusiness' || obj['@type'] === 'Organization') {

                        // Add Area Served
                        if (!obj.areaServed) {
                            obj.areaServed = {
                                "@type": "City",
                                "name": "San Luis Potosí",
                                "sameAs": "https://es.wikipedia.org/wiki/San_Luis_Potos%C3%AD_(ciudad)"
                            };
                            jsonModified = true;
                        }

                        // Add Geo Coordinates (Approximate for Ricardo B. Anaya 2da Sección)
                        if (!obj.geo) {
                            obj.geo = {
                                "@type": "GeoCoordinates",
                                "latitude": 22.1445,
                                "longitude": -100.9585
                            };
                            jsonModified = true;
                        }

                        // Ensure Address is complete (Overwrite to be safe)
                        obj.address = {
                            "@type": "PostalAddress",
                            "streetAddress": "Israel 440, Ricardo B. Anaya 2da Sección",
                            "addressLocality": "San Luis Potosí",
                            "addressRegion": "S.L.P.",
                            "postalCode": "78390",
                            "addressCountry": "MX"
                        };
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
                // Ignore parse errors
            }
        });

        if (modified) {
            await fs.writeFile(filePath, $.html());
            console.log(`Enhanced Schema in: ${file}`);
            updatedCount++;
        }
    }

    console.log(`Schema Enhancement Complete. Modified ${updatedCount} files.`);
}

enhanceSchema().catch(console.error);
