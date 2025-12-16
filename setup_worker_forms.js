const fs = require('fs');
const glob = require('glob');
const path = require('path');
const cheerio = require('cheerio');

// 1. Find all HTML files
const files = glob.sync('**/*.html', { ignore: ['node_modules/**', 'dist/**'] });

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(content);
    let modified = false;

    // 2. Find Forms
    const forms = $('form[action*="formspree.io"]');
    if (forms.length > 0) {
        forms.each((i, el) => {
            // Update attributes for Worker
            $(el).attr('data-worker-form', 'true');
            $(el).removeAttr('action');
            $(el).removeAttr('method'); // handled by JS

            // Optional: clean up old data-email attributes if present
            // $(el).removeAttr('data-email'); 
        });
        modified = true;
    }

    // 3. Inject Script (Only if forms were found OR it's a contact page)
    // Actually, safest to inject everywhere forms are modified.
    if (modified) {
        // Check if script already exists
        if ($('script[src*="email-client.js"]').length === 0) {
            $('body').append('<script src="/assets/js/email-client.js" defer></script>\n');
        }
    }

    if (modified) {
        fs.writeFileSync(file, $.html());
        console.log(`Updated: ${file}`);
    }
});
