/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runMain} from './index';

const DEBUG = false;

if (DEBUG) {
  console.error(`
api-extractor: running with
  cwd: ${process.cwd()}
  argv: ${process.argv}
`);
}

// Entry point
if (require.main === module) {
  const [tsConfig, entryPoint, dtsBundleOut] = process.argv.slice(2);
  runMain(tsConfig, entryPoint, dtsBundleOut);
}
