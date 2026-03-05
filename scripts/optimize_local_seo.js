const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const updates = [
    {
        file: 'index.html',
        oldTitle: /<title>.*?<\/title>/,
        newTitle: '<title>Carpintería Residencial y Cocinas Integrales en San Luis Potosí | Grupo MYMCE</title>',
        oldDesc: /<meta name="description" content="([^"]+)">/,
        newDesc: '<meta name="description" content="Carpintería Residencial en San Luis Potosí (SLP). Diseño, Fabricación y Gestión Completa de Cocinas, Closets y Puertas. Agenda tu Cita Hoy.">'
    },
    {
        file: 'servicios/cocinas/index.html',
        oldTitle: /<title>.*?<\/title>/,
        newTitle: '<title>Cocinas Integrales en San Luis Potosí | Diseño y Fabricación a Medida | MYMCE</title>',
        oldDesc: /<meta name="description" content="([^"]+)">/,
        newDesc: '<meta name="description" content="Cocinas Integrales en San Luis Potosí (SLP). Servicio Llave en Mano con materiales premium y diseños a medida. Contáctanos para cotizar tu proyecto hoy mismo.">'
    },
    {
        file: 'servicios/closets-vestidores/index.html',
        oldTitle: /<title>.*?<\/title>/,
        newTitle: '<title>Closets y Vestidores en San Luis Potosí | Diseño a Medida | MYMCE</title>',
        oldDesc: /<meta name="description" content="([^"]+)">/,
        newDesc: '<meta name="description" content="Fábrica de Closets y Vestidores en San Luis Potosí (SLP). Soluciones de almacenamiento inteligentes, elegantes y personalizadas para tu hogar.">'
    },
    {
        file: 'servicios/diseno-y-fabricacion-de-puertas/index.html',
        oldTitle: /<title>.*?<\/title>/,
        newTitle: '<title>Fábrica de Puertas de Madera y PVC en San Luis Potosí | MYMCE</title>',
        oldDesc: /<meta name="description" content="([^"]+)">/,
        newDesc: '<meta name="description" content="Diseño y fabricación de Puertas a medida en San Luis Potosí (SLP). Especialistas en recubrimientos de PVC, Laminado, Chapa de Madera y Melaminas.">'
    },
    {
        file: 'portafolio/index.html',
        oldTitle: /<title>.*?<\/title>/,
        newTitle: '<title>Portafolio de Proyectos en San Luis Potosí | Cocinas y Closets | MYMCE</title>',
        oldDesc: /<meta name="description" content="([^"]+)">/,
        newDesc: '<meta name="description" content="Explora nuestro portafolio de proyectos de carpintería residencial en San Luis Potosí (SLP). Conoce nuestros exitosos diseños de Cocinas Integrales y Vestidores.">'
    }
];

updates.forEach(update => {
    const filePath = path.join(ROOT_DIR, update.file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        if (update.oldTitle.test(content)) {
            content = content.replace(update.oldTitle, update.newTitle);
            modified = true;
        }

        if (update.oldDesc.test(content)) {
            content = content.replace(update.oldDesc, update.newDesc);
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated Local SEO tags in: ${update.file}`);
        } else {
            console.log(`No matching tags found in: ${update.file}`);
        }
    } else {
        console.error(`File not found: ${update.file}`);
    }
});
