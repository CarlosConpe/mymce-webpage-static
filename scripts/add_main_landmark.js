const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });

const FOOTER_EMAIL = '<i class="fa-li fa fa-envelope"></i> contacto@grupomymce.com</li>';
const FOOTER_EMAIL_LINK = '<i class="fa-li fa fa-envelope"></i> <!--email_off--><a href="mailto:contacto@grupomymce.com">contacto@grupomymce.com</a><!--/email_off--></li>';

// Index of the </div> that closes the <div> opened at `openIdx`, or -1.
function matchingDivClose(content, openIdx) {
    const tag = /<div\b|<\/div>/g;
    tag.lastIndex = openIdx;
    let depth = 0;
    let m;
    while ((m = tag.exec(content))) {
        depth += m[0] === '</div>' ? -1 : 1;
        if (depth === 0) return m.index;
    }
    return -1;
}

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 1. One <main> landmark after the site header, so crawlers and screen readers
    //    read the whole page body instead of the first section. Most pages wrap the
    //    header and content in <div class="">; <main> must close inside that wrapper,
    //    otherwise the wrapper's </div> would cut it short.
    const headerEnd = content.indexOf('</header>');
    if (!content.includes('<main') && headerEnd !== -1) {
        const wrapper = /<div class="">\s*<header/.exec(content);
        const mainEnd = wrapper ? matchingDivClose(content, wrapper.index) : content.lastIndexOf('<footer');
        if (mainEnd > headerEnd) {
            const afterHeader = headerEnd + '</header>'.length;
            content = content.slice(0, afterHeader) + '\n<main id="contenido">' +
                content.slice(afterHeader, mainEnd) + '</main>\n' + content.slice(mainEnd);
        }
    }

    // 2. role="main" was repeated on every section container; only <main> keeps it.
    content = content.replace(/\s+role="main"/g, '');

    // 3. Cloudflare rewrites plain-text emails into /cdn-cgi/l/email-protection,
    //    which crawlers see as a 404. email_off keeps a normal mailto link.
    content = content.split(FOOTER_EMAIL).join(FOOTER_EMAIL_LINK);

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
