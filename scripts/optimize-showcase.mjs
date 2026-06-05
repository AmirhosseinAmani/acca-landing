import sharp from 'sharp';
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const OUT = 'public/assets/optimized';
const names = ['C1', 'C2', 'C3', 'C4', 'C5'];

function fetchBuf(url) {
  return new Promise((res, rej) => {
    https.get(url, (r) => {
      if (r.statusCode !== 200) { rej(new Error('HTTP ' + r.statusCode)); return; }
      const c = [];
      r.on('data', (d) => c.push(d));
      r.on('end', () => res(Buffer.concat(c)));
    }).on('error', rej);
  });
}

const refPath = path.join(OUT, 'showcase-scholarship-720.webp');
const ref = await sharp(refPath).metadata();
console.log('REF showcase-scholarship-720.webp:', ref.width + 'x' + ref.height, fs.statSync(refPath).size + 'B');

for (const n of names) {
  const url = `https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/a/${n}.jpg`;
  const buf = await fetchBuf(url);
  const meta = await sharp(buf).metadata();
  const out = path.join(OUT, `showcase-${n.toLowerCase()}.webp`);
  const info = await sharp(buf)
    .resize({ width: 1080, height: 1080, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(out);
  console.log(`${n}: src ${meta.width}x${meta.height} ${(buf.length / 1024).toFixed(0)}KB  ->  ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB  ${path.basename(out)}`);
}
