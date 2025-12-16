const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://www.grupomymce.com/wp-content/uploads/2023/08/20230628_125305.mp4';
const dest = path.join(process.cwd(), 'assets/storage/2023/08/20230628_125305.mp4');

console.log(`Re-downloading ${path.basename(dest)}...`);

const file = fs.createWriteStream(dest);
https.get(url, (res) => {
    if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('OK - Downloaded successfully.');
        });
    } else {
        console.error(`Failed with status ${res.statusCode}`);
        fs.unlinkSync(dest);
    }
}).on('error', (err) => {
    fs.unlinkSync(dest);
    console.error(`Error: ${err.message}`);
});
