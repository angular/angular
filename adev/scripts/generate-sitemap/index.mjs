/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

const distPath = 'dist/bin/adev/dist';
const routesPath = join(distPath, 'prerendered-routes.json');
const sitemapPath = join(distPath, 'browser', 'sitemap.xml');

const routes = JSON.parse(readFileSync(routesPath, 'utf-8'));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(routes.routes)
  .map(
    (route) => `
  <url>
    <loc>https://angular.dev${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,
  )
  .join('')}
</urlset>`;

writeFileSync(sitemapPath, sitemap);

// tslint:disable-next-line:no-console
console.log(`Sitemap generated at ${sitemapPath}`);
