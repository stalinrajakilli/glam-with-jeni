// Builds the standalone prototype pages in prototype/ from the design sources in design/.
// Usage: node tools/build-prototype.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  { src: 'App.dc.html', out: 'index.html', radius: 36 },
  { src: 'LogoSignature.dc.html', out: 'logo-a-signature.html', radius: 20 },
  { src: 'LogoAlmond.dc.html', out: 'logo-b-almond.html', radius: 20 },
  { src: 'LogoSeal.dc.html', out: 'logo-c-seal.html', radius: 20 },
  { src: 'LogoPolish.dc.html', out: 'logo-d-polish.html', radius: 20 },
];

const frame = (radius) => `<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body { min-height: 100%; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #EDE4EA; padding: 24px; box-sizing: border-box; }
  #dc-root > div { border-radius: ${radius}px; box-shadow: 0 20px 60px rgba(42, 26, 46, 0.22); }
  @media (max-width: 440px) { body { padding: 0; align-items: flex-start; } #dc-root > div { border-radius: 0; box-shadow: none; } }
</style>
<script src="vendor/preact.umd.js"></script>
<script src="dc-lite.js"></script>`;

for (const page of PAGES) {
  let html = readFileSync(join(root, 'design', page.src), 'utf8');
  if (!html.includes('<script src="./support.js"></script>')) throw new Error(`${page.src}: runtime line not found`);
  html = html
    .replace('<script src="./support.js"></script>', frame(page.radius))
    .replace('<x-dc>', '<template id="dc">')
    .replace('</x-dc>', '</template>');
  writeFileSync(join(root, 'prototype', page.out), html);
  console.log(`built prototype/${page.out}`);
}

const logos = PAGES.filter((p) => p.out.startsWith('logo-'));
writeFileSync(join(root, 'prototype', 'logos.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GlamWithJeni logo directions</title>
<style>
  body { margin: 0; background: #EDE4EA; font-family: system-ui, sans-serif; color: #2A1A2E; padding: 32px 16px; }
  h1 { font-size: 28px; margin: 0 auto 8px; max-width: 1240px; }
  p { margin: 0 auto 24px; max-width: 1240px; color: #5B4A57; }
  .grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; max-width: 1240px; margin: 0 auto; }
  figure { margin: 0; background: #fff; border-radius: 20px; overflow: hidden; width: 608px; max-width: 100%; }
  .clip { overflow-x: auto; }
  iframe { width: 608px; height: 688px; border: 0; display: block; }
  figcaption { padding: 12px 16px; font-weight: 600; }
  a { color: #B83A63; }
</style>
</head>
<body>
<h1>Logo directions</h1>
<p>Direction A (Signature script) is the chosen logo. <a href="index.html">Open the app prototype</a></p>
<div class="grid">
${logos.map((p) => `  <figure><div class="clip"><iframe src="${p.out}" title="${p.out}" loading="lazy"></iframe></div><figcaption>${p.out.replace('.html', '').replace('logo-', '').replace(/-/g, ' ').toUpperCase()}</figcaption></figure>`).join('\n')}
</div>
</body>
</html>
`);
console.log('built prototype/logos.html');
