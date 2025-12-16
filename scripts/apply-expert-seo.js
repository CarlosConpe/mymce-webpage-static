const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

const SEARCH_DIR = path.resolve(__dirname, '../');
const BASE_URL = 'https://www.grupomymce.com';

// Configuration for specific H1 overrides based on analysis
const H1_OVERRIDES = {
    'services/venta-de-electrodomesticos/index.html': 'Venta de Electrodomésticos para Cocinas Integrales en SLP',
    'services/servicios-carpinteria/index.html': 'Servicios de Carpintería Residencial y Fabricación en SLP',
    'services/maquila-de-partes/index.html': 'Maquila y Corte de Tableros en San Luis Potosí',
    'services/diseno-y-fabricacion-de-escritorios/index.html': 'Diseño y Fabricación de Escritorios a Medida en SLP',
    'services/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi/index.html': 'Acerca de MYMCE: Carpintería Premium en San Luis Potosí'
};

function applyExpertSeo() {
    console.log('🚀 Starting Expert SEO Implementation...');

    const htmlFiles = glob.sync(`${SEARCH_DIR}/**/*.html`, {
        ignore: [
            `${SEARCH_DIR}/scripts/**`,
            `${SEARCH_DIR}/node_modules/**`,
            `${SEARCH_DIR}/google*.html`,
            `${SEARCH_DIR}/_site/**`,
            `${SEARCH_DIR}/assets/core/**`,
            `${SEARCH_DIR}/assets/lib/**`
        ]
    });

    let stats = {
        canonicalsAdded: 0,
        h1sOptimized: 0,
        geoInjected: 0,
        linksInjected: 0
    };

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        const relativePath = path.relative(SEARCH_DIR, file).replace(/\\/g, '/');
        let modified = false;

        // 1. CANONICALIZATION
        // -------------------------
        const canonicalPath = relativePath.replace('index.html', '').replace(/\.html$/, '');
        const canonicalUrl = `${BASE_URL}/${canonicalPath}`.replace(/\/$/, '') + '/'; // Ensure trailing slash for directory structure

        // Remove existing canonical to avoid duplicates
        $('link[rel="canonical"]').remove();
        $('head').append(`<link rel="canonical" href="${canonicalUrl}">`);
        if (!content.includes('rel="canonical"')) stats.canonicalsAdded++; // Rough count
        modified = true;


        // 2. SEMANTIC H1 OPTIMIZATION
        // -------------------------
        if (H1_OVERRIDES[relativePath]) {
            $('h1').text(H1_OVERRIDES[relativePath]);
            stats.h1sOptimized++;
            modified = true;
        } else {
            // General Heuristic: If H1 is short and missing geo-terms, append SLP
            const h1 = $('h1').first();
            const h1Text = h1.text().trim();
            if (h1Text.length > 5 && h1Text.length < 40 && !h1Text.toLowerCase().includes('san luis potosí') && !h1Text.toLowerCase().includes('slp') && !h1Text.toLowerCase().includes('mymce')) {
                // Ensure it's not a blog post title (often long)
                if (!relativePath.includes('blog/')) {
                    h1.text(`${h1Text} en San Luis Potosí`);
                    stats.h1sOptimized++;
                    modified = true;
                }
            }
        }


        // 3. GEO-CONTEXT INJECTION
        // -------------------------
        // Find the first paragraph in the main content area
        const p = $('article p').first().length ? $('article p').first() : $('body p').first();
        const pText = p.text().trim();

        if (pText.length > 50 && !pText.toLowerCase().includes('san luis potosí') && !pText.toLowerCase().includes('slp')) {
            // Check if it ends in punctuation
            if (/[.!?]$/.test(pText)) {
                // Append geo context naturally
                const newText = `${pText} Estamos orgullosos de servir a todo San Luis Potosí con la mejor calidad.`;
                p.text(newText);
                stats.geoInjected++;
                modified = true;
            }
        }

        // 4. AUTHORITY INTERLINKING (Simple Keyword Match)
        // -------------------------
        // Map "Cocina" -> Kitchens URL, "Closet" -> Closets URL
        if (relativePath.includes('blog/')) {
            const body = $('article').length ? $('article') : $('body');
            let bodyHtml = body.html();

            // Only if not already linked
            if (!bodyHtml.includes('services/diseno-y-fabricacion-de-cocinas-integrales')) {
                const keyword = 'cocinas integrales';
                const regex = new RegExp(`(^|\\s)(${keyword})(\\s|\\.|,)`, 'i');
                if (regex.test(bodyHtml)) {
                    // Careful replacement to avoid breaking attributes
                    // Ideally use text nodes traversal, but for simple static site this regex approach on paragraphs is safer
                    $('p').each((i, el) => {
                        let html = $(el).html();
                        if (!html.includes('<a') && regex.test(html)) {
                            // Replace first occurrence only
                            $(el).html(html.replace(regex, `$1<a href="/services/diseno-y-fabricacion-de-cocinas-integrales/" title="Cocinas Integrales en SLP">$2</a>$3`));
                            stats.linksInjected++;
                            return false; // Break loop
                        }
                    });
                    modified = true;
                }
            }
        }

        if (modified) {
            fs.writeFileSync(file, $.html());
        }
    });

    console.log(`\n✅ Optimization Complete!`);
    console.log(`- Canonicals Added/Fixed: ${stats.canonicalsAdded}+ (All pages covered)`);
    console.log(`- H1s Optimized: ${stats.h1sOptimized}`);
    console.log(`- Geo-Context Injected: ${stats.geoInjected}`);
    console.log(`- Internal Links Created: ${stats.linksInjected}`);
}

applyExpertSeo();
