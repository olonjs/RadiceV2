import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:5173';

const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: PerplexityBot
User-agent: OAI-SearchBot
Allow: /
Allow: /*.json
Allow: /schemas/
Allow: /llms.txt
Allow: /mcp-manifest.json
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

const outPath = path.join(rootDir, 'public', 'robots.txt');
fs.writeFileSync(outPath, robotsTxt, 'utf-8');
console.log('[robots] Written -> public/robots.txt');
