const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const BASE_DIR = path.resolve(__dirname, '../');

// 1. Definition of Moves
const MOVES = [
    // Corporate
    { src: 'services/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi', dest: 'corporate/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi' },
    { src: 'contact', dest: 'corporate/contact' },
    { src: 'blog', dest: 'corporate/blog' },
    { src: 'politica-privacidad', dest: 'corporate/politica-privacidad' },
    { src: 'preguntas-frecuentes', dest: 'corporate/preguntas-frecuentes' },

    // Soluciones
    { src: 'services/carpinteria-para-arquitectos', dest: 'soluciones/carpinteria-para-arquitectos' },
    { src: 'services/carpinteria-para-clientes-finales', dest: 'soluciones/carpinteria-para-particulares' }, // Rename
    { src: 'services/carpinteria-para-cocinistas', dest: 'soluciones/carpinteria-para-cocinistas' },
    { src: 'services/carpinteria-para-constructoras', dest: 'soluciones/carpinteria-para-constructoras' },

    // Servicios Carpinteria (Products)
    // Note: 'services/servicios-carpinteria' is likely the index page for services.
    { src: 'services/servicios-carpinteria', dest: 'servicios-carpinteria' }, // Moving to root as the index? Or as a folder? Let's check logic.
    // If we move everything INTO servicios-carpinteria, then the original 'services/servicios-carpinteria' page should probably become 'servicios-carpinteria/index.html' (which it likely is)
    // Actually, services/servicios-carpinteria IS a directory.

    // Detailed Product Pages
    { src: 'services/diseno-y-fabricacion-de-cocinas-integrales', dest: 'servicios-carpinteria/diseno-y-fabricacion-de-cocinas-integrales' },
    { src: 'services/diseno-y-fabricacion-de-closets-y-vestidores', dest: 'servicios-carpinteria/diseno-y-fabricacion-de-closets-y-vestidores' },
    { src: 'services/diseno-y-fabricacion-de-puertas', dest: 'servicios-carpinteria/diseno-y-fabricacion-de-puertas' },
    { src: 'services/diseno-y-fabricacion-de-muebles-de-bano', dest: 'servicios-carpinteria/diseno-y-fabricacion-de-muebles-de-bano' },
    { src: 'services/diseno-y-fabricacion-de-escritorios', dest: 'servicios-carpinteria/diseno-y-fabricacion-de-escritorios' },
    { src: 'services/maquila-de-partes', dest: 'servicios-carpinteria/maquila-de-partes' },
    { src: 'services/venta-de-electrodomesticos', dest: 'servicios-carpinteria/venta-de-electrodomesticos' },

    // Sub-pages of Puertas (currently at root/services level)
    { src: 'services/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc', dest: 'servicios-carpinteria/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc' },
    { src: 'services/puertas-y-piezas-recubiertas-con-foil-pvc', dest: 'servicios-carpinteria/puertas-y-piezas-recubiertas-con-foil-pvc' },
    { src: 'services/pvc-foil-covered-cabinet-doors-drawer-fronts', dest: 'servicios-carpinteria/pvc-foil-covered-cabinet-doors-drawer-fronts' },

    // Portfolio Consolidation
    // Move all parallel folders from portfolio/* to portafolio/*
    // But 'portfolio' has 83 items (all project folders). 'portafolio' only has index.html.
    // So we move folders from 'portfolio' to 'portafolio'.
    { src: 'portfolio', dest: 'portafolio', type: 'merge_children' }
];

