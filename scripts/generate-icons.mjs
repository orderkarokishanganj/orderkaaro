// Generates the app icons in public/icons from one SVG: a white basket on Sage & Oat green.
// Run: node scripts/generate-icons.mjs (outputs are committed; rerun only to change the icon).
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}public/icons`;
mkdirSync(out, { recursive: true });

const SAGE = '#4E6E58';
// lucide "shopping-basket" (24x24, stroke icon).
const BASKET = [
  'm15 11-1 9', 'm19 11-4-7', 'M2 11h20', 'm3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4',
  'M4.5 15.5h15', 'm5 11 4-7', 'm9 11 1 9',
].map((d) => `<path d="${d}"/>`).join('');

/** @param {{ rounded: boolean, glyph: number }} o glyph = basket size as a share of the icon */
function svg({ rounded, glyph }) {
  const size = 512;
  const scale = (size * glyph) / 24;
  const offset = (size - 24 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rounded ? 112 : 0}" fill="${SAGE}"/>
  <g transform="translate(${offset} ${offset + scale * 0.6}) scale(${scale})" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${BASKET}</g>
</svg>`;
}

const anyIcon = svg({ rounded: true, glyph: 0.62 });
// Maskable icons are cropped to a circle by Android: full-bleed background, glyph inside the safe zone.
const maskable = svg({ rounded: false, glyph: 0.5 });

writeFileSync(`${out}/icon.svg`, anyIcon);
const jobs = [
  [anyIcon, 'icon-192.png', 192],
  [anyIcon, 'icon-512.png', 512],
  [maskable, 'maskable-512.png', 512],
  [maskable, 'maskable-192.png', 192],
  [maskable, 'apple-touch-icon.png', 180], // iOS rounds the corners itself
  [anyIcon, 'favicon-32.png', 32],
];
for (const [source, name, size] of jobs) {
  await sharp(Buffer.from(source)).resize(size, size).png({ compressionLevel: 9 }).toFile(`${out}/${name}`);
}
// A small share image for links (WhatsApp, Facebook): the original logo, resized and compressed.
await sharp(`${root}public/logo.jpeg`).resize(1200, 630, { fit: 'contain', background: '#FFFFFF' }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${out}/share.jpg`);
console.log(`Icons written to public/icons: ${jobs.map((j) => j[1]).join(', ')}, icon.svg, share.jpg`);
