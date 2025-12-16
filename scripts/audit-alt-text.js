
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';
const LOCAL_KEYWORD = 'San Luis Potosí';

const ALT_MAPPING = {
    // Keywords to match in filename -> New Alt Text
    'cocina': 'Cocina Integral de diseño moderno en San Luis Potosí',
    'closet': 'Closet organizado y fabricado a medida en SLP',
    'vestidor': 'Vestidor de lujo con acabados premium en San Luis Potosí',
    'puerta': 'Puerta de madera sólida para interiores y exteriores en SLP',
    'bano': 'Mueble de baño resistente a la humedad fabricado en San Luis Potosí',
    'maquila': 'Servicio de maquila de corte y enchape en San Luis Potosí',
    'logo': 'Maderas y Materiales del Centro (MYMCE) - Carpintería en San Luis Potosí'
};

async function auditAltText() {
    console.log('Starting Image Alt Text Audit...');
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

        $('img').each((i, el) => {
            const src = $(el).attr('src') || '';
            let alt = $(el).attr('alt') || '';
            const filename = path.basename(src).toLowerCase();

            // Check if alt is missing or too generic (less than 5 chars, or just "slide")
            if (!alt || alt.length < 5 || alt.toLowerCase() === 'slide' || alt.toLowerCase() === 'image') {

                // Try to derive better alt from filename mapping
                let newAlt = '';
                for (const [key, text] of Object.entries(ALT_MAPPING)) {
                    if (filename.includes(key)) {
                        newAlt = text;
                        break;
                    }
                }

                // If no mapping found, use folder structure or generic fallback
                if (!newAlt) {
                    if (file.includes('cocinas')) newAlt = `Cocina integral en ${LOCAL_KEYWORD}`;
                    else if (file.includes('closets')) newAlt = `Closet a medida en ${LOCAL_KEYWORD}`;
                    else newAlt = `Carpintería residencial en ${LOCAL_KEYWORD}`;
                }

                $(el).attr('alt', newAlt);
                // console.log(`Fixed Alt: ${filename} -> ${newAlt}`);
                modified = true;
            } else {
                // If alt exists, check if it can be enhanced with location
                if (!alt.toLowerCase().includes('san luis') && !alt.toLowerCase().includes('slp')) {
                    // Be careful strictly appending, maybe just for core images
                    // $(el).attr('alt', `${alt} - ${LOCAL_KEYWORD}`); 
                    // Skipping append for now to avoid spamminess
                }
            }
        });

        if (modified) {
            await fs.writeFile(filePath, $.html());
            updatedCount++;
        }
    }

    console.log(`Alt Text Audit Complete. Modified ${updatedCount} files.`);
}

auditAltText().catch(console.error);
