const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

const PORTFOLIO_DIR = path.join(__dirname, '../portafolio');
const INDEX_FILE = path.join(PORTFOLIO_DIR, 'index.html');

console.log('Starting Portfolio Generation...');

// 1. Read the Template (Current Index)
let indexContent = fs.readFileSync(INDEX_FILE, 'utf8');

// Define split points
// We want to keep everything up to <div class="container content "> and everything after <i class="scroll-top...
// Looking at the file content:
// Line 428: <div class="container content ">
// Line 586: </div></div> (Closing content divs)
// Line 587: <i class="scroll-top ...

// Note: String matching is safer than line numbers.
const HEADER_END_MARKER = '<div class="container content ">';
const FOOTER_START_MARKER = '<i class="scroll-top scroll-top-mobile fa fa-sort-asc show"></i><footer';

const headerParts = indexContent.split(HEADER_END_MARKER);
if (headerParts.length < 2) {
    console.error('Could not find HEADER_END_MARKER');
    process.exit(1);
}
const header = headerParts[0] + HEADER_END_MARKER;

const footerParts = indexContent.split(FOOTER_START_MARKER);
if (footerParts.length < 2) {
    console.error('Could not find FOOTER_START_MARKER');
    process.exit(1);
}
// We need to be careful because split removes the delimiter.
// The footer starts exactly at the marker.
// We need to find the last occurrence of the marker if there are multiple (unlikely) or just split.
// Actually, let's just use the second part of the split, but prepend the marker back.
const footer = FOOTER_START_MARKER + footerParts[1];

// 2. Scan Projects
const projectFiles = glob.sync(`${PORTFOLIO_DIR}/*/index.html`);
const projects = [];

