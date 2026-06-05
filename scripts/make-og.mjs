import sharp from 'sharp';
import https from 'node:https';
function fetchBuf(url){return new Promise((res,rej)=>{https.get(url,r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);});}
const logo = await fetchBuf('https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/a/Asset%20171.png');
const astro = await fetchBuf('https://qysluhfrjpcguhneqsuz.supabase.co/storage/v1/object/public/a/astronaut.png');
const W=1200,H=630;
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBF7EF"/><stop offset="1" stop-color="#EFE6D2"/></linearGradient>
    <radialGradient id="gold" cx="0.82" cy="0.2" r="0.6"><stop offset="0" stop-color="#C6A768" stop-opacity="0.30"/><stop offset="1" stop-color="#C6A768" stop-opacity="0"/></radialGradient>
    <radialGradient id="navy" cx="0.08" cy="0.95" r="0.7"><stop offset="0" stop-color="#071A3D" stop-opacity="0.09"/><stop offset="1" stop-color="#071A3D" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#gold)"/><rect width="${W}" height="${H}" fill="url(#navy)"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#C6A768"/>
  <text x="70" y="292" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="800" fill="#071A3D" letter-spacing="-1">Study in Turkey</text>
  <text x="72" y="350" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700" fill="#7a5c18">Admission &#183; Residence &#183; Scholarships</text>
  <text x="72" y="407" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600" fill="#3b4a63">ACCA EDU &#183; Istanbul, Turkiye</text>
  <rect x="72" y="442" width="150" height="6" rx="3" fill="#C6A768"/>
</svg>`);
const logoR = await sharp(logo).resize({height:92,withoutEnlargement:true}).png().toBuffer();
const astroR = await sharp(astro).resize({height:540,fit:'inside'}).png().toBuffer();
const am = await sharp(astroR).metadata();
const out = await sharp(bg).composite([
  { input: logoR, top: 66, left: 70 },
  { input: astroR, top: Math.round((H-am.height)/2), left: W - am.width - 24 },
]).jpeg({quality:86,mozjpeg:true}).toFile('public/assets/og-cover.jpg');
console.log('og-cover.jpg', out.width+'x'+out.height, (out.size/1024).toFixed(0)+'KB | astro', am.width+'x'+am.height);
