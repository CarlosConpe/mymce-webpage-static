const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**', 'scripts/**', 'functions/**'] });

const MYMCE_DATA = {
    name: "Grupo MYMCE",
    legalName: "MYMCE Carpintería Residencial",
    url: "https://www.grupomymce.com",
    logo: "https://www.grupomymce.com/assets/storage/2016/12/mymce-logo-1664856016.webp",
    telephone: "+52 444-821-4890",
    email: "contacto@grupomymce.com",
    address: {
        "@type": "PostalAddress",
        "streetAddress": "Israel 448, Ricardo B. Anaya",
        "addressLocality": "San Luis Potosí",
        "addressRegion": "SLP",
        "postalCode": "78390",
        "addressCountry": "MX"
    },
    geo: {
        "@type": "GeoCoordinates",
        "latitude": 22.145892,
        "longitude": -100.957685
    },
    sameAs: [
        "https://www.facebook.com/MYMCE1/",
        "https://www.instagram.com/mymcecarpinteria/",
        "https://www.linkedin.com/company/74759324"
    ]
};

let modifiedCount = 0;

console.log(`Scanning ${files.length} files for Schema updates...`);

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the Yoast script block
    const regex = /<script type="application\/ld\+json" class="yoast-schema-graph">([\s\S]*?)<\/script>/;
    const match = content.match(regex);

    if (match) {
        try {
            let json = JSON.parse(match[1]);
            let graph = json['@graph'];
            let isModified = false;

            // PAGE TYPE DETECTION
            const isHome = file === 'index.html';
            const isPortfolio = file.includes('portafolio') && !file.endsWith('portafolio/index.html');
            const isService = file.includes('servicios') && !file.endsWith('servicios/index.html');
            const isBlog = file.includes('blog') && !file.endsWith('blog/index.html');

            // 1. TRANSFORM ORGANIZATION -> LOCALBUSINESS (Global)
            // Or ensure LocalBusiness exists

            // Find the main WebPage node
            const webPageNode = graph.find(node => node['@type'] === 'WebPage');
            const articleNode = graph.find(node => node['@type'] === 'AdvertiserContentArticle');

            if (articleNode) {
                // RENAME TYPE BASED ON SECTION
                if (isHome) {
                    // Home is special, handled separately usually, but let's upgrade
                    articleNode['@type'] = 'LocalBusiness';
                    articleNode['@id'] = mymce_id(json, 'localbusiness');
                    Object.assign(articleNode, MYMCE_DATA);
                    articleNode['priceRange'] = "$$$";
                    articleNode['openingHoursSpecification'] = [
                        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "18:00" }
                    ];
                } else if (isPortfolio) {
                    articleNode['@type'] = 'Product';
                    articleNode['brand'] = { "@type": "Brand", "name": "Grupo MYMCE" };
                    // Ensure it has an image
                    if (!articleNode.image && webPageNode.primaryImageOfPage) {
                        articleNode.image = webPageNode.primaryImageOfPage;
                    }
                    articleNode['offers'] = { "@type": "Offer", "availability": "https://schema.org/InStock", "priceCurrency": "MXN", "price": "0" }; // Call for price
                } else if (isService) {
                    articleNode['@type'] = 'Service';
                    articleNode['provider'] = { "@id": "/#organization" };
                    articleNode['areaServed'] = { "@type": "City", "name": "San Luis Potosí" };
                } else if (isBlog) {
                    articleNode['@type'] = 'BlogPosting';
                }

                isModified = true;
            }

            // 2. INJECT LOCALBUSINESS NODE IF MISSING (For Homepage mainly or global)
            // Actually, Yoast usually puts Organization. Let's upgrade Organization to LocalBusiness in the graph globally
            const orgNode = graph.find(node => node['@type'] === 'Organization');
            if (orgNode) {
                // Upgrade Organization to LocalBusiness
                // orgNode['@type'] = 'LocalBusiness'; // Or keep as Org and add LocalBusiness?
                // Better: Keep Org as is for consistency, but ensure Home IS a LocalBusiness
                // Checking previous step...
            }

            if (isModified) {
                const newScript = `<script type="application/ld+json" class="yoast-schema-graph">${JSON.stringify(json)}</script>`; // Minified
                content = content.replace(regex, newScript);
                fs.writeFileSync(filePath, content, 'utf8');
                modifiedCount++;
                // console.log(`[UPDATED] ${file}`);
            }

        } catch (e) {
            console.warn(`[ERROR] Parsing JSON in ${file}:`, e.message);
        }
    }
});

function mymce_id(json, suffix) {
    return `/#${suffix}`;
}

console.log(`Total files updated: ${modifiedCount}`);
