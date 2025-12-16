const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

const CONTENT_BLOCKS = {
    'cocinas': `
    <div class="section-item expert-content-block" style="background-color: #f9f9f9; padding: 40px 0;">
        <div class="container content">
            <div class="row">
                <div class="col-md-12">
                     <hr class="space m">
                     <h2 class="text-l">Rigor Técnico: Por qué elegimos MDF Premium vs Aglomerado</h2>
                     <p>En Grupo MYMCE, la durabilidad no es discutible. A diferencia de las cocinas comerciales que utilizan aglomerado de baja densidad, nosotros integramos tableros de MDF de alta ingeniería y recubrimientos sellados.</p>
                     <hr class="space s">
                     <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Característica</th>
                                <th>MDF Premium (Estándar MYMCE)</th>
                                <th>Aglomerado Comercial</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Densidad</strong></td>
                                <td>Alta (>700 kg/m³). Soporta tornillería sin desmoronarse.</td>
                                <td>Baja. Tiende a aflojarse con el uso diario.</td>
                            </tr>
                            <tr>
                                <td><strong>Resistencia a Humedad</strong></td>
                                <td>Recubrimientos sellados (Foil/Laca) que repelen líquidos.</td>
                                <td>Absorbente. Se hincha con derrames frecuentes.</td>
                            </tr>
                            <tr>
                                <td><strong>Vida Útil Estimada</strong></td>
                                <td>15-20 Años con mantenimiento mínimo.</td>
                                <td>5-7 Años antes de presentar deformaciones.</td>
                            </tr>
                        </tbody>
                     </table>
                     <hr class="space s">
                     <div class="text-center">
                        <a href="/contact" class="btn btn-lg">Cotizar Calidad Premium</a>
                     </div>
                </div>
            </div>
        </div>
    </div>`,

    'closets': `
    <div class="section-item expert-content-block" style="background-color: #f9f9f9; padding: 40px 0;">
        <div class="container content">
            <div class="row">
                <div class="col-md-12">
                     <hr class="space m">
                     <h2 class="text-l">Herrajes y Ergonomía: El Secreto de un Closet Funcional</h2>
                     <p>Un closet no solo debe verse bien, debe sentirse bien al usarse. La diferencia está en los mecanismos ocultos que garantizan un cierre suave y una apertura sin esfuerzo.</p>
                     <div class="row">
                        <div class="col-md-6">
                            <h4>Cierre Suave (Soft-Close)</h4>
                            <p>Implementamos correderas ocultas y bisagras con pistón hidráulico que evitan golpes, protegiendo la estructura del mueble y reduciendo el ruido en su habitación.</p>
                        </div>
                        <div class="col-md-6">
                            <h4>Optimización de Espacio</h4>
                            <p>Analizamos su guardarropa para diseñar las alturas exactas de colgado (largo vs corto), zapateras extraíbles y pantaloneras que duplican la capacidad real de almacenamiento.</p>
                        </div>
                     </div>
                     <hr class="space s">
                     <p><strong>¿Cansado de puertas que se traban?</strong> Actualice a un sistema de deslizamiento premium.</p>
                     <div class="text-center">
                        <a href="/contact" class="btn btn-lg">Agendar Visita de Diseño</a>
                     </div>
                </div>
            </div>
        </div>
    </div>`
};

async function injectContent() {
    console.log('🚀 Injecting E-E-A-T Content...');

    // 1. Cocinas
    const cocinasPath = path.join(ROOT_DIR, 'servicios/cocinas/index.html');
    if (fs.existsSync(cocinasPath)) {
        let content = fs.readFileSync(cocinasPath, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });

        // Inject before the contact section or footer
        // Looking for the last content section usually
        const target = $('.section-item').last();
        if (target.length) {
            target.before(CONTENT_BLOCKS['cocinas']);
            fs.writeFileSync(cocinasPath, $.html());
            console.log('✅ Injected content into Cocinas');
        } else {
            console.warn('⚠️ Could not find injection point for Cocinas');
        }
    }

    // 2. Closets
    const closetsPath = path.join(ROOT_DIR, 'servicios/closets-vestidores/index.html');
    if (fs.existsSync(closetsPath)) {
        let content = fs.readFileSync(closetsPath, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false });

        const target = $('.section-item').last();
        if (target.length) {
            target.before(CONTENT_BLOCKS['closets']);
            fs.writeFileSync(closetsPath, $.html());
            console.log('✅ Injected content into Closets');
        } else {
            console.warn('⚠️ Could not find injection point for Closets');
        }
    }
}

injectContent();