// 2. Definition of Link Replacements (Order matters! More specific first)
const REPLACEMENTS = [
    // Direct matches
    { old: '/services/carpinteria-para-clientes-finales', new: '/soluciones/carpinteria-para-particulares' },
    { old: '/services/carpinteria-para-arquitectos', new: '/soluciones/carpinteria-para-arquitectos' },
    { old: '/services/carpinteria-para-cocinistas', new: '/soluciones/carpinteria-para-cocinistas' },
    { old: '/services/carpinteria-para-constructoras', new: '/soluciones/carpinteria-para-constructoras' },

    { old: '/services/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi', new: '/corporate/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi' },

    { old: '/contact', new: '/corporate/contact' },
    { old: '/blog', new: '/corporate/blog' },
    { old: '/politica-privacidad', new: '/corporate/politica-privacidad' },
    { old: '/preguntas-frecuentes', new: '/corporate/preguntas-frecuentes' },

    // Services -> Servicios Carpinteria
    // Common mixed slash issues: /services\name -> /servicios-carpinteria/name

    // Pattern generator to capture /services/X and /services\X
    // And also /servicios/ references if they exist

    { regex: /\/services[\\\/]diseno-y-fabricacion-de-cocinas-integrales/gi, replace: '/servicios-carpinteria/diseno-y-fabricacion-de-cocinas-integrales' },
    { regex: /\/services[\\\/]diseno-y-fabricacion-de-closets-y-vestidores/gi, replace: '/servicios-carpinteria/diseno-y-fabricacion-de-closets-y-vestidores' },
    { regex: /\/services[\\\/]diseno-y-fabricacion-de-puertas/gi, replace: '/servicios-carpinteria/diseno-y-fabricacion-de-puertas' },
    { regex: /\/services[\\\/]diseno-y-fabricacion-de-muebles-de-bano/gi, replace: '/servicios-carpinteria/diseno-y-fabricacion-de-muebles-de-bano' },
    { regex: /\/services[\\\/]diseno-y-fabricacion-de-escritorios/gi, replace: '/servicios-carpinteria/diseno-y-fabricacion-de-escritorios' },
    { regex: /\/services[\\\/]maquila-de-partes/gi, replace: '/servicios-carpinteria/maquila-de-partes' },
    { regex: /\/services[\\\/]venta-de-electrodomesticos/gi, replace: '/servicios-carpinteria/venta-de-electrodomesticos' },
    { regex: /\/services[\\\/]electrodomesticos/gi, replace: '/servicios-carpinteria/venta-de-electrodomesticos' }, // found in logs

    // Sub-pages of Puertas
    { regex: /\/services[\\\/]puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc/gi, replace: '/servicios-carpinteria/puertas-frentes-de-cajon-en-mdf-forrados-con-foil-pvc' },
    { regex: /\/services[\\\/]puertas-y-piezas-recubiertas-con-foil-pvc/gi, replace: '/servicios-carpinteria/puertas-y-piezas-recubiertas-con-foil-pvc' },
    { regex: /\/services[\\\/]pvc-foil-covered-cabinet-doors-drawer-fronts/gi, replace: '/servicios-carpinteria/pvc-foil-covered-cabinet-doors-drawer-fronts' },

    // Old static links
    { regex: /\/servicios\//g, replace: '/servicios-carpinteria/' },

    // Fix FAQ, Acerca De, Privacy (handling trailing quote or slash)
    { regex: /href="\/faq\/?["']/g, replace: 'href="/corporate/preguntas-frecuentes/"' },
    { regex: /href="\/acerca-de\/?["']/g, replace: 'href="/corporate/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi/"' },
    { regex: /href="\/politica-privacidad\/?["']/g, replace: 'href="/corporate/politica-privacidad/"' },

    // Blog Pattern: Match /blog/ANYTHING -> /corporate/blog/ANYTHING
    // Be careful not to double replace if run multiple times.
    // Check if it already starts with /corporate/blog
    { regex: /href="\/blog\/([^"]+)"/g, replace: 'href="/corporate/blog/$1"' },
    // Catch bare /blog link
    { regex: /href="\/blog\/?["']/g, replace: 'href="/corporate/blog/"' },

    // Categories: seem missing, redirect to blog index
    { regex: /href="\/category\/([^"]+)"/g, replace: 'href="/corporate/blog/"' },

    // The Services Index
    { regex: /\/services[\\\/]servicios-carpinteria/gi, replace: '/servicios-carpinteria' },

    // Portfolio
    { regex: /\/portfolio\//g, replace: '/portafolio/' },
    // Fix broken portafolio links that might lack slash
    { regex: /href="\/portafolio([^"/]+)"/g, replace: 'href="/portafolio/$1"' } // Risky?
];

async function runRefactor() {
    console.log('Starting structural refactor...');

    // A. Move Files
    for (const move of MOVES) {
        const srcPath = path.join(BASE_DIR, move.src);
        const destPath = path.join(BASE_DIR, move.dest);

        // Ensure dest dir exists
        fs.ensureDirSync(path.dirname(destPath));

        if (!fs.existsSync(srcPath)) {
            console.warn(`Source not found, skipping: ${move.src}`);
            continue;
        }

        if (move.type === 'merge_children') {
            console.log(`Merging Children: ${move.src} -> ${move.dest}`);
            // Move contents of src to dest
            const children = fs.readdirSync(srcPath);
            for (const child of children) {
                const childSrc = path.join(srcPath, child);
                const childDest = path.join(destPath, child);
                try {
                    await fs.move(childSrc, childDest, { overwrite: true });
                } catch (e) {
                    console.error(`Failed to move ${childSrc}: ${e.message}`);
                }
            }
            // Remove empty src
            try { await fs.remove(srcPath); } catch (e) { }
        } else {
            console.log(`Moving: ${move.src} -> ${move.dest}`);
            try {
                await fs.move(srcPath, destPath, { overwrite: true });
            } catch (err) {
                console.warn(`Move failed, trying copy+remove for ${move.src}`);
                try {
                    await fs.copy(srcPath, destPath, { overwrite: true });
                    await fs.remove(srcPath);
                    console.log(`Copy+Remove successful for ${move.src}`);
                } catch (err2) {
                    console.error(`CRITICAL FAILURE moving ${move.src}: ${err2.message}`);
                }
            }
        }
    }

    // Clean up empty 'services' directory if needed
    const servicesPath = path.join(BASE_DIR, 'services');
    if (fs.existsSync(servicesPath) && fs.readdirSync(servicesPath).length === 0) {
        console.log('Removing empty services directory');
        fs.rmdirSync(servicesPath);
    }

    // B. Update Links in HTML Files
    console.log('Updating links in HTML files...');
    const htmlFiles = glob.sync(`${BASE_DIR}/**/*.html`, {
        ignore: [`${BASE_DIR}/node_modules/**`, `${BASE_DIR}/.git/**`]
    });

    for (const file of htmlFiles) {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // 1. Text-based replacement for simple hrefs
        REPLACEMENTS.forEach(rep => {
            if (rep.regex) {
                if (rep.regex.test(content)) {
                    content = content.replace(rep.regex, rep.replace);
                    modified = true;
                }
            } else {
                // Global replace using simple regex escape
                const regex = new RegExp(`href="${rep.old}"`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, `href="${rep.new}"`);
                    modified = true;
                }
                const regex2 = new RegExp(`href='${rep.old}'`, 'g');
                if (regex2.test(content)) {
                    content = content.replace(regex2, `href='${rep.new}'`);
                    modified = true;
                }

                // Also check for trailing slashes variations often found in menus
                const oldSlash = rep.old.endsWith('/') ? rep.old : rep.old + '/';
                const newSlash = rep.new.endsWith('/') ? rep.new : rep.new + '/';

                const regex3 = new RegExp(`href="${oldSlash}"`, 'g');
                if (regex3.test(content)) {
                    content = content.replace(regex3, `href="${newSlash}"`);
                    modified = true;
                }
            }
        });

        // 2. Fix Canonical Tags
        // We only need to fix canonicals if the FILE ITSELF moved, or if it points to a moved file.
        // It's safer to just run the replacement logic on the canonical text too.

        const DOMAIN = 'https://www.grupomymce.com';
        REPLACEMENTS.forEach(rep => {
            if (!rep.regex) {
                const oldFull = `${DOMAIN}${rep.old}`;
                const newFull = `${DOMAIN}${rep.new}`;

                // Replace strict matches
                const regexC = new RegExp(oldFull, 'g');
                if (regexC.test(content)) {
                    content = content.replace(regexC, newFull);
                    modified = true;
                }

                // Match with trailing slash
                const oldFullSlash = oldFull.endsWith('/') ? oldFull : oldFull + '/';
                const newFullSlash = newFull.endsWith('/') ? newFull : newFull + '/';
                const regexC2 = new RegExp(oldFullSlash, 'g');
                if (regexC2.test(content)) {
                    content = content.replace(regexC2, newFullSlash);
                    modified = true;
                }
            }
        });

        if (modified) {
            fs.writeFileSync(file, content);
            // console.log(`Updated links in: ${path.relative(BASE_DIR, file)}`);
        }
    }

    console.log('Restructuring Complete.');
}

runRefactor();
