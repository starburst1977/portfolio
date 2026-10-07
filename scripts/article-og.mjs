#!/usr/bin/env node
// Dev tool, not part of the build: renders the social preview image (1200x675) for every
// Apply Kit article into public/apply-kit/og/<slug>.png. Run after adding an article:
//
//   node scripts/article-og.mjs
//
// Uses Playwright from the kit (cv-kit/kit/node_modules) and the site's own Geist font.

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(pathToFileURL(resolve(site, '../cv-kit/kit/node_modules/playwright/index.mjs')).href);
const articlesDir = join(site, 'src/apply-kit/articles');
const outDir = join(site, 'public/apply-kit/og');
const font = pathToFileURL(join(site, 'public/apply-kit/fonts/geist-latin-wght-normal.woff2')).href;
const sheet = { en: 'cv-en.png', de: 'cv-de.png' };

const field = (src, name) => (src.match(new RegExp(`^${name}:\\s*(.+)$`, 'm')) ?? [])[1]?.trim().replace(/^["']|["']$/g, '');
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 675 } });

for (const file of (await readdir(articlesDir)).filter((f) => /\.mdx?$/.test(f))) {
  const src = await readFile(join(articlesDir, file), 'utf8');
  const slug = file.replace(/\.mdx?$/, '');
  const title = field(src, 'title');
  const lang = field(src, 'lang') ?? 'en';
  const label = lang === 'de' ? 'Apply Kit · Artikel' : 'Apply Kit · Article';
  const img = pathToFileURL(join(site, 'src/assets/apply-kit', sheet[lang] ?? sheet.en)).href;
  const html = `<!doctype html><html><head><style>
    @font-face { font-family: Geist; src: url(${font}); font-weight: 100 900; }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 675px; overflow: hidden; font-family: Geist, sans-serif; color: #0A0A0A;
      background: linear-gradient(135deg, #FFFFFF 0%, #F5F3FF 100%); position: relative; }
    .text { position: absolute; left: 72px; top: 0; bottom: 0; width: 610px; display: flex; flex-direction: column; justify-content: center; }
    .pill { align-self: flex-start; font-size: 20px; font-weight: 600; color: #4F46E5; background: #EEF2FF; padding: 8px 16px; border-radius: 999px; }
    h1 { font-size: 54px; line-height: 1.08; font-weight: 700; letter-spacing: -0.03em; margin-top: 28px; }
    .by { margin-top: 36px; font-size: 22px; color: #6B6B6B; }
    .by b { color: #0A0A0A; font-weight: 600; }
    .sheet { position: absolute; right: 70px; top: 70px; width: 400px; transform: rotate(4deg); background: #fff;
      border-radius: 6px; box-shadow: 0 30px 60px -20px rgba(30, 27, 75, .28), 0 2px 8px rgba(0,0,0,.06); overflow: hidden; }
    .sheet img { display: block; width: 100%; }
  </style></head><body>
    <div class="text"><span class="pill">${esc(label)}</span><h1>${esc(title)}</h1><p class="by"><b>Sven Read</b> · svenread.com/apply-kit</p></div>
    <div class="sheet"><img src="${img}"></div>
  </body></html>`;
  // A page built in memory may not load local files, so render from a file.
  const tmp = join(tmpdir(), `og-${slug}.html`);
  await writeFile(tmp, html);
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(outDir, `${slug}.png`) });
  console.log(`✓ public/apply-kit/og/${slug}.png`);
}
await browser.close();
