const fs = require('fs');
const glob = require('glob');

const files = glob.sync('**/*.html', { ignore: ['node_modules/**', '.git/**'] });
const targets = [
    {
        find: 'https://www.grupomymce.com/assets/storage/2016/12/mymce-logo-1664856016.webp',
        replace: '/assets/storage/2016/12/logo-2.webp'
    },
    // Add other replacements here if found
    {
        find: 'http://www.grupomymce.com/assets/storage/2016/12/mymce-logo-1664856016.webp', // Handle http just in case
        replace: '/assets/storage/2016/12/logo-2.webp'
    },
    {
        find: '/assets/storage/2016/12/mymce-logo-1664856016.webp',
        replace: '/assets/storage/2016/12/logo-2.webp'
    }
];

let totalReplaced = 0;
let filesChanged = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    targets.forEach(t => {
        // Use global regex replace
        const regex = new RegExp(t.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, t.replace);
    });

    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        filesChanged++;
        // Count rough occurrences
        // (simplified, doesn't verify exact count per file but good enough)
    }
});

console.log(`Updated ${filesChanged} files.`);
