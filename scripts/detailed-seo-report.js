const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

const SEARCH_DIR = path.resolve(__dirname, '../');

function generateDetailedReport() {
    console.log('Generating Detailed SEO Report...');

    const htmlFiles = glob.sync(`${SEARCH_DIR}/**/*.html`, {
        ignore: [
            `${SEARCH_DIR}/scripts/**`,
            `${SEARCH_DIR}/node_modules/**`,
            `${SEARCH_DIR}/google*.html`,
            `${SEARCH_DIR}/_site/**`,
            `${SEARCH_DIR}/assets/core/**`,
            `${SEARCH_DIR}/assets/lib/**`
        ]
    });

    let reportMarkdown = `# Reporte Detallado de SEO por Página\n**Total Páginas Auditadas:** ${htmlFiles.length}\n\n`;
    reportMarkdown += `| Archivo | Longitud Título | Longitud Desc. | H1 Presente | Veredicto |\n`;
    reportMarkdown += `| :--- | :--- | :--- | :--- | :--- |\n`;

    let cleanCount = 0;

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        const relativePath = path.relative(SEARCH_DIR, file);

        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';
        const h1 = $('h1').text().trim();

        // Scoring
        let status = '✅ OK';
        let issues = [];

        if (!title) { status = '❌ Crítico'; issues.push('Falta Título'); }
        else if (title.length < 10) { status = '⚠️ Aviso'; issues.push('Título Corto'); }

        if (!description) { status = '❌ Crítico'; issues.push('Falta Desc.'); }
        else if (description.length < 50) { status = '⚠️ Aviso'; issues.push('Desc. Corta'); }

        if (!h1) { status = '❌ Crítico'; issues.push('Falta H1'); }

        let verdict = status;
        if (issues.length > 0) verdict += ` (${issues.join(', ')})`;
        else cleanCount++;

        // Format for table
        const safeTitleLen = title.length;
        const safeDescLen = description.length;
        const hasH1 = h1 ? '✅ Sí' : '❌ No';

        reportMarkdown += `| \`${relativePath}\` | ${safeTitleLen} caracteres | ${safeDescLen} caracteres | ${hasH1} | ${verdict} |\n`;
    });

    console.log(`Report generated. ${cleanCount} pages perfect.`);

    const outputPath = path.resolve(SEARCH_DIR, 'seo_detailed_scan.md');
    fs.writeFileSync(outputPath, reportMarkdown);
    console.log(`Saved detailed scan to ${outputPath}`);
}

generateDetailedReport();
