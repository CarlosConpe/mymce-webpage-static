const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

const WA_NUMBER = '524442335607';

// Contextual Messages
const MESSAGES = {
    'default': 'Hola, estoy buscando soluciones de carpintería y mobiliario. Me interesa cotizar un proyecto con ustedes.',
    'cocinas': 'Hola Grupo MYMCE, estoy interesado en el diseño y fabricación de una Cocina Integral.',
    'closets': 'Hola Grupo MYMCE, quisiera cotizar un Closet o Vestidor a medida.',
    'puertas': 'Hola Grupo MYMCE, busco información sobre Puertas Residenciales.',
    'bano': 'Hola, me interesan sus Muebles de Baño.',
    'electro': 'Hola, me interesa información sobre sus Electrodomésticos.'
};

async function injectWhatsApp() {
    console.log('🚀 Injecting Smart WhatsApp Button...');

    const files = glob.sync(`${ROOT_DIR}/**/*.html`, {
        ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`, `${ROOT_DIR}/.gemini/**`]
    });

    let modifiedCount = 0;

    const waStyle = `
    <style>
        .wa-float {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: #25D366;
            color: #ffffff !important;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            text-align: center;
            font-size: 28px;
            box-shadow: 2px 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 40px; /* Force vertical align */
            text-decoration: none !important;
            transition: all 0.3s ease;
        }
        .wa-float:visited, .wa-float:active, .wa-float:focus {
            color: #ffffff !important;
            text-decoration: none !important;
        }
        .wa-float:hover {
            transform: scale(1.1);
            background-color: #20BA5A;
            color: #ffffff !important;
            text-decoration: none !important;
        }
        .wa-float i {
            margin-top: 2px;
            color: white !important;
            /* slight adjustment for FA icon */
        }
        /* Mobile Pulse Animation */
        @keyframes wa-pulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
        }
        .wa-float {
            animation: wa-pulse 2s infinite;
        }
    </style>
    `;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });
        let modified = false;

        // Check if already injected
        if ($('.wa-float').length > 0) {
            $('.wa-float').remove(); // Remove old to update
            modified = true;
        }

        // Determine Context
        const relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/').toLowerCase();
        let msgKey = 'default';

        if (relativePath.includes('cocina')) msgKey = 'cocinas';
        else if (relativePath.includes('closet') || relativePath.includes('vestidor')) msgKey = 'closets';
        else if (relativePath.includes('puerta')) msgKey = 'puertas';
        else if (relativePath.includes('bano')) msgKey = 'bano';
        else if (relativePath.includes('equipamiento') || relativePath.includes('electro')) msgKey = 'electro';

        const message = encodeURIComponent(MESSAGES[msgKey]);
        const waLink = `https://wa.me/${WA_NUMBER}?text=${message}`;

        // Remove existing WA style to ensure latest CSS is applied (Fix for white icon color)
        $('style').each(function () {
            if ($(this).html().includes('.wa-float')) {
                $(this).remove();
                modified = true;
            }
        });

        // Always inject the fresh style
        $('head').append(waStyle);
        modified = true;

        // Inject Button
        const buttonHTML = `
        <a href="${waLink}" class="wa-float" target="_blank" rel="noopener noreferrer" onclick="gtag('event', 'whatsapp_click', {'event_category': 'contact', 'event_label': '${msgKey}'});">
            <i class="fa fa-whatsapp"></i>
        </a>
        `;

        $('body').append(buttonHTML);
        modified = true;

        if (modified) {
            fs.writeFileSync(file, $.html());
            modifiedCount++;
        }
    }

    console.log(`✅ WhatsApp Button Injected in ${modifiedCount} files.`);
}

injectWhatsApp().catch(console.error);
