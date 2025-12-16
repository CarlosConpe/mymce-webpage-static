const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const SITE_ROOT = '.'; 

async function cleanHtml() {
    console.log('Starting sanitization...');
    const files = glob.sync('**/*.html', { cwd: SITE_ROOT, ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip'] });
    console.log(`Found ${files.length} HTML files to process.`);

    for (const file of files) {
        const filePath = path.join(SITE_ROOT, file);
        let content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);

        // 1. Remove WP Bloat
        $('link[rel="https://api.w.org/"]').remove();
        $('link[rel="EditURI"]').remove();
        $('meta[name="generator"]').remove();
        $('#rocket-preload-links-js-extra').remove();
        $('link[rel="shortlink"]').remove();
        $('link[rel="wlwmanifest"]').remove();
        
        // Remove WP JSON links
        $('link[rel="alternate"][type="application/json+oembed"]').remove();
        $('link[rel="alternate"][type="text/xml+oembed"]').remove();

        // 2. Fix Forms (Formspree)
        $('form').each((i, el) => {
            const form = $(el);
            // Check if it's a contact form (usually has method="post" or specific classes)
            if (form.attr('method') === 'post' || form.hasClass('form-ajax')) {
                form.removeClass('form-ajax form-ajax-wp');
                // Use a placeholder ID. The user will need to update this.
                form.attr('action', 'https://formspree.io/f/PLACEHOLDER_FORM_ID');
                
                // Ensure hidden subject field exists
                if (form.find('input[name="_subject"]').length === 0) {
                    form.append('<input type="hidden" name="_subject" value="New submission from website">');
                }
                
                // Remove WP specific hidden inputs if any
                form.find('input[name="_wpcf7"]').remove();
                form.find('input[name="_wpcf7_version"]').remove();
                form.find('input[name="_wpcf7_locale"]').remove();
                form.find('input[name="_wpcf7_unit_tag"]').remove();
                form.find('input[name="_wpcf7_container_post"]').remove();
            }
        });

        // 3. Remove "localhost" references
        // We do this on the HTML string to catch everything
        let html = $.html();
        
        // Replace localhost with production domain (or empty string for relative if appropriate, but sameAs needs absolute)
        // We'll use a placeholder for now or the likely domain 'https://www.grupomymce.com'
        html = html.replace(/http:\/\/localhost/g, 'https://www.grupomymce.com');
        
        // Also fix any https://localhost just in case
        html = html.replace(/https:\/\/localhost/g, 'https://www.grupomymce.com');

        await fs.writeFile(filePath, html);
        // console.log(`Processed ${file}`);
    }
    console.log('Sanitization complete.');
}

cleanHtml().catch(console.error);
