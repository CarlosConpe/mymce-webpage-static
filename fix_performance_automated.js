const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const { imageSize } = require('image-size');

const ROOT_DIR = __dirname;

function runStart() {
    console.log("Starting Automated Performance Fixes (Buffer Mode)...");

    const globPattern = '**/*.html';
    const globOptions = { cwd: ROOT_DIR, ignore: ['node_modules/**', '_dist/**', 'scripts/**', '.gemini/**'] };

    const files = glob.sync(globPattern, globOptions);
    console.log(`Found ${files.length} HTML files.`);

    let fixedClsCount = 0;
    let lazyLoadCount = 0;

    files.forEach((file, fileIdx) => {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) return;

        let html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html);
        let modified = false;
        let fileDir = path.dirname(filePath);

        // Get all images
        const images = $('img');

        images.each((i, el) => {
            const $img = $(el);
            let src = $img.attr('src');

            if (!src) return;

            // --- 1. CLS FIX (Width/Height) ---
            if (!$img.attr('width') || !$img.attr('height')) {
                try {
                    const cleanSrc = decodeURIComponent(src.split('?')[0]);
                    let imgPath;

                    if (cleanSrc.startsWith('/') || cleanSrc.startsWith('\\')) {
                        imgPath = path.join(ROOT_DIR, cleanSrc.replace(/^[\\/]/, ''));
                    } else {
                        imgPath = path.resolve(fileDir, cleanSrc);
                    }

                    imgPath = path.normalize(imgPath);

                    if (fs.existsSync(imgPath)) {
                        try {
                            const buffer = fs.readFileSync(imgPath);
                            const dimensions = imageSize(buffer);

                            if (dimensions && dimensions.width && dimensions.height) {
                                $img.attr('width', dimensions.width);
                                $img.attr('height', dimensions.height);
                                fixedClsCount++;
                                modified = true;
                            }
                        } catch (imgErr) {
                            // console.log(`[DEBUG]   -> ImgErr: ${imgErr.message}`);
                        }
                    }
                } catch (err) {
                    // console.log(`Err: ${err}`);
                }
            }

            // --- 2. LAZY LOADING ---
            if (i > 1) { // Skip first 2 images
                if (!$img.attr('loading')) {
                    $img.attr('loading', 'lazy');
                    lazyLoadCount++;
                    modified = true;
                }
            } else {
                // For first 2 images, ensure they are NOT lazy
                if ($img.attr('loading') === 'lazy') {
                    $img.removeAttr('loading'); // Or set to eager
                    modified = true;
                }
                // Optional: Set eager if missing
                if (!$img.attr('loading')) {
                    $img.attr('loading', 'eager');
                    modified = true;
                }
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, $.html());
        }
    });

    console.log(`Fixes Applied:`);
    console.log(` - CLS (Dimensions Added): ${fixedClsCount}`);
    console.log(` - Lazy Loading Added: ${lazyLoadCount}`);
}

runStart();
