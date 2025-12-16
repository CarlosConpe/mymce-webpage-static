const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const BASE_DIR = path.join(__dirname, '..');
const HTML_FILES = glob.sync(`${BASE_DIR}/**/*.html`, { ignore: `${BASE_DIR}/node_modules/**` });

console.log(`Found ${HTML_FILES.length} HTML files to process.`);

let processedCount = 0;

HTML_FILES.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let $ = cheerio.load(content);
    let modified = false;

    // 1. Remove 'wp' dependent inline scripts
    $('script').each((i, el) => {
        const scriptContent = $(el).html();
        if (scriptContent && (
            scriptContent.includes('wp.i18n.setLocaleData') ||
            scriptContent.includes('var wpcf7=') ||
            scriptContent.includes('RocketBrowserCompatibilityChecker') ||
            scriptContent.includes('RocketPreloadLinksConfig')
        )) {
            $(el).remove();
            modified = true;
        }
        // Remove empty scripts or scripts with just comments (optional but good for cleanup)
        if (scriptContent && scriptContent.trim().startsWith('//<![CDATA[') && scriptContent.trim().endsWith('//]]>')) {
            if (scriptContent.replace('//<![CDATA[', '').replace('//]]>', '').trim() === '') {
                $(el).remove();
                modified = true;
            }
        }
    });

    // 2. Remove broken/legacy WP script src references
    // Common 404s or unneeded WP scripts
    const ScriptsToRemove = [
        'wp-hooks-js',
        'wp-i18n-js',
        'swv-js',
        'contact-form-7-js',
        'contact-form-7-js-translations',
        'contact-form-7-js-before',
        'rocket-browser-checker-js-after',
        'rocket-preload-links-js-after',
        'googlesitekit-consent-mode-js',
        'jquery-migrate-js'
    ];

    ScriptsToRemove.forEach(id => {
        if ($(`script[id="${id}"]`).length > 0) {
            $(`script[id="${id}"]`).remove();
            modified = true;
        }
    });

    // Remove scripts by src if ID is missing or variable
    $('script[src*="/wp-includes/js/"]').remove();
    $('script[src*="/wp-content/plugins/"]').remove();
    // Careful with plugins, some might be static assets we moved? 
    // But clearly 'contact-form-7/v1' api calls etc are dead.

    // 3. Remove CSS warnings/junk (Unused plugins)
    const StylesToRemove = [
        'search-filter-plugin-styles-css',
        'wp-pagenavi-css',
        'mc4wp-form-themes-css',
        'contact-form-7-css',
        'woocommerce-layout-css',
        'woocommerce-smallscreen-css',
        'woocommerce-general-css'
    ];

    StylesToRemove.forEach(id => {
        if ($(`link[id="${id}"]`).length > 0) {
            $(`link[id="${id}"]`).remove();
            modified = true;
        }
    });

    // Also remove by href if ID is messy
    $('link[href*="/search-filter-plugin/"]').remove();
    $('link[href*="/contact-form-7/"]').remove();
    $('link[href*="/mc4wp/"]').remove();


    // 4. Fix jQuery is not defined. 
    // If there is inline code using jQuery(function($)...) it must be after jQuery is loaded.
    // In the file we saw: <script...jquery-ui-datepicker-js-after> jQuery(function...
    // But jQuery core might be deferred or missing. 
    // We removed WP jquery, so we MUST ensure a static jQuery is present if we want to keep datepicker?
    // Actually, do we need datepicker on portfolio? probably not.
    // Let's remove the datepicker inline script too.

    $('script').each((i, el) => {
        const html = $(el).html();
        if (html && html.includes('jQuery(function(jQuery){jQuery.datepicker.setDefaults')) {
            $(el).remove();
            modified = true;
        }
        // Remove the 'Right Click Disable' script that might be annoying and buggy
        if (html && html.includes('$.disable_open_404')) {
            $(el).remove(); // The user asked for "clean" project
            modified = true;
            // Also remove the #disable_msg div
            $('#disable_msg').remove();
        }
    });

    if (modified) {
        fs.writeFileSync(file, $.html());
        processedCount++;
    }
});

console.log(`Cleaned ${processedCount} files.`);
