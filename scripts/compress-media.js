const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const os = require('os');
const { exec } = require('child_process');

let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.warn('⚠️ sharp not found. Image compression will be skipped.');
}

let ffmpegPath;
try {
    ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
} catch (e) {
    console.warn('⚠️ @ffmpeg-installer/ffmpeg not found. Video compression will be skipped.');
}

const ROOT_DIR = path.resolve(__dirname, '../').replace(/\\/g, '/');

// Thresholds
const LARGE_VIDEO_THRESHOLD = 5 * 1024 * 1024; // 5MB
const LARGE_IMAGE_THRESHOLD = 500 * 1024; // 500KB

async function compressMedia() {
    console.log('🚀 Starting Media Compression...');
    console.log(`🎥 FFmpeg Path: ${ffmpegPath}`);

    // 1. Image Compression (PNG/JPG -> WebP or Optimized)
    // We will focus on largest images first
    if (sharp) {
        console.log('🖼️ Scanning for heavy images...');
        const images = glob.sync(`${ROOT_DIR}/**/*.{png,jpg,jpeg,webp}`, {
            ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`]
        });

        for (const file of images) {
            const stats = fs.statSync(file);
            if (stats.size > LARGE_IMAGE_THRESHOLD) {
                console.log(`Processing Image: ${path.basename(file)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

                try {
                    const tempFile = file + '.tmp';
                    // Compress: Quality 80, resize if absurdly large (>2500px width)
                    await sharp(file)
                        .resize({ width: 2500, withoutEnlargement: true })
                        .toFile(tempFile);

                    const newStats = fs.statSync(tempFile);
                    if (newStats.size < stats.size) {
                        await fs.move(tempFile, file, { overwrite: true });
                        console.log(`✅ Reduced to ${(newStats.size / 1024 / 1024).toFixed(2)} MB`);
                    } else {
                        await fs.remove(tempFile); // Keep original if no gain
                        console.log('⏭️ No reduction, kept original.');
                    }
                } catch (e) {
                    console.error(`❌ Error compressing image ${file}:`, e.message);
                }
            }
        }
    }

    // 2. Video Compression
    if (ffmpegPath) {
        console.log('🎬 Scanning for heavy videos...');
        const videos = glob.sync(`${ROOT_DIR}/**/*.mp4`, {
            ignore: [`${ROOT_DIR}/node_modules/**`, `${ROOT_DIR}/_dist/**`, `${ROOT_DIR}/scripts/**`]
        });

        for (const file of videos) {
            const stats = fs.statSync(file);
            if (stats.size > LARGE_VIDEO_THRESHOLD) {
                console.log(`Processing Video: ${path.basename(file)} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

                const tempFile = file.replace('.mp4', '_compressed.mp4');

                // Compression Command: CRF 28 (Good compression), Preset medium, limit scale to 1280:-1 (720p) if very large
                // Note: -vf "scale='min(1280,iw)':-2" keeps aspect ratio and downscales only if width > 1280
                const cmd = `"${ffmpegPath}" -i "${file}" -vcodec libx264 -crf 28 -preset fast -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k -movflags +faststart -y "${tempFile}"`;

                await new Promise((resolve) => {
                    exec(cmd, { cwd: path.dirname(file) }, async (error, stdout, stderr) => {
                        if (error) {
                            console.error(`❌ FFmpeg Error: ${error.message}`);
                            if (fs.existsSync(tempFile)) await fs.remove(tempFile);
                            resolve();
                            return;
                        }

                        // Check result
                        if (fs.existsSync(tempFile)) {
                            const newStats = fs.statSync(tempFile);
                            if (newStats.size > 0 && newStats.size < stats.size) {
                                console.log(`✅ Compressed: ${(newStats.size / 1024 / 1024).toFixed(2)} MB`);
                                await fs.move(tempFile, file, { overwrite: true });
                            } else {
                                console.log('⏭️ Compression didn\'t help significantly, keeping original.');
                                await fs.remove(tempFile);
                            }
                        } else {
                            console.error('❌ Output file not created.');
                        }
                        resolve();
                    });
                });
            }
        }
    }

    console.log('🎉 Media Compression Finished.');
}

compressMedia().catch(err => console.error(err));
