/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolve} from 'path';
import {existsSync} from 'fs';

// This import lacks of type definitions.
const resolveBinSync = require('resolve-bin').sync;

/** Finds the path to the TSLint CLI binary. */
export function findTslintBinaryPath() {
  const defaultPath = resolve(__dirname, '..', 'node_modules', 'tslint', 'bin', 'tslint');

  if (existsSync(defaultPath)) {
    return defaultPath;
  } else {
    return resolveBinSync('tslint', 'tslint');
  }
}
