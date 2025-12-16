const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const sharp = require('sharp');

const SITE_ROOT = '.';

async function convertToWebP() {
    console.log('Starting WebP Conversion...');

    // 1. Find Images
    const images = glob.sync('**/*.{jpg,jpeg,png}', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip']
    });
    console.log(`Found ${images.length} images to convert.`);

    const conversionMap = {}; // oldPath -> newPath (relative)

    // 2. Convert Images
    for (const image of images) {
        const filePath = path.join(SITE_ROOT, image);
        const ext = path.extname(filePath);
        const newFilePath = filePath.replace(ext, '.webp');
        const relativeNewPath = image.replace(ext, '.webp');

        try {
            // Skip if WebP already exists (idempotency)
            if (fs.existsSync(newFilePath)) {
                // console.log(`Skipping ${image}, WebP exists.`);
                conversionMap[image] = relativeNewPath;
                continue;
            }

            await sharp(filePath)
                .webp({ quality: 80 })
                .toFile(newFilePath);

            // console.log(`Converted: ${image} -> ${relativeNewPath}`);
            conversionMap[image] = relativeNewPath;
        } catch (e) {
            console.error(`Error converting ${image}:`, e.message);
        }
    }

    // 3. Update HTML Files
    console.log('Updating HTML references...');
    const htmlFiles = glob.sync('**/*.html', {
        cwd: SITE_ROOT,
        ignore: ['node_modules/**', 'scripts/**', '_backup_raw.zip']
    });

    // Sort keys by length desc to avoid partial matches issues
    const sortedImages = Object.keys(conversionMap).sort((a, b) => b.length - a.length);

    for (const file of htmlFiles) {
        const filePath = path.join(SITE_ROOT, file);
        let content = await fs.readFile(filePath, 'utf8');
        let originalContent = content;

        for (const oldImage of sortedImages) {
            const newImage = conversionMap[oldImage];

            // We need to match the filename in the HTML. 
            // The HTML might have absolute paths (/assets/...) or relative.
            // The `oldImage` variable is relative to root (e.g., assets/storage/foo.jpg).

            // We'll try to match the filename part mostly, but be careful.
            // Better strategy: Match the exact path if possible.

            // Let's assume most links are absolute /assets/... because of our restructuring.
            // So we replace `oldImage` (which is assets/...) with `newImage`.
            // But we need to handle the leading slash or lack thereof.

            // Normalize slashes
            const oldImageSlash = oldImage.replace(/\\/g, '/');
            const newImageSlash = newImage.replace(/\\/g, '/');

            // Replace /oldImageSlash
            content = content.split('/' + oldImageSlash).join('/' + newImageSlash);

            // Replace "oldImageSlash" (relative?)
            content = content.split('"' + oldImageSlash).join('"' + newImageSlash);
            content = content.split("'" + oldImageSlash).join("'" + newImageSlash);

            // Also try just the basename if the path structure is complex? 
            // No, that's risky. Let's stick to full path replacement.
            // If the HTML uses relative paths like "../storage/foo.jpg", our simple replacement above might fail 
            // if we only look for "assets/storage/foo.jpg".

            // However, our previous restructuring script normalized things to /assets/... mostly.
            // Let's check if there are relative paths.
            // If we miss some, it's better than breaking them.
        }

        if (content !== originalContent) {
            await fs.writeFile(filePath, content);
            // console.log(`Updated HTML: ${file}`);
        }
    }

    console.log('WebP Conversion Complete.');
}

convertToWebP().catch(console.error);
