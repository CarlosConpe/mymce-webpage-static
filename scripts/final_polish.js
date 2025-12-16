const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BASE_DIR = path.join(__dirname, '..');

// 1. Fix Broken Video Link
// The broken file ID: 109990965
// Replacement: /assets/storage/2016/12/VideoMymce1.mp4

const BROKEN_ID = '109990965';
const CORRECT_PATH = '/assets/storage/2016/12/VideoMymce1.mp4';

const SEARCH_FILES = glob.sync(`${BASE_DIR}/**/*.html`, { ignore: `${BASE_DIR}/node_modules/**` });

let videoFixedCount = 0;

SEARCH_FILES.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Regex to match the src="..." attribute content containing the ID
    // Matches: src="/any/path/109990965...mp4"
    const regex = new RegExp(`src="[^"]*${BROKEN_ID}[^"]*"`, 'g');

    if (regex.test(content)) {
        content = content.replace(regex, `src="${CORRECT_PATH}"`);
        fs.writeFileSync(file, content);
        videoFixedCount++;
        console.log(`Fixed video ID in: ${path.relative(BASE_DIR, file)}`);
    }
});


console.log(`Fixed broken video usage in ${videoFixedCount} files.`);


// 2. Clean up CSS Warnings (Optional but requested)
// Targets: bootstrap, style, skin, magnific-popup, content-box, font-awesome
const CSS_FILES = [
    path.join(BASE_DIR, 'assets/core/modules/d9a1c27cc2/scripts/bootstrap/css/bootstrap.css'),
    path.join(BASE_DIR, 'assets/core/modules/d9a1c27cc2/style.css'),
    path.join(BASE_DIR, 'assets/core/views/c0597ef72a/skin.css'),
    path.join(BASE_DIR, 'assets/core/modules/d9a1c27cc2/scripts/magnific-popup.css'),
    path.join(BASE_DIR, 'assets/core/modules/d9a1c27cc2/css/content-box.css'),
    path.join(BASE_DIR, 'assets/core/modules/d9a1c27cc2/scripts/font-awesome/css/font-awesome.min.css')
];

let cssCleanedCount = 0;

