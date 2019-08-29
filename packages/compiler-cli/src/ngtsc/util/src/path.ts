/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname, relative, resolve} from '../../file_system';

const TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;

export function relativePathBetween(from: string, to: string): string|null {
  let relativePath = relative(dirname(resolve(from)), resolve(to)).replace(TS_DTS_JS_EXTENSION, '');

  if (relativePath === '') {
    return null;
  }

  // path.relative() does not include the leading './'.
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
}

export function normalizeSeparators(path: string): string {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}
