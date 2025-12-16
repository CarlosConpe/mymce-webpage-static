const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

// Decoder function for Cloudflare text
// Though I know it is contacto@grupomymce.com, I can write a generic decoder if I want to be 100% sure for all links.
// But they probably all point to the same one.
// Let's implement the decoder just in case.
function cfDecodeEmail(encodedString) {
    let email = "";
    let r = parseInt(encodedString.substr(0, 2), 16);
    for (let n = 2; n < encodedString.length; n += 2) {
        let c = parseInt(encodedString.substr(n, 2), 16) ^ r;
        email += String.fromCharCode(c);
    }
    return email;
}

const files = glob.sync('**/*.html', { cwd: process.cwd(), ignore: ['node_modules/**', 'dist/**'] });

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    let modified = false;

    // 1. Find all links to cdn-cgi OR elements with data-cfemail
    $('a[href*="/cdn-cgi/l/email-protection"], .__cf_email__').each((i, el) => {
        let email = null;

        // Strategy A: Hash in href
        const href = $(el).attr('href');
        if (href && href.includes('#')) {
            const hash = href.split('#')[1];
            if (hash) email = cfDecodeEmail(hash);
        }

        // Strategy B: data-cfemail attribute
        const dataCf = $(el).attr('data-cfemail');
        if (!email && dataCf) {
            email = cfDecodeEmail(dataCf);
        }

        if (email) {
            // If this is an <a> tag, fix href and text
            if ($(el).is('a')) {
                $(el).attr('href', `mailto:${email}`);
                $(el).text(email);
                $(el).removeAttr('data-cfemail'); // clean up
                $(el).removeClass('__cf_email__');
            }
            // If it's a span inside an a tag
            else if ($(el).is('span')) {
                const parent = $(el).closest('a');
                if (parent.length) {
                    parent.attr('href', `mailto:${email}`);
                    parent.text(email); // Replace the whole span with text in the parent
                } else {
                    // Just replace the span itself if no parent link
                    $(el).replaceWith(email);
                }
            }
            modified = true;
        }
    });

    // 3. Remove the decoding script
    $('script[src*="email-decode.min.js"]').each((i, el) => {
        $(el).remove();
        modified = true;
    });

    // 3b. Remove the data-cfasync="false" from other scripts if it's just noise? 
    // Usually harmless to keep, but let's clean it if we see the specific block.
    // The script tag was: <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js" defer="defer"></script>
    // This is handled by above selector.

    if (modified) {
        fs.writeFileSync(filePath, $.html());
        console.log(`Fixed emails in: ${file}`);
    }
});
