const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');

async function runPurgeCSS() {
    console.log("Starting PurgeCSS (Root)...");

    const cssFile = 'assets/css/all.min.css';
    if (!fs.existsSync(cssFile)) {
        console.error("Error: assets/css/all.min.css not found, looking in root...");
        return;
    }

    // Include common JS generated classes in safelist
    const safelistPatterns = {
        standard: [
            // Bootstrap & layout basics
            /^navbar-/, /^dropdown-/, /^collapse/, /^in/, /^open/, /^show/, /^active/,
            /^btn-/, /^fa-/, /^icon-/, /^text-/, /^bg-/, /^col-/, /^row/, /^container/,
            /^visible-/, /^hidden-/, /^d-/, /^m-/, /^p-/, /^align-/, /^justify-/,

            // Interaction states
            'hover', 'focus', 'active', 'visited', 'disabled',

            // Specific ID or Classes seen in JS
            'logo-default', 'logo-retina', 'safari_only', 'sticky', 'is-sticky',
            'scroll-change', 'fade-in', 'show', 'showing', 'hiding',

            // Dynamic content or plugins often use these
            /^mfp-/, // Magnific Popup
            /^ui-/, // jQuery UI
            /^datepicker/,
            /^owl-/, // Owl Carousel if used
            /^flex-/, // Flexslider if used
            /^wp-/ // WordPress legacy classes if any
        ],
        deep: [
            /^nav/, /^btn/, /^fa/, /^social/, /^advs/, /^grid/, /^panel/, /^tab/,
            /^list/, /^form/, /^input/, /^modal/, /^tooltip/, /^popover/,
            /^table/, /^pagination/, /^alert/, /^badge/, /^label/, /^progress/,
            /^card/, /^carousel/, /^jumbotron/
        ],
        greedy: [
            /^bootstrap/,
            /^magnific/,
            /^datepicker/
        ]
    };

    const content = ['./**/*.html', './assets/js/**/*.js'];
    const css = [cssFile];

    try {
        const result = await new PurgeCSS().purge({
            content: content,
            css: css,
            safelist: safelistPatterns,
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        });

        console.log(`PurgeCSS Result Length: ${result.length}`);
        if (result.length > 0) {
            const purgedCSS = result[0].css;
            if (!purgedCSS) {
                console.error("Purged CSS property is empty/undefined!");
                console.log(JSON.stringify(result[0]));
            } else {
                const originalSize = fs.statSync(cssFile).size;
                const newSize = purgedCSS.length;

                console.log(`Original Size: ${(originalSize / 1024).toFixed(2)} KB`);
                console.log(`Purged Size: ${(newSize / 1024).toFixed(2)} KB`);
                console.log(`Reduction: ${((1 - newSize / originalSize) * 100).toFixed(2)}%`);

                fs.writeFileSync('assets/css/all.clean.css', purgedCSS);
                console.log("Purged CSS saved to assets/css/all.clean.css");
            }
        } else {
            console.log("PurgeCSS returned no results.");
        }
    } catch (err) {
        console.error("PurgeCSS Failed:", err);
    }
}

runPurgeCSS();
