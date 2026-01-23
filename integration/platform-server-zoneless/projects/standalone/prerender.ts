/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console  */
import {renderApplication} from '@angular/platform-server';
import bootstrap from './src/main.server';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import {readFileSync} from 'node:fs';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = readFileSync(join(browserDistFolder, 'index.csr.html'), 'utf-8');

async function runTest() {
  try {
    await renderApplication(bootstrap, {
      document: indexHtml,
      url: '/error',
    });
  } catch {}
}

runTest();
