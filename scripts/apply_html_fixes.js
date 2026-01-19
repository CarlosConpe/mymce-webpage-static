const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../');

function processHtmlFiles() {
    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/.git/**`]
    });

    console.log(`Processing ${files.length} HTML files...`);

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        // 1. Fix Mailto Links
        $('a[href^="mailto:"]').each((i, el) => {
            const $el = $(el);
            const href = $el.attr('href');
            const email = href.replace('mailto:', '').split('?')[0]; // simple parsing

            if (email.includes('@')) {
                const [user, domain] = email.split('@');
                $el.attr('href', '#');
                $el.addClass('protected-email');
                $el.attr('data-u', user);
                $el.attr('data-d', domain);

                // Check if text content is the email
                const text = $el.text().trim();
                if (text.includes(email) || text.includes(user + '@')) {
                    $el.attr('data-replace-text', 'true');
                    // Obfuscate current text to avoid scraper detection
                    $el.text('Loading...');
                }
                modified = true;
            }
        });

        // 2. Inject Email Protector Script
        if ($('.protected-email').length > 0) {
            // Check if script already exists
            const scriptSrc = '/assets/js/email-protector.js';
            if ($(`script[src="${scriptSrc}"]`).length === 0) {
                // Append to body
                $('body').append(`<script src="${scriptSrc}" defer></script>`);
                modified = true;
            }
        }

        // 3. Update References to Minified Assets (Basic Replace)
        // This is risky with regex on the whole content, usually better on DOM but specific attributes
        // We will stick to DOM for <link> and <script>

        // CSS
        $('link[rel="stylesheet"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('.min.css') && (href.startsWith('/') || href.startsWith('./') || !href.startsWith('http'))) {
                // Check if minified version exists on disk
                // We need to resolve the path relative to ROOT_DIR
                let absolutePath;
                if (href.startsWith('/')) {
                    absolutePath = path.join(ROOT_DIR, href);
                } else {
                    absolutePath = path.resolve(path.dirname(file), href);
                }

                const minPath = absolutePath.replace(/\.css$/, '.min.css');
                if (fs.existsSync(minPath)) {
                    // Update ref
                    $(el).attr('href', href.replace(/\.css$/, '.min.css'));
                    modified = true;
                }
            }
        });

        // JS
        $('script[src]').each((i, el) => {
            const src = $(el).attr('src');
            if (src && !src.includes('.min.js') && (src.startsWith('/') || src.startsWith('./') || !src.startsWith('http'))) {
                let absolutePath;
                if (src.startsWith('/')) {
                    absolutePath = path.join(ROOT_DIR, src);
                } else {
                    absolutePath = path.resolve(path.dirname(file), src);
                }

                const minPath = absolutePath.replace(/\.js$/, '.min.js');
                if (fs.existsSync(minPath)) {
                    $(el).attr('src', src.replace(/\.js$/, '.min.js'));
                    modified = true;
                }
            }
        });

        if (modified) {
            console.log(`Updated: ${path.relative(ROOT_DIR, file)}`);
        }

        // Post-process with Regex to catch anything Cheerio missed (like <noscript>)
        let finalHtml = $.html();
        let regexModified = false;

        finalHtml = finalHtml.replace(/(["'])([^"']+\.(js|css))(["'])/g, (match, quote, url, ext) => {
            if (url.includes('.min.')) return match;

            // Determine absolute path to check existence
            let absPath;
            if (url.startsWith('/')) {
                absPath = path.join(ROOT_DIR, url);
            } else if (url.startsWith('http') || url.startsWith('//')) {
                return match;
            } else {
                absPath = path.resolve(path.dirname(file), url);
            }

            // Check if .min exists
            const minAbsPath = absPath.replace(new RegExp(`\\.${ext}$`), `.min.${ext}`);
            if (fs.existsSync(minAbsPath)) {
                const newUrl = url.replace(new RegExp(`\\.${ext}$`), `.min.${ext}`);
                if (url !== newUrl) {
                    regexModified = true;
                    return `${quote}${newUrl}${quote}`;
                }
            }
            return match;
        });

        if (modified || regexModified) {
            if (regexModified && !modified) console.log(`Updated (Regex): ${path.relative(ROOT_DIR, file)}`);
            fs.writeFileSync(file, finalHtml);
        }
    });
}

processHtmlFiles();
