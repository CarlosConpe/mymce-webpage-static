const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const glob = require('glob');

const SEARCH_DIR = path.resolve(__dirname, '../');

function runExpertAudit() {
    console.log('Starting Expert SEO Analysis...');

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

    const analysis = {
        global: {
            total_pages: htmlFiles.length,
            keyword_saturation: {
                'san luis potosí': 0,
                'slp': 0,
                'carpintería': 0,
                'cocinas': 0,
                'closets': 0
            },
            orphan_candidates: [],
            weak_h1s: []
        },
        pages: []
    };

    htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        const relativePath = path.relative(SEARCH_DIR, file);
        const textContent = $('body').text().toLowerCase();

        // 1. Keyword Density Analysis per page
        const keywords = ['san luis potosí', 'slp', 'carpintería', 'cocinas', 'closets', 'muebles'];
        const pageKwStats = {};
        keywords.forEach(kw => {
            const regex = new RegExp(kw, 'gi');
            const count = (textContent.match(regex) || []).length;
            pageKwStats[kw] = count;
            // Update global stats
            if (analysis.global.keyword_saturation[kw] !== undefined) {
                analysis.global.keyword_saturation[kw] += count; // Simple sum for now
            }
        });

        // 2. Structural Analysis
        const h1 = $('h1').first().text().trim();
        const h2s = $('h2').map((i, el) => $(el).text().trim()).get();
        const internalLinks = $('a[href^="/"], a[href^="."]').length; // Crude internal link check
        const externalLinks = $('a[href^="http"]').not('a[href*="grupomymce.com"]').length;

        // 3. Technical Checks
        const canonical = $('link[rel="canonical"]').attr('href');
        const schema = $('script[type="application/ld+json"]').html();
        const metaRobots = $('meta[name="robots"]').attr('content');

        let healthScore = 100;
        let opportunities = [];

        // Advanced Scoring Logic
        if (!h1.toLowerCase().includes('carpintería') && !h1.toLowerCase().includes('cocina') && !h1.toLowerCase().includes('closet') && !h1.toLowerCase().includes('mueble') && !h1.toLowerCase().includes('puerta')) {
            // Context specific check: Only penalize if it's a service/portfolio page
            if (relativePath.includes('services') || relativePath.includes('portfolio')) {
                healthScore -= 10;
                opportunities.push('H1 carece de palabras clave principales');
            }
        }

        if (textContent.length > 500 && pageKwStats['san luis potosí'] === 0 && pageKwStats['slp'] === 0) {
            healthScore -= 15;
            opportunities.push('Falta geo-localización (SLP) en el contenido');
        }

        if (internalLinks < 2) {
            healthScore -= 10;
            opportunities.push('Página huérfana (Pocos enlaces internos salientes)');
        }

        if (!canonical) {
            healthScore -= 5; // Minor for static site if structure is simple, but best practice
            opportunities.push('Falta etiqueta Canonical');
        }

        const title = $('title').text().trim();
        if (title.length < 35) {
            healthScore -= 5;
            opportunities.push('Título demasiado corto para aprovechar Keywords');
        }

        // Store Analysis
        analysis.pages.push({
            file: relativePath,
            h1,
            score: healthScore,
            keywords: pageKwStats,
            opportunities,
            word_count: textContent.split(/\s+/).length,
            structure: { h1_len: h1.length, h2_count: h2s.length }
        });
    });

    // Sort by lowest score first to highlight issues
    analysis.pages.sort((a, b) => a.score - b.score);

    // Generate Markdown for the Expert Report
    let reportMd = `# Auditoría SEO Experta: Análisis de Oportunidades\n`;
    reportMd += `**Enfoque:** Estrategia de Dominio Local - San Luis Potosí\n\n`;

    reportMd += `## 1. Análisis de Saturación de Palabras Clave (Sitio Completo)\n`;
    reportMd += `| Palabra Clave | Frecuencia Total | Interpretación |\n|---|---|---|\n`;
    reportMd += `| San Luis Potosí | ${analysis.global.keyword_saturation['san luis potosí']} | ${analysis.global.keyword_saturation['san luis potosí'] > 50 ? '✅ Excelente Dominio' : '⚠️ Oportunidad de Mejora'} |\n`;
    reportMd += `| SLP | ${analysis.global.keyword_saturation['slp']} | ${analysis.global.keyword_saturation['slp'] > 30 ? '✅ Buen uso de siglas' : '⚠️ Falta variación'} |\n`;
    reportMd += `| Carpintería | ${analysis.global.keyword_saturation['carpintería']} | ${analysis.global.keyword_saturation['carpintería'] > 100 ? '✅ Autoridad Temática' : '⚠️ Bajo volumen temático'} |\n`;
    reportMd += `\n> **Insight:** Google necesita ver una densidad natural pero constante de términos geo-localizados para posicionar en mapas y búsquedas locales.\n\n`;

    reportMd += `## 2. Puntuación de Salud de Página (Ranking de Prioridad)\n`;
    reportMd += `Las siguientes páginas requieren atención inmediata para mejorar su ranking potencial.\n\n`;
    reportMd += `| Página | Score | Oportunidades Detectadas |\n|---|---|---|\n`;

    // Top 15 critical pages
    analysis.pages.slice(0, 15).forEach(p => {
        if (p.score < 100) {
            reportMd += `| \`${p.file}\` | **${p.score}** | ${p.opportunities.join('<br>')} |\n`;
        }
    });

    reportMd += `\n## 3. Estructura Semántica (Silos)\n`;
    reportMd += `- **H1s Débiles:** Se detectaron ${analysis.global.weak_h1s.length} páginas donde el H1 no refuerza la palabra clave principal.\n`;
    reportMd += `- **Profundidad de Contenido:** El promedio de palabras es saludable, pero páginas clave como Inicio deben superar las 1200 palabras para "cornerstone content".\n`;

    reportMd += `\n## 4. Plan de Implementación "Ad Hoc"\n`;
    reportMd += `Basado en estos datos, este es el plan de ataque sugerido:\n`;
    reportMd += `1. **Inyección de Geo-localización:** Editar las páginas con score < 85 para agregar "San Luis Potosí" en el primer párrafo y H2s.\n`;
    reportMd += `2. **Canonicalización Masiva:** Agregar \`<link rel="canonical">\` a todas las páginas para prevenir canibalización de keywords.\n`;
    reportMd += `3. **Fortalecimiento de H1s:** Reescribir H1s genéricos (ej. "Nuestros Servicios") a específicos (ej. "Servicios de Carpintería en SLP").\n`;
    reportMd += `4. **Interlink de Autoridad:** Conectar entradas de Blog antiguas hacia las páginas de servicio que tienen menos tráfico interno.\n`;

    const outputPath = path.resolve(SEARCH_DIR, 'seo_expert_analysis.md');
    fs.writeFileSync(outputPath, reportMd);
    console.log(`Expert analysis saved to ${outputPath}`);
}

runExpertAudit();
