import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/express-engine-ivy/browser');

  // #docregion ngExpressEngine
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));
  // #enddocregion ngExpressEngine
  server.set('view engine', 'html');
  server.set('views', distFolder);

  // #docregion data-request
  // TODO: implement data requests securely
  server.get('/api/*', (req, res) => {
    res.status(404).send('data requests are not supported');
  });
  // #enddocregion data-request

<<<<<<< HEAD
// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

// #docregion ngExpressEngine
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));
// #enddocregion ngExpressEngine

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// #docregion data-request
// TODO: 보안 로직을 추가해야 합니다.
app.get('/api/*', (req, res) => {
  res.status(404).send('data requests are not supported');
});
// #enddocregion data-request

// #docregion static
// 정적 파일을 요청하면 /browser에서 찾아서 보냅니다.
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));
// #enddocregion static

// #docregion navigation-request
// 페이지 요청은 Universal 엔진을 사용합니다.
app.get('*', (req, res) => {
  res.render('index', { req });
});
// #enddocregion navigation-request

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
=======
  // #docregion static
  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));
  // #enddocregion static

  // #docregion navigation-request
  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render('index', { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });
  // #enddocregion navigation-request

  return server;
}

function run() {
  const port = process.env.PORT || 4000;

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
if (mainModule && mainModule.filename === __filename) {
  run();
}

export * from './src/main.server';
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
