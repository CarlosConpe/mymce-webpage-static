const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Name, address and phone must match the Google Business Profile
// (Cocinas, Puertas y Closets S.A. de C.V., Av. Promoción 110, Industrial San Luis,
// 78395, tel. 444 102 3917). The site still carried the old Israel 448 address,
// the old phone and a map pinned to another business. WhatsApp (233 5607) is unchanged.
const ROOT_DIR = path.join(__dirname, '..');
const files = glob.sync('**/*.html', { cwd: ROOT_DIR, ignore: ['node_modules/**'] });

const STREET = 'Av. Promoción 110, Industrial San Luis';
// Street-level point on Av. Promoción (OpenStreetMap); refine with the profile's pin.
const GEO = '"latitude":22.104,"longitude":-100.9079';
const MAP_EMBED = 'https://maps.google.com/maps?q=Cocinas%2C+Puertas+y+Closets+S.A.+de+C.V.%2C+Av.+Promoci%C3%B3n+110%2C+Industrial+San+Luis%2C+San+Luis+Potos%C3%AD&amp;output=embed';

const REPLACEMENTS = [
    // Every spelling of the old street, including the header's line-broken one.
    [/Israel #?448,\s+Ricardo\s+B\.?\s+Anaya(?:\s+2da\s+(?:Secci[oó]n|Secc|S)\b)?/g, STREET],
    [/San Luis Potosí, San Luis Potosí,? \.? ?México\./g, 'San Luis Potosí, S.L.P. 78395, México.'],
    [/San Luis Potosí, San Luis Potosí, \. México/g, 'San Luis Potosí, S.L.P. 78395, México'],
    [/78390/g, '78395'],
    // Phone: plain, schema (one copy had a mangled non-breaking hyphen), tel: links.
    [/\+52 444[^"<\d]{0,12}821[^"<\d]{0,12}4890/g, '+52 444-102-3917'],
    [/444-821-48-90/g, '444-102-39-17'],
    [/tel:(\+?52)?4448214890/g, 'tel:4441023917'],
    [/\b4448214890\b/g, '444 102 3917'],
    [/"latitude":\s*[\d.]+,\s*"longitude":\s*-[\d.]+/g, GEO],
    [/data-src="https:\/\/www\.google\.com\/maps\/embed\?pb=[^"]*"/g, `data-src="${MAP_EMBED}"`]
];

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;
    REPLACEMENTS.forEach(([pattern, value]) => { updated = updated.replace(pattern, value); });
    if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        modifiedCount++;
    }
});

console.log(`Total files updated: ${modifiedCount}`);
