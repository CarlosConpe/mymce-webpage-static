const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Local coverage, maquila details and the empty <h3> headings left by the page
// builder. Facts come from the owner (Oct 2026): founded 1987; serves San Luis
// Potosí, Soledad, Villa de Pozos and the rest of the state; maquila machines
// MDF, melamine and PVC parts from the client's drawing, including export work
// with set tolerances.
const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });

const COVERAGE_OLD = /servir\s+a\s+todo\s+San\s+Luis\s+Potosí\s+con\s+la\s+mejor\s+calidad\./g;
const COVERAGE_NEW = 'servir a San Luis Potosí, Soledad de Graciano Sánchez, Villa de Pozos y todo el estado con la mejor calidad.';

const AREA_SERVED = JSON.stringify([
    { '@type': 'City', name: 'San Luis Potosí', sameAs: 'https://es.wikipedia.org/wiki/San_Luis_Potos%C3%AD_(ciudad)' },
    { '@type': 'City', name: 'Soledad de Graciano Sánchez' },
    { '@type': 'City', name: 'Villa de Pozos' },
    { '@type': 'State', name: 'San Luis Potosí' }
]);
const AREA_SERVED_OLD = /"areaServed":\s*\{\s*"@type":\s*"City",\s*"name":\s*"San Luis Potosí"(?:,\s*"sameAs":\s*"[^"]*")?\s*\}/g;

// Headings for the boxes whose <h3> is empty, in page order.
const EMPTY_HEADINGS = {
    'servicios/maquila-de-partes/index.html': ['Corte y enchapado preciso', 'Solo las piezas que necesitas', 'Piezas listas para tu proyecto'],
    'soluciones/carpinteria-para-arquitectos/index.html': ['Cocinas integrales a medida', 'Personalización para cada proyecto', 'Trato directo y profesional', 'Por qué elegir MYMCE']
};

const MAQUILA_ANCHOR = '<div class="col-md-12 hc_text_block_cnt"><div id="lyDP3"';
const MAQUILA_BLOCK = `<div class="col-md-12 hc_text_block_cnt"><div id="maquinados-a-medida">
<h2>Maquinados a medida en MDF, melamina y PVC</h2>
<p>Maquilamos piezas en MDF, melamina, PVC y otros tableros a partir de tu plano. Cada pedido es un proceso personalizado: ajustamos el maquinado a tus especificaciones y trabajamos con clientes que exportan y con proyectos que piden tolerancias definidas.</p>
<ul>
<li>Envíanos el plano con medidas, material y acabado de cada pieza.</li>
<li>Revisamos contigo las especificaciones y las tolerancias.</li>
<li>Maquinamos, cortamos y enchapamos las piezas.</li>
<li>Atendemos San Luis Potosí, Soledad de Graciano Sánchez, Villa de Pozos y el resto del estado.</li>
</ul>
</div></div><div class="col-md-12 hc_space_cnt"><hr class="space s    ">
</div>`;

let modifiedCount = 0;

files.forEach(file => {
    const rel = file.replace(/\\/g, '/');
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content.replace(COVERAGE_OLD, COVERAGE_NEW);
    updated = updated.replace(AREA_SERVED_OLD, `"areaServed":${AREA_SERVED}`);

    if (EMPTY_HEADINGS[rel]) {
        const headings = EMPTY_HEADINGS[rel].slice();
        updated = updated.replace(/<h3><\/h3>/g, match => (headings.length ? `<h3>${headings.shift()}</h3>` : match));
    }
    if (rel === 'corporate/acerca-de-mymce-carpinteria-profesional-en-san-luis-potosi/index.html') {
        updated = updated.replace(/<h3><\/h3>/g, '');
    }
    if (rel === 'servicios/maquila-de-partes/index.html' && !updated.includes('id="maquinados-a-medida"')) {
        updated = updated.replace(MAQUILA_ANCHOR, MAQUILA_BLOCK + MAQUILA_ANCHOR);
    }

    if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
