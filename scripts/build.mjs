import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const standalone = path.join(root, 'standalone');
await mkdir(output, { recursive: true });
await mkdir(standalone, { recursive: true });
const html = await readFile(path.join(root, 'index.html'), 'utf8');
await writeFile(path.join(output, 'index.html'), html);
const planner = await readFile(path.join(root, 'planner.html'), 'utf8');
await writeFile(path.join(output, 'planner.html'), planner);
for (const page of ['disclaimer.html', 'sources.html']) await cp(path.join(root,page),path.join(output,page));
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await cp(path.join(root, '404.html'), path.join(output, '404.html'));
for (const notice of ['LICENSE','THIRD_PARTY_NOTICES.md','AUTHORS.md']) await cp(path.join(root,notice),path.join(output,notice));

// A separate, self-contained edition preserves direct file:// use without CDNs.
let css = await readFile(path.join(root, 'assets/app.css'), 'utf8');
for (const weight of [400, 500, 600, 700]) {
  const font = await readFile(path.join(root, `assets/fonts/poppins-${weight}.ttf`));
  css = css.replace(`url('fonts/poppins-${weight}.ttf')`, `url('data:font/ttf;base64,${font.toString('base64')}')`);
}
let portable = planner.replace('<html lang="en">','<html lang="en" data-portable="true">').replace('href="index.html" aria-label="Laurel home"', 'href="#top" aria-label="Laurel home"').replace('<link rel="stylesheet" href="assets/app.css">', () => `<style>\n${css}\n</style>`);
const theme = await readFile(path.join(root,'assets/theme.css'),'utf8');
portable = portable.replace(/<link rel="stylesheet" href="assets\/theme\.css(?:\?[^"<>]*)?">/,()=>`<style>\n${theme}\n</style>`);
const design = await readFile(path.join(root,'assets/design.css'),'utf8');
portable = portable.replace(/<link rel="stylesheet" href="assets\/design\.css(?:\?[^"<>]*)?">/,()=>`<style>\n${design}\n</style>`);
const mobile = await readFile(path.join(root,'assets/mobile.css'),'utf8');
portable = portable.replace(/<link rel="stylesheet" href="assets\/mobile\.css(?:\?[^"<>]*)?">/,()=>`<style>\n${mobile}\n</style>`);
portable = portable.replaceAll('href="index.html"','href="#top"').replaceAll('href="disclaimer.html#privacy"','href="#guide"');
portable = portable.replace(/href="planner\.html(?:#([^"<>]+))?"/g,(_,anchor)=>`href="#${anchor||'records'}"`);
portable = portable.replaceAll('href="disclaimer.html"','href="#independent"').replaceAll('href="sources.html"','href="#reference"');
for (const name of ['appearance', 'core', 'app', 'workspace', 'quick', 'planning']) {
  const js = await readFile(path.join(root, `assets/${name}.js`), 'utf8');
  const reference = new RegExp(`<script src="assets/${name}\\.js(?:\\?[^"<>]*)?"></script>`);
  portable = portable.replace(reference, () => `<script>\n${js}\n</script>`);
}
const frost = await readFile(path.join(root,'assets/glass.css'),'utf8');
portable = portable.replace(/<link rel="stylesheet" href="assets\/glass\.css(?:\?[^"<>]*)?">/,()=>`<style>\n${frost}\n</style>`);
// Preserve the font license in the portable distribution, too.
const applicationNotice = await readFile(path.join(root,'LICENSE'),'utf8');
await cp(path.join(root,'LICENSE'),path.join(standalone,'LICENSE'));
await cp(path.join(root,'THIRD_PARTY_NOTICES.md'),path.join(standalone,'THIRD_PARTY_NOTICES.md'));
portable = portable.replace('</head>', `<!-- Application notice\n${applicationNotice.replaceAll('--','—')}\n-->\n</head>`);
portable = portable.replaceAll('href="disclaimer.html#credits"','href="#independent"');
const license = await readFile(path.join(root, 'assets/fonts/OFL.txt'), 'utf8');
portable = portable.replace('</head>', `<!-- Poppins font license\n${license.replaceAll('--', '—')}\n-->\n</head>`);
await writeFile(path.join(standalone, 'index.html'), portable);
const bundledScripts = [...portable.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (bundledScripts.length !== 6 || /<script\s+src=/.test(portable)) throw new Error('Standalone build must contain all six application scripts.');
for (const match of bundledScripts) new vm.Script(match[1]);
console.log('Built dist/ for Vercel and standalone/index.html for offline use.');
