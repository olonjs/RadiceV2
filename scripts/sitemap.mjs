import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:5173';

function listJsonFilesRecursive(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...listJsonFilesRecursive(fullPath));
      continue;
    }
    if (item.isFile() && item.name.toLowerCase().endsWith('.json')) files.push(fullPath);
  }
  return files;
}

function toW3CDate(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function urlEntry({ loc, lastmod, changefreq, priority, comment }) {
  const lines = [];
  if (comment) lines.push(`  <!-- ${comment} -->`);
  lines.push(`  <url>`);
  lines.push(`    <loc>${loc}</loc>`);
  lines.push(`    <lastmod>${lastmod}</lastmod>`);
  lines.push(`    <changefreq>${changefreq}</changefreq>`);
  lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join('\n');
}

function sectionComment(label) {
  const bar = '='.repeat(42);
  return [
    `  <!-- ${bar} -->`,
    `  <!-- ${label.padEnd(42)} -->`,
    `  <!-- ${bar} -->`,
  ].join('\n');
}

const pagesDir = path.join(rootDir, 'src', 'data', 'pages');
const buildTime = toW3CDate(new Date());

const pageFiles = listJsonFilesRecursive(pagesDir);
const pages = pageFiles.map((fullPath) => {
  const slug = path
    .relative(pagesDir, fullPath)
    .replace(/\\/g, '/')
    .replace(/\.json$/i, '');
  const lastmod = toW3CDate(fs.statSync(fullPath).mtime);
  return { slug, lastmod };
});

const entries = [];

entries.push(sectionComment('GLOBAL AGENT DISCOVERY NODES'));
entries.push(
  urlEntry({ loc: `${baseUrl}/llms.txt`, lastmod: buildTime, changefreq: 'weekly', priority: '1.0' }),
);
entries.push(
  urlEntry({ loc: `${baseUrl}/mcp-manifest.json`, lastmod: buildTime, changefreq: 'weekly', priority: '1.0' }),
);

for (const { slug, lastmod } of pages) {
  const humanPath = slug === 'home' ? '/' : `/${slug}`;
  const label = `PAGE: ${slug.toUpperCase()}`;

  entries.push(sectionComment(label));
  entries.push(
    urlEntry({ loc: `${baseUrl}${humanPath}`, lastmod, changefreq: 'daily', priority: '0.9', comment: 'Human UI' }),
  );
  entries.push(
    urlEntry({ loc: `${baseUrl}/${slug}.json`, lastmod, changefreq: 'daily', priority: '0.9', comment: 'Machine Payload' }),
  );
  entries.push(
    urlEntry({ loc: `${baseUrl}/schemas/${slug}.schema.json`, lastmod: buildTime, changefreq: 'weekly', priority: '0.8', comment: 'Machine Contract (Schema)' }),
  );
}

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ``,
  entries.join('\n'),
  ``,
  `</urlset>`,
].join('\n');

const outPath = path.join(rootDir, 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log('[sitemap] Written -> public/sitemap.xml');
