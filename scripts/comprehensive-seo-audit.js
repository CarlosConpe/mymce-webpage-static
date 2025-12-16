const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

const SEARCH_DIR = path.resolve(__dirname, '../');

function runAudit() {
    console.log('Starting Comprehensive SEO Audit...');

    const htmlFiles = glob.sync(`${SEARCH_DIR}/**/*.html`, {
        ignore: [
            `${SEARCH_DIR}/scripts/**`,
            `${SEARCH_DIR}/node_modules/**`,
            `${SEARCH_DIR}/google*.html`,
            `${SEARCH_DIR}/_site/**` // exclude duplicate build folders if any
        ]
    });

    const results = {
        summary: {
            totalPages: htmlFiles.length,
            missingTitle: 0,
            missingDescription: 0,
            missingH1: 0,
            duplicateTitle: 0,
            duplicateDescription: 0,
            thinContent: 0, // < 300 words
            missingOgTags: 0,
            missingSchema: 0,
            imagesWithoutAlt: 0,
            totalImages: 0
        },
        pages: [], // Detail per page
        duplicates: {
            titles: {},
            descriptions: {}
        }
    };

    console.log(`Analyzing ${htmlFiles.length} pages...`);

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        const relativePath = path.relative(SEARCH_DIR, file);

        // 1. Metadata Analysis
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const canonical = $('link[rel="canonical"]').attr('href') || '';
        const metaRobots = $('meta[name="robots"]').attr('content') || '';

        // 2. Content Structure
        const h1 = $('h1').text().trim();
        const h1Count = $('h1').length;
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
        const wordCount = bodyText.split(' ').length;

        // 3. Technical SEO
        const ogTitle = $('meta[property="og:title"]').attr('content');
        const ogImage = $('meta[property="og:image"]').attr('content');
        const schema = $('script[type="application/ld+json"]').html();
        const viewport = $('meta[name="viewport"]').attr('content');

        // 4. Images
        const images = $('img');
        let imgMissingAlt = 0;
        images.each((i, el) => {
            if (!$(el).attr('alt')) imgMissingAlt++;
        });

        // Track Stats
        if (!title) results.summary.missingTitle++;
        if (!description) results.summary.missingDescription++;
        if (!h1) results.summary.missingH1++;
        if (wordCount < 300) results.summary.thinContent++;
        if (!ogTitle || !ogImage) results.summary.missingOgTags++;
        if (!schema) results.summary.missingSchema++;
        results.summary.imagesWithoutAlt += imgMissingAlt;
        results.summary.totalImages += images.length;

        // Track Duplicates
        if (title) {
            results.duplicates.titles[title] = (results.duplicates.titles[title] || 0) + 1;
        }
        if (description) {
            results.duplicates.descriptions[description] = (results.duplicates.descriptions[description] || 0) + 1;
        }

        // Push Page Detail
        results.pages.push({
            file: relativePath,
            title,
            titleLength: title.length,
            description,
            descLength: description.length,
            h1Count,
            wordCount,
            imagesWithoutAlt: imgMissingAlt,
            hasSchema: !!schema,
            hasOg: !!ogTitle
        });
    });

    // Cleanup Duplicates Count (keep only > 1)
    for (const t in results.duplicates.titles) {
        if (results.duplicates.titles[t] > 1) results.summary.duplicateTitle += results.duplicates.titles[t];
        else delete results.duplicates.titles[t];
    }
    for (const d in results.duplicates.descriptions) {
        if (results.duplicates.descriptions[d] > 1) results.summary.duplicateDescription += results.duplicates.descriptions[d];
        else delete results.duplicates.descriptions[d];
    }

    const outputPath = path.join(__dirname, '../seo_full_audit.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Scan complete. saved to ${outputPath}`);
}

runAudit();
