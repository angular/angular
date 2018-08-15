/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from 'path';

/** Normalizes the specified path to conform with the posix path format. */
export function getPosixPath(pathString: string) {
  const normalized = normalize(pathString).replace(/\\/g, '/');
  if (!normalized.startsWith('.')) {
    return `./${normalized}`;
  }
  return normalized;
}
