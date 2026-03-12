import {Deployment} from './deployments.mjs';
import {join} from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';

export async function generateSitemap(deployment: Deployment, distDir: string): Promise<void> {
  /** Timestamp string used to of the last file update. */
  const lastModifiedTimestamp = new Date().toISOString();
  /** An object containing all of the routes available within the application. */
  const {routes} = JSON.parse(await readFile(join(distDir, 'prerendered-routes.json'), 'utf-8'));
  const routePaths = Object.keys(routes);

  /** The generated sitemap string. */
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routePaths
    .map(
      (route) => `<url>
      <loc>${joinUrlParts(deployment.servingUrl, route)}</loc>
      <lastmod>${lastModifiedTimestamp}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`,
    )
    .join('')}
  </urlset>`;

  await writeFile(join(distDir, 'browser', 'sitemap.xml'), sitemap, 'utf-8');

  console.log(`Generated sitemap with ${routePaths.length} entries.`);
}

function joinUrlParts(...parts: string[]): string {
  const normalizeParts: string[] = [];
  for (const part of parts) {
    if (part === '') {
      // Skip any empty parts
      continue;
    }

    let normalizedPart = part;
    if (part[0] === '/') {
      normalizedPart = normalizedPart.slice(1);
    }
    if (part.at(-1) === '/') {
      normalizedPart = normalizedPart.slice(0, -1);
    }
    if (normalizedPart !== '') {
      normalizeParts.push(normalizedPart);
    }
  }

  return normalizeParts.join('/');
}