CSS_FILES.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let originalLength = content.length;

        // Remove specific noisy lines/rules
        // Note: Simple regex removal might leave empty braces or broken syntax if not careful,
        // but for these specific properties usually on their own lines or semicolon separated, it's manageable.

        // Helper regex for property removal that handles optional trailing semicolon (minified)
        // Matches "property: value" followed by ";" OR end of block "}" (lookahead)
        const rmProp = (prop) => new RegExp(`${prop}:\\s*[^;}]*(?:;|(?=\\}))`, 'gi');

        // Remove orphans/widows
        content = content.replace(rmProp('orphans'), '');
        content = content.replace(rmProp('widows'), '');

        // Remove vendor specific border-radius/box-shadow
        content = content.replace(/-moz-border-radius[^;}]*(?:;|(?=\}))/gi, '');
        content = content.replace(/-webkit-border-radius[^;}]*(?:;|(?=\}))/gi, '');
        content = content.replace(/-moz-box-shadow[^;}]*(?:;|(?=\}))/gi, '');
        content = content.replace(/-webkit-box-shadow[^;}]*(?:;|(?=\}))/gi, '');

        // Remove -webkit-text-size-adjust
        content = content.replace(rmProp('-webkit-text-size-adjust'), '');

        // Remove -ms-input-placeholder pseudo-element blocks or rules
        // Often: input:-ms-input-placeholder { color: ... }
        // Simple removal of property reference might fail if it is a selector.
        // We will try to remove the property declaration if it exists inside a rule (less likely for pseudo)
        // match: selector:-ms-input-placeholder { ... } -> Hard to regex safely.
        // match: -ms-input-placeholder property? (does not exist).
        // The warning says "Pseudo-clase o pseudo-elemento desconocido".
        // It resides in the selector area.
        // We can try to remove the whole block if it is isolated:
        // ::-ms-input-placeholder\s*{[^}]+}
        content = content.replace(/[^},]*:-ms-input-placeholder\s*\{[^}]*\}/gi, '');
        content = content.replace(/[^},]*::-ms-input-placeholder\s*\{[^}]*\}/gi, '');
        content = content.replace(/[^},]*:-moz-placeholder\s*\{[^}]*\}/gi, '');
        content = content.replace(/[^},]*::-moz-placeholder\s*\{[^}]*\}/gi, '');

        // Remove -moz-focus-inner blocks
        // e.g. input::-moz-focus-inner { ... }
        content = content.replace(/[^},]*::-moz-focus-inner\s*\{[^}]*\}/gi, '');

        // Remove @-o-keyframes and @-ms-viewport blocks
        content = content.replace(/@-o-keyframes\s+[^\{]+\{([\s\S]*?)\}\s*\}/gi, '');
        content = content.replace(/@-ms-viewport\s*\{[^}]*\}/gi, '');

        // Remove -moz-osx-font-smoothing
        content = content.replace(rmProp('-moz-osx-font-smoothing'), '');

        // Remove -webkit-media-controls-play-button
        content = content.replace(/[^},]*::-webkit-media-controls-play-button\s*\{[^}]*\}/gi, '');

        // Remove transform-3d (legacy hack)
        // Matches @media (transform-3d), (-webkit-transform-3d) { ... }
        // We use a broader regex to catch the media query condition containing transform-3d
        content = content.replace(/@media[^\{]*transform-3d[^\{]*\{([\s\S]*?)\}\s*\}/gi, '');

        // Remove filter: Alpha(...)
        content = content.replace(/filter:\s*Alpha\([^)]+\)(?:;|(?=\}))/gi, '');

        // Remove 'perspective' property if it's causing issues (likely vendor prefixed needed or invalid context)
        // User specifically flagged this.
        content = content.replace(rmProp('perspective'), '');

        // Remove 'text-indent' if value causes error (sometimes '100%') or just remove it from magnific-popup main block
        // Error: "Error al analizar el valor para 'text-indent'"
        // Often used for image replacement: text-indent: -9999px; or text-indent: 100%;
        // We'll try to remove it only if it looks suspicious or just remove all text-indent in these files?
        // Safer to specific remove strict problematic ones, but we don't know exact value.
        // Let's remove 'text-indent: -9999px' and variants.
        content = content.replace(/text-indent:\s*-?9999px(?:;|(?=\}))/gi, '');
        content = content.replace(/text-indent:\s*100%(?:;|(?=\}))/gi, '');
        // Specific fix for magnific-popup "each-line" error
        content = content.replace(/text-indent:each-line/gi, 'text-indent:0');

        // Specific fix for bootstrap "button::-moz-focus-inner" selector
        // It appears as "button::-moz-focus-inner,input" -> we want just "input"
        content = content.replace(/button::-moz-focus-inner,/gi, '');
        // Also remove if standalone "button::-moz-focus-inner{...}"
        content = content.replace(/button::-moz-focus-inner\s*\{[^}]*\}/gi, '');

        // Remove style.css specific ::-webkit-media-controls-play-button
        // If it comes with commas: ", ::-webkit-media-controls-play-button"
        content = content.replace(/,\s*[^,{}]+::-webkit-media-controls-play-button[^,{]*/gi, '');
        // If it starts the line: "::-webkit-media-controls-play-button, "
        content = content.replace(/[^,{}]+::-webkit-media-controls-play-button[^,{]*,\s*/gi, '');

        // Specific FIX for style.css typo "::--webkit-media-controls-play-button" (double dash)
        // This invalid selector causes the whole block to be ignored and throws a warning.
        // Block: ::--webkit-media-controls-play-button,::-webkit-media-controls-panel,::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none}
        content = content.replace(/::--webkit-media-controls-play-button,::-webkit-media-controls-panel,::-webkit-media-controls-start-playback-button\{display:none!important;-webkit-appearance:none\}/gi, '');
        // Fallback for just the typo selector if it exists elsewhere
        content = content.replace(/::--webkit-media-controls-play-button/gi, '');



        if (content.length !== originalLength) {
            fs.writeFileSync(file, content);
            cssCleanedCount++;
            console.log(`Cleaned CSS in: ${path.relative(BASE_DIR, file)}`);
        }
    } else {
        console.log(`CSS file not found: ${path.relative(BASE_DIR, file)}`);
    }
});

console.log(`Css Cleaning finished.`);
