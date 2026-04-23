/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console  */
import {APP_BASE_HREF} from '@angular/common';
import {renderApplication} from '@angular/platform-server';
import express from 'express';
import bootstrap from './src/main.server';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import './prerender';

const app = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = readFileSync(join(browserDistFolder, 'index.csr.html'), 'utf-8');

// Serve static files from /browser
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
  }),
);

// Mock API
app.get('/api', (req, res) => {
  res.json({data: 'API 1 response'});
});

app.get('/api-2', (req, res) => {
  res.json({data: 'API 2 response'});
});

// All regular routes use the Universal engine
app.use((req, res) => {
  const {originalUrl, baseUrl} = req;

  renderApplication(bootstrap, {
    document: indexHtml,
    url: originalUrl,
    // `publicOrigin` must be a server-controlled constant, never derived from
    // request headers, to avoid reintroducing the SSRF class closed by
    // GHSA-45q2-gjvg-7973.
    publicOrigin: 'http://localhost:4209',
    platformProviders: [{provide: APP_BASE_HREF, useValue: baseUrl}],
  }).then((response: string) => {
    res.send(response);
  });
});

app.listen(4209, () => {
  console.log('Server listening on port 4209!');
});
