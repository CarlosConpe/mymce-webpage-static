const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

// Configuration
const CONFIG = {
    brand: 'Grupo MYMCE',
    location: 'San Luis Potosí',
    locationAbbr: 'SLP',
    valueProp: 'Llave en Mano',
    home: {
        h1: 'Grupo MYMCE | Integradores de Lujo Llave en Mano en San Luis Potosí',
        title: 'Cocinas Integrales de Lujo y Carpintería Llave en Mano | SLP',
        desc: 'Soluciones Integrales en San Luis Potosí. Diseño, Fabricación y Gestión Completa de Equipamiento Premium. Agenda tu Cita Hoy.'
    }
};

async function applyBulkSEO() {
    console.log('🚀 Starting Bulk Phase 20 SEO Implementation...');

    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`]
    });

    let stats = { processed: 0, h1Fixed: 0, titlesFixed: 0, descsFixed: 0 };

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        const relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
        const isHome = relativePath === 'index.html';

        // 1. H1 STANDARDIZATION
        // Rule: Exactly ONE H1.
        let h1s = $('h1');

        if (isHome) {
            // Force Home H1
            if (h1s.length > 0) {
                $(h1s[0]).text(CONFIG.home.h1);
            } else {
                // Prepend to main content if missing
                $('body').prepend(`<h1 class="text-xl">${CONFIG.home.h1}</h1>`);
            }
            // Downgrade others
            if (h1s.length > 1) {
                h1s.slice(1).each((i, el) => {
                    const text = $(el).text();
                    $(el).replaceWith(`<h2 class="${$(el).attr('class') || ''}">${text}</h2>`);
                });
            }
            modified = true;
        } else {
            // General Pages
            if (h1s.length === 0) {
                // Promote H2 or Create from Title
                const h2 = $('h2').first();
                if (h2.length) {
                    const text = h2.text();
                    h2.replaceWith(`<h1 class="${h2.attr('class') || ''}">${text}</h1>`);
                    stats.h1Fixed++;
                    modified = true;
                }
            } else if (h1s.length > 1) {
                // Keep first, downgrade rest
                h1s.slice(1).each((i, el) => {
                    const text = $(el).text();
                    $(el).replaceWith(`<h2 class="${$(el).attr('class') || ''}">${text}</h2>`);
                });
                stats.h1Fixed++;
                modified = true;
            }
        }

        // Get Final H1 Text for Metadata
        const finalH1 = $('h1').first().text().trim() || 'Servicios de Carpintería';
        const cleanH1 = finalH1.replace(/\|.*/, '').trim(); // Remove exiting brands if any

        // 2. META TITLE
        // Format: [Keyword/H1] + [Value] | SLP | Grupo MYMCE
        let newTitle = '';
        if (isHome) {
            newTitle = CONFIG.home.title;
        } else {
            // Construct dynamic title
            let base = cleanH1;
            if (base.length > 30) base = base.substring(0, 30) + '...';
            newTitle = `${base} ${CONFIG.valueProp} | ${CONFIG.locationAbbr} | ${CONFIG.brand}`;
        }

        if ($('title').text() !== newTitle) {
            $('title').remove();
            $('head').prepend(`<title>${newTitle}</title>`);
            stats.titlesFixed++;
            modified = true;
        }

        // 3. META DESCRIPTION
        // Format: Value Prop + CTA + Llave en Mano
        let newDesc = '';
        if (isHome) {
            newDesc = CONFIG.home.desc;
        } else {
            newDesc = `${cleanH1} en ${CONFIG.location}. Servicio ${CONFIG.valueProp} con materiales premium. Contáctanos para cotizar tu proyecto hoy mismo.`;
        }

        const metaDesc = $('meta[name="description"]');
        if (metaDesc.length) {
            metaDesc.attr('content', newDesc);
            modified = true;
        } else {
            $('head').append(`<meta name="description" content="${newDesc}">`);
            modified = true;
            stats.descsFixed++;
        }

        // 4. SCHEMA (LocalBusiness) - Idempotent check
        const hasSchema = content.includes('application/ld+json') && content.includes('LocalBusiness');
        if (!hasSchema) {
            const schema = {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": "Grupo MYMCE",
                "image": "https://www.grupomymce.com/assets/logo.png", // Generic placeholder, script can't know specific
                "telephone": "+52 444-821-1917",
                "email": "contacto@grupomymce.com",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Israel 440, Ricardo B Anaya 2da Secc",
                    "addressLocality": "San Luis Potosí",
                    "addressRegion": "SLP",
                    "postalCode": "78390",
                    "addressCountry": "MX"
                },
                "url": "https://www.grupomymce.com/",
                "brand": {
                    "@type": "Brand",
                    "name": "Grupo MYMCE"
                },
                "priceRange": "$$$"
            };
            $('body').append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(file, $.html());
            stats.processed++;
        }
    }

    console.log(`✅ Bulk SEO Complete. Processed ${stats.processed} files.`);
    console.log(`Counts: H1s=${stats.h1Fixed}, Titles=${stats.titlesFixed}, Descs=${stats.descsFixed}`);
}

applyBulkSEO().catch(console.error);
