// #docplaster
// #docregion core
import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

import bootstrap from './src/main.server';
export default bootstrap;

// #enddocregion core
// The Express app is exported so that it can be used by serverless Functions.
// #docregion core
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  // Angular's Universal express-engine
  // #enddocregion core
  // (see https://github.com/angular/universal/tree/main/modules/express-engine)
  // #docregion core, ngExpressEngine
  server.engine('html', ngExpressEngine({ bootstrap }));
  // #enddocregion ngExpressEngine
  server.set('view engine', 'html');
  server.set('views', distFolder);

  // #enddocregion core
  // #docregion data-request
  // TODO: implement data requests securely
  // Serve data from URLS that begin "/api/"
  server.get('/api/**', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });
  // #enddocregion data-request

  // #docregion static
  // Serve static files (files with an extension) from the dist folder only
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));
  // #enddocregion static

  // #docregion navigation-request
  // All regular routes (no file extension) are rendered with the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, {
      req,
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl }
      ]
    });
  });
  // #enddocregion navigation-request

  // #docregion core
  // ...

  return server;
}
// #enddocregion core

function run(): void {
  // eslint-disable-next-line @typescript-eslint/dot-notation, dot-notation
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}
