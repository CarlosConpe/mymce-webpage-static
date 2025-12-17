const sharp = require('sharp');
const path = require('path');

const inputInfo = {
    dir: 'assets/storage/2023/07',
    file: '20230708_144508-1920x1080.webp'
};

const outputInfo = {
    dir: 'assets/storage/2023/07',
    file: 'hero-poster-mobile.webp'
};

const inputPath = path.join(__dirname, inputInfo.dir, inputInfo.file);
const outputPath = path.join(__dirname, outputInfo.dir, outputInfo.file);

sharp(inputPath)
    .resize(480) // Standard mobile width
    .toFile(outputPath)
    .then(info => {
        console.log('Mobile hero generated:', info);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
