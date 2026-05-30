/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/* tslint:disable:no-console  */
import {renderModule} from '@angular/platform-server';
import AppServerModule from './src/main.server';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import {readFileSync} from 'node:fs';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = readFileSync(join(browserDistFolder, 'index.csr.html'), 'utf-8');

async function runTest() {
  // Test and validate the errors are printed in the console.
  const originalConsoleError = console.error;
  const errors: string[] = [];
  console.error = (error, data) => errors.push(error.toString() + ' ' + data.toString());

  try {
    await renderModule(AppServerModule, {
      document: indexHtml,
      url: '/error',
    });
  } catch {}

  console.error = originalConsoleError;

  // Test case
  if (!errors.some((e) => e.includes('Error in resolver'))) {
    errors.forEach(console.error);
    console.error(
      '\nError: expected rendering errors ("Error in resolver") to be printed in the console.\n',
    );
    process.exit(1);
  }
}

runTest();
