// Writes the share image (public/og.png, 1200×630) and the home-screen icon (public/apple-touch-icon.png, 180×180)
// before every build (plan Task 7). The share image is the site in one picture: the mask, a copper trace with gold
// pads, the name and the hero's sentence, and no photo. Rendered by sharp from SVG. Its words are drawn as outlines
// from the site's own two typefaces in the @fontsource packages: sharp's own font library cannot read their woff2
// files and draws empty boxes, and fontkit cannot set a variable woff2's weight, so each is unpacked to TrueType first.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import * as fontkit from 'fontkit';
import woff2 from 'wawoff2';

const face = async (name) => fontkit.create(Buffer.from(await woff2.decompress(readFileSync(`node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`))));
const [brico, hanken] = [await face('bricolage-grotesque'), await face('hanken-grotesk')];
const display = brico.getVariation({ wght: 800 });
const [body, bold] = [hanken.getVariation({ wght: 400 }), hanken.getVariation({ wght: 600 })];

// one line of words as one path, its baseline at y, tracked by `track` em
const words = (f, s, x, y, size, fill, track = 0) => {
  const k = size / f.unitsPerEm;
  const run = f.layout(s);
  let pen = 0;
  const d = run.glyphs.map((g, i) => {
    const at = pen;
    pen += run.positions[i].xAdvance + track * f.unitsPerEm;
    return g.path.scale(k, -k).translate(x + at * k, y).toSVG();
  }).join('');
  return `<path fill="${fill}" d="${d}"/>`;
};

const c = { mask: '#0b1d21', copper: '#3b7a82', gold: '#d8b46a', silk: '#eaf2f1', dim: '#9db6b8' };
// the hero's sentence (src/components/Hero.astro), in two lines
const lines = ['I build systems from code down to hardware: GPUs on', 'FPGAs, CUDA programs, filesystems and distributed runtimes.'];

// the trace comes down the left edge past a pad by each block of words, turns, and runs out along the bottom
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${c.mask}"/>
  <path d="M96 0V478q0 30 30 30H1200" fill="none" stroke="${c.copper}" stroke-width="5"/>
  <circle cx="96" cy="210" r="11" fill="${c.gold}"/>
  <circle cx="96" cy="356" r="11" fill="${c.gold}"/>
  <circle cx="1010" cy="508" r="11" fill="${c.gold}"/>
  ${words(display, 'Jason Nikas', 146, 252, 124, c.silk, -0.03)}
  ${lines.map((l, i) => words(body, l, 150, 368 + i * 48, 34, c.silk)).join('')}
  ${words(bold, 'njason.dev', 150, 572, 28, c.dim)}
</svg>`;

await sharp(Buffer.from(og)).png().toFile('public/og.png');
// iOS fills a transparent icon with black and rounds the corners itself: the mask square, edge to edge
const icon = readFileSync('public/favicon.svg', 'utf8').replace(/ rx="14"/, '');
await sharp(Buffer.from(icon), { density: 72 * 180 / 64 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
