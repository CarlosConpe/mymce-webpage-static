const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

async function enforceBrand() {
    console.log('🚀 Enforcing "MYMCE" in all Page Titles...');

    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`, `${ROOT_DIR}/.gemini/**`]
    });

    let modifiedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        const titleTag = $('title');
        if (titleTag.length > 0) {
            let titleText = titleTag.text();

            // Check if MYMCE is present (case insensitive)
            if (!titleText.toLowerCase().includes('mymce')) {
                // Check length to decide how to append
                if (titleText.length > 50) {
                    // If long, maybe just replace end or append short
                    titleText = `${titleText} | MYMCE`;
                } else {
                    titleText = `${titleText} | Grupo MYMCE`;
                }

                titleTag.text(titleText);
                modified = true;
            }
        } else {
            // No title? Add one.
            $('head').prepend('<title>Grupo MYMCE | Carpintería Residencial</title>');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(file, $.html());
            modifiedCount++;
        }
    }

    console.log(`✅ Title Audit Complete. Fixed ${modifiedCount} files missing "MYMCE".`);
}

enforceBrand().catch(console.error);
