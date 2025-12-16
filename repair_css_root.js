const CleanCSS = require('clean-css');
const fs = require('fs');

async function repairCSS() {
    console.log("Starting CSS Repair...");

    const cssFile = 'assets/css/all.min.css';
    if (!fs.existsSync(cssFile)) {
        console.error("Error: assets/css/all.min.css not found!");
        return;
    }

    const content = fs.readFileSync(cssFile, 'utf8');

    // CleanCSS options: level 1 is standard minification which validates syntax
    const output = new CleanCSS({ level: 1 }).minify(content);

    if (output.errors.length > 0) {
        console.error("CleanCSS Errors:", output.errors);
    }

    if (output.warnings.length > 0) {
        console.warn("CleanCSS Warnings:", output.warnings);
    }

    if (output.styles) {
        fs.writeFileSync(cssFile, output.styles);
        console.log("CSS Repaired and Re-minified.");
        console.log(`New Size: ${(output.styles.length / 1024).toFixed(2)} KB`);
    } else {
        console.error("CleanCSS failed to generate output.");
    }
}

repairCSS();
