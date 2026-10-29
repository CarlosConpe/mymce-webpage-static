const fs = require('fs');
const path = require('path');
const glob = require('glob');

// The Google Ads conversion events fired on page load, so every visit counted as a
// lead ("Website lead" on every page, "Contacto *" on contact and /soluciones/*).
// Now:
// - pages only declare which action they report (window.mymceFormConversion);
//   assets/js/email-client.js fires it after /api/send-email answers OK;
// - WhatsApp and phone taps fire "Website lead" (window.mymceLeadConversion).
const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });

const AW = 'AW-11313299378';
const LEAD = `${AW}/pgxBCJvIztoYELL_zJIq`;
const EMAIL_CLIENT_VERSION = '20261029';

const LEAD_SCRIPT = `<script>window.mymceLeadConversion = '${LEAD}';
document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href^="https://wa.me/"], a[href^="tel:"]');
    if (link && typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: window.mymceLeadConversion });
});</script>`;

const PAGE_LOAD_CONVERSION = new RegExp(`<script>\\s*gtag\\(\\s*'event'\\s*,\\s*'conversion'\\s*,\\s*\\{\\s*'send_to'\\s*:\\s*'(${AW}/[A-Za-z0-9_-]+)'\\s*\\}\\s*\\);?\\s*</script>`, 'g');
const AW_CONFIG = new RegExp(`<script>[^<]*gtag\\(\\s*'config'\\s*,\\s*'${AW}'\\s*\\);?\\s*</script>`);

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let updated = content.replace(PAGE_LOAD_CONVERSION, (match, sendTo) =>
        sendTo === LEAD ? LEAD_SCRIPT : `<script>window.mymceFormConversion = '${sendTo}';</script>`);

    // Pages with the Ads tag but no "Website lead" event (the home page) still need the click listener.
    if (!updated.includes('window.mymceLeadConversion') && AW_CONFIG.test(updated)) {
        updated = updated.replace(AW_CONFIG, match => `${match}\n  ${LEAD_SCRIPT}`);
    }

    // /assets/* is cached as immutable for a year; version the changed script.
    updated = updated.replace(/(\/assets\/js\/email-client\.min\.js)(\?v=\d+)?"/g, `$1?v=${EMAIL_CLIENT_VERSION}"`);

    if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
