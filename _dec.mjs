import { PNG } from 'pngjs'; import jsQR from 'jsqr'; import { readFileSync } from 'node:fs';
const png = PNG.sync.read(readFileSync('/home/user/ivsaltfl/public/assets/consent-qr.png'));
console.log('Decoded:', jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data);
