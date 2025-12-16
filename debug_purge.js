const { PurgeCSS } = require('purgecss');

async function debugPurge() {
    console.log("Debugging PurgeCSS Result...");
    try {
        const result = await new PurgeCSS().purge({
            content: ['index.html'], // Minimal content
            css: ['assets/css/all.min.css'],
            safelist: ['body']
        });

        console.log("Result Type:", typeof result);
        console.log("Is Array:", Array.isArray(result));

        if (result.length > 0) {
            console.log("Item 0 Keys:", Object.keys(result[0]));
            if (result[0].css) {
                console.log("CSS Length:", result[0].css.length);
            } else {
                console.log("CSS property missing!");
            }
        } else {
            console.log("Empty result array");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

debugPurge();
