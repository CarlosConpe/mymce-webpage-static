const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Replaces the titles that apply-seo-bulk-v2.js cut at 30 characters ("Modelo San...")
// and the description template it repeated on every page. Priority pages get a
// curated title and description; the rest are built from their own H1.
const ROOT_DIR = path.join(__dirname, '..');
const MAX_TITLE = 65;

const CURATED = {
    'index.html': {
        title: 'Cocinas Integrales, Closets y Puertas en San Luis Potosí | MYMCE',
        desc: 'Carpintería residencial en San Luis Potosí desde 1987: cocinas integrales, closets, vestidores, puertas, muebles de baño y maquila de partes. Cotiza tu proyecto.'
    },
    'servicios/index.html': {
        title: 'Servicios de Carpintería Residencial en San Luis Potosí | MYMCE',
        desc: 'Cocinas integrales, closets y vestidores, puertas, muebles de baño, escritorios y maquila de partes en San Luis Potosí. Diseño, fabricación e instalación.'
    },
    'servicios/cocinas/index.html': {
        title: 'Cocinas Integrales a Medida en San Luis Potosí | Grupo MYMCE',
        desc: 'Diseño, fabricación e instalación de cocinas integrales a medida en San Luis Potosí. Proyecto llave en mano, materiales de calidad y asesoría. Cotiza hoy.'
    },
    'servicios/closets-vestidores/index.html': {
        title: 'Closets y Vestidores a Medida en San Luis Potosí | MYMCE',
        desc: 'Fabricamos closets y vestidores a medida en San Luis Potosí: diseño personalizado, herrajes de calidad e instalación. Aprovecha cada espacio. Cotiza hoy.'
    },
    'servicios/diseno-y-fabricacion-de-puertas/index.html': {
        title: 'Fábrica de Puertas de Madera y PVC en San Luis Potosí | MYMCE',
        desc: 'Fábrica de puertas a medida en San Luis Potosí: puertas de madera, recubiertas con PVC, laminado, chapa de madera y melamina. Para casas y desarrollos.'
    },
    'servicios/diseno-y-fabricacion-de-muebles-de-bano/index.html': {
        title: 'Muebles de Baño a Medida en San Luis Potosí | Grupo MYMCE',
        desc: 'Diseño y fabricación de muebles de baño a medida en San Luis Potosí: gabinetes, vanities y almacenamiento resistentes a la humedad. Cotiza tu proyecto.'
    },
    'servicios/maquila-de-partes/index.html': {
        title: 'Maquila de Partes y Corte de Tableros en San Luis Potosí | MYMCE',
        desc: 'Maquila de partes para carpintería en San Luis Potosí: corte de tableros, enchapado de cantos y piezas a medida para carpinteros, cocinistas y constructoras.'
    },
    'servicios/puertas-y-piezas-recubiertas-con-foil-pvc/index.html': {
        title: 'Puertas y Piezas Recubiertas con Foil PVC en SLP | MYMCE',
        desc: 'Fabricamos puertas y piezas recubiertas con foil PVC en San Luis Potosí para cocinas, closets y muebles. Acabados uniformes y fáciles de limpiar.'
    },
    'servicios/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc/index.html': {
        title: 'Puertas de Gabinete y Frentes de Cajón en Foil PVC | MYMCE SLP',
        desc: 'Puertas de gabinete y frentes de cajón en MDF forrados con foil PVC, fabricados en San Luis Potosí para cocinistas, carpinteros y constructoras.'
    },
    'servicios/pvc-foil-covered-cabinet-doors-drawer-fronts/index.html': {
        title: 'PVC Foil Cabinet Doors and Drawer Fronts, Mexico | MYMCE',
        desc: 'PVC foil covered MDF cabinet doors and drawer fronts made to order in San Luis Potosí, Mexico, for kitchen makers, cabinet shops and developers.'
    },
    'servicios/diseno-y-fabricacion-de-escritorios/index.html': {
        title: 'Escritorios a Medida en San Luis Potosí | Grupo MYMCE',
        desc: 'Diseño y fabricación de escritorios a medida en San Luis Potosí para casa y oficina. Medidas, acabados y almacenamiento a tu gusto. Cotiza tu proyecto.'
    },
    'equipamiento/index.html': {
        title: 'Electrodomésticos para Cocinas Integrales en SLP | MYMCE',
        desc: 'Venta de electrodomésticos para cocinas integrales en San Luis Potosí: campanas, parrillas, hornos y más, integrados al diseño de tu cocina.'
    }
};

const PORTFOLIO_KIND = {
    'Cocina': 'Cocina integral',
    'Closets': 'Closets',
    'Closets y Vestidores': 'Closets y vestidores'
};

function decode(text) {
    return text.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
}

function encode(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function capitalize(word) {
    return word.charAt(0) + word.slice(1).toLowerCase();
}

function h1Text(content) {
    const m = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    return m ? decode(m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) : '';
}

// "Cocina, VALLE REAL, Modelo San Alberto en San Luis Potosí" -> parts, or null.
function portfolioParts(h1) {
    const m = h1.match(/^(.+?),\s*([A-ZÁÉÍÓÚÑ ]+),\s*Modelo\s+(.+?)\s+en\s+San Luis Potos[ií]$/);
    if (!m) return null;
    return { kind: m[1].trim(), development: m[2].trim().split(/\s+/).map(capitalize).join(' '), model: m[3].trim() };
}

function fitTitle(base) {
    for (const suffix of [' | Grupo MYMCE', ' | MYMCE']) {
        if ((base + suffix).length <= MAX_TITLE) return base + suffix;
    }
    const short = base.replace(/ en San Luis Potos[ií]$/, ' en SLP');
    if ((short + ' | MYMCE').length <= MAX_TITLE) return short + ' | MYMCE';
    return short;
}

function setTitle(content, title) {
    return content.replace(/<title>[^<]*<\/title>/, `<title>${encode(title)}</title>`);
}

function setDescription(content, desc) {
    return content.replace(/(<meta name="description" content=")[^"]*(")/, `$1${encode(desc)}$2`);
}

const files = glob.sync('**/index.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });
let modifiedCount = 0;

files.forEach(file => {
    const rel = file.replace(/\\/g, '/');
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // The old template appended "en San Luis Potosí" even when the H1 already named it.
    content = content.replace(/(<meta name="description" content="[^"]*?)\s+en (?:SLP|San Luis Potos[ií]) en San Luis Potosí\./, '$1 en San Luis Potosí.');

    if (CURATED[rel]) {
        content = setTitle(content, CURATED[rel].title);
        content = setDescription(content, CURATED[rel].desc);
    } else {
        const currentTitle = (content.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
        const h1 = currentTitle.includes('...') ? h1Text(content) : '';
        const parts = h1 && rel.startsWith('portafolio/') ? portfolioParts(h1) : null;
        if (parts) {
            content = setTitle(content, fitTitle(`${parts.kind} ${parts.development}, Modelo ${parts.model} en San Luis Potosí`));
            const kind = PORTFOLIO_KIND[parts.kind] || parts.kind;
            content = setDescription(content, `${kind} a medida para la casa modelo ${parts.model} del fraccionamiento ${parts.development}, San Luis Potosí. Diseño, fabricación e instalación de Grupo MYMCE.`);
        } else if (h1) {
            content = setTitle(content, fitTitle(h1.replace(/\s*\|.*$/, '')));
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