projectFiles.forEach(file => {
    if (file === INDEX_FILE) return; // Skip the main index itself

    const relativePath = path.relative(PORTFOLIO_DIR, file);
    const folderName = path.dirname(relativePath);

    // Skip if it's not a direct subfolder (optional check, glob covers this usually)

    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    // Extract Data
    const title = $('title').text().split('|')[0].trim(); // Remove "| MYMCE..."
    let h1 = $('h1').first().text().trim();
    if (!h1) h1 = title;

    // Function to verify if web path exists locally
    function imageExists(webPath) {
        if (!webPath) return false;
        // relative path logic: webPath might start with / or http
        if (webPath.startsWith('http')) {
            if (webPath.includes('grupomymce.com')) {
                webPath = webPath.replace(/^https?:\/\/[^\/]+/, '');
            } else {
                return false; // External image
            }
        }
        webPath = webPath.split('?')[0];
        const localPath = path.join(__dirname, '..', webPath.replace(/^\//, ''));
        return fs.existsSync(localPath);
    }

    // 1. OG Image?
    let image = $('meta[property="og:image"]').attr('content');

    let validImage = null;

    if (imageExists(image)) {
        validImage = image;
    } else {
        // Fallback: look for ANY valid image in .hc_column_cnt
        const contentImages = $('.hc_column_cnt img');
        for (let i = 0; i < contentImages.length; i++) {
            let src = $(contentImages[i]).attr('src');
            if (imageExists(src)) {
                validImage = src;
                break;
            }
            let dataSrc = $(contentImages[i]).attr('data-src');
            if (imageExists(dataSrc)) {
                validImage = dataSrc;
                break;
            }
        }
    }

    // Fuzzy match fallback
    if (!validImage && image) {
        const possibleSuffixes = ['-1', '-2', '-scaled', '-1-1', '-3'];
        const ext = path.extname(image);
        let base = image.slice(0, -ext.length);

        // Handle cases where base itself has a suffix we want to strip/change? 
        // For now just ADD suffixes.
        for (const suffix of possibleSuffixes) {
            const testPath = base + suffix + ext;
            if (imageExists(testPath)) {
                validImage = testPath;
                break;
            }
        }
    }

    // If absolutely nothing found, use a placeholder or keep broken link?
    // Let's keep broken link but maybe log it?
    if (validImage) {
        image = validImage;
    } else {
        console.warn(`Warning: No valid image found for ${title} (${folderName})`);
    }

    // Extract Snippet (First non-empty paragraph)
    let snippet = '';
    const paragraphs = $('.hc_text_block_cnt p, .boxed-inverse p');
    for (let i = 0; i < paragraphs.length; i++) {
        const text = $(paragraphs[i]).text().trim();
        if (text && text.length > 30) {
            snippet = text.substring(0, 120) + '...';
            break;
        }
    }

    // Fallback if no snippet
    if (!snippet) snippet = 'Descubre más detalles sobre este proyecto de carpintería residencial.';

    // Fix relative paths if needed. 
    // If the image path is relative "assets/...", it might need adjustment if logic was different.
    // But usually they are absolute "/assets/..." on this site.

    // Determine Category
    // Heuristic: Look for keywords in Title or URL
    let category = 'otros';
    const lowerText = (title + ' ' + folderName).toLowerCase();

    if (lowerText.includes('cocina')) category = 'cocinas';
    else if (lowerText.includes('closet') || lowerText.includes('vestidor')) category = 'closets';
    else if (lowerText.includes('puerta')) category = 'puertas';
    else if (lowerText.includes('baño') || lowerText.includes('bano')) category = 'banos';

    // Determine Date (Optional, for sorting)
    const dateStr = $('meta[property="article:published_time"]').attr('content');
    const date = dateStr ? new Date(dateStr) : new Date(0);

    projects.push({
        title,
        link: `/portafolio/${folderName}/`, // Ensure trailing slash for consistent linking
        image,
        category,
        date,
        snippet
    });
});

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Randomly shuffle projects
shuffle(projects);

console.log(`Found ${projects.length} projects.`);

// Pick a random background image for the Hero from the projects (or a specific nice one)
// detailed high-res image prefered.
const heroImage = '/assets/storage/2023/08/cocina-17-10-scaled.webp'; // A nice kitchen shot

// Create Rich Hero HTML
const newHeroHtml = `
<div class="header-title ken-burns white" data-parallax="scroll" data-position="top" data-natural-height="850" data-natural-width="1920" data-image-src="${heroImage}">
    <div class="container">
        <div class="title-base">
            <hr class="anima" />
            <h1>Nuestro Portafolio</h1>
            <p>Descubre la calidad y el detalle en cada uno de nuestros proyectos.</p>
        </div>
    </div>
</div>
`;

// Replace the old header-base in the 'header' string
// The old header contains <div class="header-base">...</div>
// We can use regex or string replacement.
// Note: 'header' contains everything UP TO <div class="container content ">
// verifying content of 'header':
// ... </header> <div class="header-base"> ... </div> <div class="container content "> (MARKER IS AT END)

let newHeader = header;
// Remove the old header-base block
newHeader = newHeader.replace(/<div class="header-base">[\s\S]*?<\/div>/, newHeroHtml);

// 3. Generate HTML
let gridHtml = `
<style>
/* Custom Portfolio Grid CSS */
.portfolio-filters .btn {
    border-radius: 50px;
    padding: 8px 20px;
    margin: 0 5px;
    border: 1px solid #ddd;
    background: #fff;
    color: #555;
    transition: all 0.3s ease;
}
.portfolio-filters .btn:hover, .portfolio-filters .btn.active {
    background: #355669;
    color: #fff;
    border-color: #355669;
}
.clean-card {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.clean-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}
.clean-card .img-wrap {
    height: 240px;
    overflow: hidden;
    position: relative;
    border-bottom: 1px solid #f0f0f0;
}
.clean-card .img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}
.clean-card:hover .img-wrap img {
    transform: scale(1.05);
}
.clean-card .content-wrap {
    padding: 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
.clean-card h3 {
    font-size: 18px;
    font-weight: 600;
    margin-top: 0;
    margin-bottom: 10px;
    line-height: 1.4;
    color: #333;
}
.clean-card h3 a {
    color: #333;
    text-decoration: none;
}
.clean-card h3 a:hover {
    color: #355669;
}
.clean-card .category-tag {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #888;
    margin-bottom: 8px;
    display: block;
    font-weight: 600;
}
.clean-card p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
    flex-grow: 1;
}
.clean-card .read-more {
    font-size: 14px;
    font-weight: 600;
    color: #355669;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
}
.clean-card .read-more i {
    margin-left: 5px;
    font-size: 12px;
    transition: margin-left 0.2s;
}
.clean-card:hover .read-more i {
    margin-left: 8px;
}
</style>

<div class="row" style="padding-top: 40px; padding-bottom: 30px;">
    <div class="col-md-12 text-center portfolio-filters">
        <h2 style="margin-bottom: 25px;">Nuestros Proyectos</h2>
        <div class="btn-group" role="group" aria-label="Filtros">
            <button type="button" class="btn btn-default active" onclick="filterPortfolio('all', this)">Todos</button>
            <button type="button" class="btn btn-default" onclick="filterPortfolio('cocinas', this)">Cocinas</button>
            <button type="button" class="btn btn-default" onclick="filterPortfolio('closets', this)">Closets</button>
            <button type="button" class="btn btn-default" onclick="filterPortfolio('puertas', this)">Puertas</button>
            <button type="button" class="btn btn-default" onclick="filterPortfolio('banos', this)">Baños</button>
        </div>
    </div>
</div>

<div class="row grid-portfolio" style="min-height: 500px;">
`;

projects.forEach(p => {
    gridHtml += `
    <div class="col-md-4 portfolio-item cat-${p.category}" style="margin-bottom: 30px;">
        <div class="clean-card">
            <a class="img-wrap" href="${p.link}">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
            </a>
            <div class="content-wrap">
                <span class="category-tag">${p.category}</span>
                <h3><a href="${p.link}">${p.title}</a></h3>
                <p>${p.snippet}</p>
                <div style="margin-top: auto;">
                    <a href="${p.link}" class="read-more">
                        Ver Proyecto <i class="fa fa-chevron-right"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
});

gridHtml += `</div>
<script>
function filterPortfolio(category, btn) {
    // Update Active Button
    var buttons = document.querySelectorAll('.portfolio-filters .btn');
    buttons.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    // Filter Items
    var items = document.querySelectorAll('.portfolio-item');
    items.forEach(function(item) {
        if (category === 'all' || item.classList.contains('cat-' + category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
</script>
`;

// 4. Assemble and Write
const newContent = newHeader + gridHtml + '</div>' + footer; // Close container content

fs.writeFileSync(INDEX_FILE, newContent);
console.log('Portfolio Index Generated Successfully!');
