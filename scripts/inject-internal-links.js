
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.';

const LINK_MAPPING = {
    // Keyword in blog post -> Link to Service Page
    'cocina': '/services/diseno-y-fabricacion-de-cocinas-integrales',
    'closet': '/services/diseno-y-fabricacion-de-closets-y-vestidores',
    'vestidor': '/services/diseno-y-fabricacion-de-closets-y-vestidores',
    'puerta': '/services/diseno-y-fabricacion-de-puertas',
    'baño': '/services/diseno-y-fabricacion-de-muebles-de-bano',
    'escritorio': '/services/diseno-y-fabricacion-de-escritorios'
};

async function injectInternalLinks() {
    console.log('Creating Internal Linking Silos...');
    let updatedCount = 0;

    const htmlFiles = glob.sync('blog/**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip']
    });

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // Find the main content area (assuming .hc_text_block_cnt or just paragraphs)
        $('p').each((i, el) => {
            let html = $(el).html();

            // Limit to one link per paragraph to avoid spam
            let linkAdded = false;

            for (const [keyword, url] of Object.entries(LINK_MAPPING)) {
                if (linkAdded) break;

                // Regex to find keyword not already inside a link
                const regex = new RegExp(`\\b(${keyword}[a-z]*)\\b(?![^<]*>|[^<>]*<\/a>)`, 'i');

                if (regex.test(html)) {
                    // Replace first occurrence only
                    const newHtml = html.replace(regex, `<a href="${url}" title="Ver servicios de $1">$1</a>`);

                    if (newHtml !== html) {
                        $(el).html(newHtml);
                        modified = true;
                        linkAdded = true;
                        // console.log(`Injected Link in ${file}: ${keyword} -> ${url}`);
                    }
                }
            }
        });

        if (modified) {
            await fs.writeFile(filePath, $.html());
            updatedCount++;
        }
    }

    console.log(`Internal Linking Complete. Modified ${updatedCount} blog posts.`);
}

injectInternalLinks().catch(console.error);
