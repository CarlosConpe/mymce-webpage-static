const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'assets', 'js', 'search-index.json');

const DIRS_TO_SCAN = [
    'portafolio',
    'servicios-carpinteria',
    'soluciones',
    'corporate'
];

// Manual Synonym/Keyword Map to "smarten" up the search
const SYNONYMS = {
    'cocina': ['gabinete', 'estufa', 'encimera', 'isla', 'alacena', 'mueble de cocina'],
    'closet': ['armario', 'ropero', 'vestidor', 'guardarropa', 'cajonera', 'repisa'],
    'puerta': ['entrada', 'acceso', 'madera', 'principal', 'interiores'],
    'baño': ['vanity', 'lavabo', 'gabinete de baño', 'sanitario'],
    'escritorio': ['oficina', 'mesa de trabajo', 'estudio', 'mueble de oficina'],
    'residencial': ['casa', 'hogar', 'fraccionamiento', 'modelo']
};

function getSynonyms(text) {
    let extra = [];
    const lower = text.toLowerCase();
    for (const [key, terms] of Object.entries(SYNONYMS)) {
        if (lower.includes(key)) {
            extra = extra.concat(terms);
        }
    }
    return extra.join(' ');
}

// Helper to check if file should be indexed
function shouldIndex(filename) {
    if (!filename.endsWith('.html')) return false;
    // Index specific files
    return true;
}

// Helper to get relative path
function getRelativePath(absolutePath) {
    let rel = path.relative(ROOT_DIR, absolutePath);
    return '/' + rel.replace(/\\/g, '/');
}

const entries = [];

console.log('Building smart search index...');

DIRS_TO_SCAN.forEach(dirName => {
    const fullPath = path.join(ROOT_DIR, dirName);
    if (!fs.existsSync(fullPath)) return;

    function scanDir(directory) {
        const files = fs.readdirSync(directory);
        files.forEach(file => {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                scanDir(filePath);
            } else if (shouldIndex(file)) {
                processFile(filePath, dirName);
            }
        });
    }
    scanDir(fullPath);
});

// Index root pages if needed
// processFile(path.join(ROOT_DIR, 'index.html'), 'home');

function processFile(filePath, section) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);

        // 1. Title
        let title = $('title').text().split('|')[0].trim();
        if (!title) title = $('h1').first().text().trim();
        if (!title) return;

        // 2. Description
        let description = $('meta[name="description"]').attr('content');
        if (!description) {
            description = $('p').first().text().trim().substring(0, 150) + '...';
        }

        // 3. Image Strategy
        let image = '';

        // Priority 1: Hero Background Image (The big banner)
        const heroStyle = $('.header-title').attr('style');
        if (heroStyle && heroStyle.includes('background-image')) {
            const match = heroStyle.match(/url\((['"]?)(.*?)\1\)/);
            if (match && match[2]) {
                image = match[2];
            }
        }

        // Priority 2: OG Image
        if (!image) {
            image = $('meta[property="og:image"]').attr('content');
        }

        // Priority 3: First Content Image (Filtered)
        if (!image) {
            // finding the first image in the main content columns, ignoring headers/footers
            const contentImg = $('.hc_column_cnt img, .wp-block-image img').first().attr('src');
            if (contentImg) image = contentImg;
        }

        // Fallback or Normalize
        if (image && !image.startsWith('http') && !image.startsWith('/')) {
            image = '/' + image;
        }

        // 4. URL
        const url = getRelativePath(filePath);

        // 5. Category (Smarter logic)
        let category = 'General';
        const urlLower = url.toLowerCase();
        if (urlLower.includes('cocina')) category = 'Cocinas';
        else if (urlLower.includes('closet') || urlLower.includes('vestidor')) category = 'Closets';
        else if (urlLower.includes('puerta')) category = 'Puertas';
        else if (urlLower.includes('bano') || urlLower.includes('baño')) category = 'Baños';
        else if (urlLower.includes('escritorio')) category = 'Escritorios';
        else if (urlLower.includes('soluciones')) category = 'Soluciones';
        else if (urlLower.includes('corporate') || urlLower.includes('blog')) category = 'Blog';

        // 6. Keywords (Meta + Synonyms)
        let keywords = $('meta[name="keywords"]').attr('content') || '';
        keywords += ' ' + getSynonyms(title + ' ' + description + ' ' + category);

        // 7. Body (Cleaned)
        // Remove nav, footer, scripts, styles to get "real" content
        $('nav, footer, header, script, style, iframe, .menu, .sidebar, .comments, .related-posts, .common-boilerplate, .cta-section').remove();

        // Remove specific boilerplate text found in the index inspection
        let body = $('body').text()
            .replace(/Estamos orgullosos de servir a todo San Luis Potosí con la mejor calidad/g, '')
            .replace(/Contáctanos Ahora/g, '')
            .replace(/¡Comprar en Linea!/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000);

        entries.push({
            id: url,
            title: title,
            description: description || '',
            image: image || '/assets/storage/2016/12/169471652699961817.webp',
            category: category,
            keywords: keywords.trim(),
            body: body
        });

    } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
    }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));
console.log(`Successfully indexed ${entries.length} pages (Smart Mode) to ${OUTPUT_FILE}`);
