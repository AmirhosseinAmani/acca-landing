import sharp from 'sharp';
import https from 'node:https';
function fetchBuf(url){return new Promise((res,rej)=>{https.get(url,r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);});}
const src = await fetchBuf('https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/a/astronaut.png');
const m0 = await sharp(src).metadata();
const out = await sharp(src)
  .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 86, alphaQuality: 100, effort: 5 })
  .toFile('public/assets/optimized/astronaut-640.webp');
const m = await sharp('public/assets/optimized/astronaut-640.webp').metadata();
console.log('source', m0.width+'x'+m0.height, 'hasAlpha:', m0.hasAlpha);
console.log('new astronaut-640.webp', out.width+'x'+out.height, (out.size/1024).toFixed(0)+'KB hasAlpha:', m.hasAlpha);
