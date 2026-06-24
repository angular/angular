import {Deployment} from './deployments.mjs';
import {join} from 'path';
import {readFileSync, writeFileSync} from 'fs';

export async function generateSitemap(deployment: Deployment, distDir: string) {
  const servingUrlWithoutEndingSlash = deployment.servingUrl.endsWith('/')
    ? deployment.servingUrl.slice(0, -1)
    : deployment.servingUrl;

  /** Timestamp string used to of the last file update. */
  const lastModifiedTimestamp = new Date().toISOString();
  /** An object containing all of the routes available within the application. */
  const routes = JSON.parse(readFileSync(join(distDir, 'prerendered-routes.json'), 'utf-8'));
  /** The generated sitemap string. */
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Object.keys(routes.routes)
    .map((route) => {
      const routeWithoutLeadingSlash = route.startsWith('/') ? route.slice(1) : route;
      return `
    <url>
      <loc>${servingUrlWithoutEndingSlash}/${routeWithoutLeadingSlash}</loc>
      <lastmod>${lastModifiedTimestamp}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
        `;
    })
    .join('')}
  </urlset>`;
  writeFileSync(join(distDir, 'browser', 'sitemap.xml'), sitemap, 'utf-8');
  console.log(`Generated sitemap with ${Object.keys(routes.routes).length} entries.`);
}
