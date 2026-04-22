#!/usr/bin/env node
//
// Sitemap generator for hourspend.one
// Scans /public for every index.html, emits /public/sitemap.xml with
// canonical URLs, lastmod (file mtime → ISO date), and a reasonable
// priority per path depth. Run after generate-pseo.js during build.
//

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, 'public');
const SITE_ORIGIN = 'https://hourspend.one';
const SITEMAP_OUT = path.join(PUBLIC_DIR, 'sitemap.xml');

// Paths that must not appear in the sitemap
const EXCLUDE = new Set([
  '404.html',
  // Any other internal-only pages live here
]);

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (entry.isFile() && entry.name === 'index.html') {
      acc.push(full);
    }
  }
  return acc;
}

function toUrl(indexHtmlPath) {
  const rel = path.relative(PUBLIC_DIR, path.dirname(indexHtmlPath));
  if (rel === '' || rel === '.') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${rel.replace(/\\/g, '/')}`;
}

function priorityFor(url) {
  if (url === `${SITE_ORIGIN}/`) return '1.0';
  const depth = url.replace(SITE_ORIGIN + '/', '').split('/').filter(Boolean).length;
  if (depth <= 1) return '0.9';
  if (depth === 2) return '0.7';
  return '0.5';
}

function lastmodFor(filePath) {
  const stat = fs.statSync(filePath);
  return stat.mtime.toISOString().slice(0, 10); // YYYY-MM-DD
}

function changefreqFor(url) {
  if (url === `${SITE_ORIGIN}/`) return 'weekly';
  if (url.includes('/blog/')) return 'monthly';
  return 'monthly';
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('public/ directory not found.');
    process.exit(1);
  }

  const files = walk(PUBLIC_DIR)
    .filter((f) => !EXCLUDE.has(path.relative(PUBLIC_DIR, f)));

  const urls = files
    .map((f) => ({
      loc: toUrl(f),
      lastmod: lastmodFor(f),
      changefreq: changefreqFor(toUrl(f)),
      priority: priorityFor(toUrl(f)),
    }))
    // Homepage first, then alphabetical
    .sort((a, b) => {
      if (a.loc === `${SITE_ORIGIN}/`) return -1;
      if (b.loc === `${SITE_ORIGIN}/`) return 1;
      return a.loc.localeCompare(b.loc);
    });

  const xmlUrls = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>
`;

  fs.writeFileSync(SITEMAP_OUT, xml, 'utf8');
  console.log(`  Wrote ${urls.length} URLs to ${path.relative(process.cwd(), SITEMAP_OUT)}`);
}

main();
