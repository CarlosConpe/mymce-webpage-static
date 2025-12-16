const fs = require('fs');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = __dirname;
const GLOB_PATTERN = '**/*.html';
const IGNORE_PATTERNS = ['node_modules/**', '_dist/**', 'scripts/**', '.gemini/**'];
const POSTER_SRC = '/assets/storage/2023/07/20230708_144508-1920x1080.webp';

function optimizeVideo() {
    console.log("Starting Mobile Video LCP Optimization...");

    const files = glob.sync(GLOB_PATTERN, { cwd: ROOT_DIR, ignore: IGNORE_PATTERNS });
    console.log(`Found ${files.length} HTML files.`);

    let fixedCount = 0;

    files.forEach((file) => {
        const filePath = path.join(ROOT_DIR, file);
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content);
        let modified = false;

        // 1. Find the Hero Video (VideoMymce1.mp4)
        const $video = $('video');
        $video.each((i, el) => {
            const $v = $(el);
            const html = $v.html() || '';
            if (html.includes('VideoMymce1.mp4') || $v.attr('src')?.includes('VideoMymce1.mp4')) {
                // Add poster if missing
                if (!$v.attr('poster')) {
                    $v.attr('poster', POSTER_SRC);
                    modified = true;
                    // Ensure preload is 'none' for bandwidth OR 'metadata' if we want faster start?
                    // For LCP impact, poster is key. 'none' saves data.
                }

                // 2. Inject Preload for the poster in HEAD
                // Check if already exists
                const existingPreload = $(`link[rel="preload"][href="${POSTER_SRC}"]`);
                if (existingPreload.length === 0) {
                    $('head').append(`<link rel="preload" as="image" href="${POSTER_SRC}" fetchpriority="high">\n`);
                    modified = true;
                }

                fixedCount++;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, $.html());
        }
    });

    console.log(`Video LCP optimization applied to ${fixedCount} files.`);
}

optimizeVideo();
