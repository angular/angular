/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
import 'zone.js/node';
import {APP_BASE_HREF} from '@angular/common';
import {renderModule} from '@angular/platform-server';
import * as express from 'express';
import {AppServerModule} from './src/main.server';
import {join} from 'path';
import {readFileSync} from 'fs';

const app = express();
const distFolder = join(process.cwd(), 'dist/ngmodule/browser');
const indexHtml = readFileSync(join(distFolder, 'index.html'), 'utf-8');

// Serve static files from /browser
app.get(
  '*.*',
  express.static(distFolder, {
    maxAge: '1y',
  })
);

// Mock API
app.get('/api', (req, res) => {
  res.json({data: 'API 1 response'});
});

app.get('/api-2', (req, res) => {
  res.json({data: 'API 2 response'});
});

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  renderModule(AppServerModule, {
    document: indexHtml,
    url: req.url,
    extraProviders: [{provide: APP_BASE_HREF, useValue: req.baseUrl}],
  }).then((response: string) => {
    res.send(response);
  });
});

app.listen(4206, () => {
  console.log('Server listening on port 4206!');
});
