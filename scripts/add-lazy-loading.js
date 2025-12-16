const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');
const sharp = require('sharp');

const SITE_ROOT = '.';

async function addLazyLoading() {
    console.log('Adding Lazy Loading...');

    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip']
    });

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        const content = await fs.readFile(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // Select all images
        const images = $('img');

        images.each((i, el) => {
            // Skip the first 3 images (LCP optimization)
            if (i < 3) {
                // Ensure they have eager loading or default
                // $(el).attr('loading', 'eager'); // Optional, default is eager-ish
                return;
            }

            // Add loading="lazy"
            if (!$(el).attr('loading')) {
                $(el).attr('loading', 'lazy');
                modified = true;
            }

            // Try to add width/height if missing (for CLS)
            // This requires reading the image file.
            // The src might be absolute (/assets/...) or relative.
            let src = $(el).attr('src');
            if (src && !($(el).attr('width') && $(el).attr('height'))) {
                // Resolve path
                let imagePath;
                if (src.startsWith('/')) {
                    imagePath = path.join(SITE_ROOT, src);
                } else {
                    imagePath = path.join(path.dirname(filePath), src);
                }

                // Remove query strings
                imagePath = imagePath.split('?')[0];

                if (fs.existsSync(imagePath)) {
                    try {
                        // We can't easily get dimensions synchronously without a library like 'image-size' or 'sharp'
                        // Since we have 'sharp', let's use it but it's async.
                        // Cheerio .each is synchronous. We can't await inside it easily without collecting promises.
                        // For simplicity in this script, we might skip dimension adding OR collect them.
                        // Let's collect them.
                    } catch (e) {
                        // ignore
                    }
                }
            }
        });

        // To handle async dimensions, we need a different loop structure.
        // Let's re-loop with standard for loop.
        const imgElements = $('img').toArray();
        for (let i = 3; i < imgElements.length; i++) {
            const el = imgElements[i];
            const $el = $(el);

            // Add lazy
            if (!$el.attr('loading')) {
                $el.attr('loading', 'lazy');
                modified = true;
            }

            // Add dimensions
            if (!$el.attr('width') || !$el.attr('height')) {
                let src = $el.attr('src');
                if (!src) continue;

                // Resolve path
                let imagePath;
                if (src.startsWith('/')) {
                    imagePath = path.join(SITE_ROOT, src);
                } else {
                    imagePath = path.join(path.dirname(filePath), src);
                }
                imagePath = imagePath.split('?')[0];

                if (fs.existsSync(imagePath)) {
                    try {
                        const metadata = await sharp(imagePath).metadata();
                        if (metadata.width && metadata.height) {
                            $el.attr('width', metadata.width);
                            $el.attr('height', metadata.height);
                            modified = true;
                        }
                    } catch (e) {
                        // console.error(`Could not read dims for ${imagePath}`);
                    }
                }
            }
        }

        if (modified) {
            await fs.writeFile(filePath, $.html());
            // console.log(`Updated ${file}`);
        }
    }

    console.log('Lazy Loading added.');
}

addLazyLoading().catch(console.error);
