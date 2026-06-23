import fs from 'fs';
import path from 'path';

// Tiny 1x1 transparent pixel PNG fallback
const base64Png = 'iVBOR0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon16.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'icon48.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'icon128.png'), buffer);

console.log('Fallback icons generated in public/');
