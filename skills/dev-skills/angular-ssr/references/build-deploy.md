# SSR Build and Deploy

## Build Commands

```bash
# Build with SSR
ng build

# Output structure
dist/
├── my-app/
│   ├── browser/      # Client assets
│   └── server/       # Server bundle
```

## Run SSR Server

```bash
# Development
npm run serve:ssr:my-app

# Production
node dist/my-app/server/server.mjs
```

## Deploy to Node.js Host

```javascript
// server.ts (generated)
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './src/main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

app.get('*', express.static(browserDistFolder, { maxAge: '1y', index: false }));

app.get('*', (req, res, next) => {
  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: req.originalUrl,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

app.listen(4000, () => {
  console.log('Server listening on http://localhost:4000');
});
```
