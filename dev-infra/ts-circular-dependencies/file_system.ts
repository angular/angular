/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Stats, statSync} from 'fs';

/** Gets the status of the specified file. Returns null if the file does not exist. */
export function getFileStatus(filePath: string): Stats|null {
  try {
    return statSync(filePath);
  } catch {
    return null;
  }
}

/** Ensures that the specified path uses forward slashes as delimiter. */
export function convertPathToForwardSlash(path: string) {
  return path.replace(/\\/g, '/');
}
