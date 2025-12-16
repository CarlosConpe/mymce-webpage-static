
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const SITE_ROOT = '.';

const SEO_MAPPING = {
    'index.html': {
        title: 'Carpintería Residencial en San Luis Potosí | Cocinas, Closets y Puertas | MYMCE',
        description: 'Expertos en Carpintería Residencial en San Luis Potosí (SLP). Diseño y fabricación de Cocinas Integrales, Closets, Vestidores y Puertas a medida. ¡Cotiza hoy!',
        h1: 'Carpintería Residencial en San Luis Potosí'
    },
    'services/diseno-y-fabricacion-de-cocinas-integrales/index.html': {
        title: 'Cocinas Integrales en San Luis Potosí | Diseño y Fabricación a Medida | MYMCE',
        description: 'Fabricación de Cocinas Integrales modernas en San Luis Potosí. Diseños personalizados, materiales de alta calidad y acabados de lujo. Transformamos tu cocina en SLP.',
        h1: 'Cocinas Integrales en San Luis Potosí'
    },
    'services/diseno-y-fabricacion-de-closets-y-vestidores/index.html': {
        title: 'Closets y Vestidores en San Luis Potosí | Diseño Moderno y Funcional | MYMCE',
        description: 'Diseño y fabricación de Closets y Vestidores a medida en San Luis Potosí. Optimizamos tus espacios con carpintería de alta gama en SLP.',
        h1: 'Closets y Vestidores en San Luis Potosí'
    },
    'services/diseno-y-fabricacion-de-puertas/index.html': {
        title: 'Puertas de Madera y PVC en San Luis Potosí | Interiores y Exteriores | MYMCE',
        description: 'Puertas personalizadas en San Luis Potosí. Fabricación de puertas de madera, PVC y tambor para interiores y exteriores. Calidad garantizada en SLP.',
        h1: 'Diseño y Fabricación de Puertas en SLP'
    },
    'services/diseno-y-fabricacion-de-muebles-de-bano/index.html': {
        title: 'Muebles de Baño en San Luis Potosí | Diseño y Fabricación | MYMCE',
        description: 'Muebles de baño a medida en San Luis Potosí. Gabinetes, vanities y almacenamiento con diseño exclusivo. Renueva tu baño en SLP con MYMCE.',
        h1: 'Muebles de Baño en San Luis Potosí'
    },
    'services/maquila-de-partes/index.html': {
        title: 'Maquila de Partes de Carpintería en San Luis Potosí | Corte y Enchape | MYMCE',
        description: 'Servicio de Maquila de Partes en San Luis Potosí. Corte, enchape y transformación de tableros con precisión milimétrica para carpinteros y constructoras en SLP.',
        h1: 'Maquila de Partes en San Luis Potosí'
    }
};

async function updateSEO() {
    console.log('Starting SEO Metadata Update...');
    let updatedCount = 0;

    for (const [file, metadata] of Object.entries(SEO_MAPPING)) {
        const filePath = path.join(SITE_ROOT, file);

        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${file}`);
            continue;
        }

        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);

        // Update Title
        if (metadata.title) {
            $('title').text(metadata.title);
            // Also update OG:Title
            $('meta[property="og:title"]').attr('content', metadata.title);
        }

        // Update Description
        if (metadata.description) {
            $('meta[name="description"]').attr('content', metadata.description);
            // Also update OG:Description
            $('meta[property="og:description"]').attr('content', metadata.description);
        }

        // Update H1 (Be careful not to break existing structure, usually H1 is inside a specific container)
        if (metadata.h1) {
            // Strategy: Find the main H1. In this theme, it seems to be inside .title-base h1
            const h1 = $('.title-base h1');
            if (h1.length > 0) {
                h1.text(metadata.h1);
            } else {
                console.warn(`H1 not found in ${file}, skipping H1 update.`);
            }
        }

        await fs.writeFile(filePath, $.html());
        console.log(`Updated SEO for: ${file}`);
        updatedCount++;
    }

    console.log(`SEO Update Complete. Modified ${updatedCount} files.`);
}

updateSEO().catch(console.error);
