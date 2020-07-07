/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {dirname, relative, resolve, toRelativeImport} from '../../file_system';
import {stripExtension} from '../../file_system/src/util';

export function relativePathBetween(from: string, to: string): string|null {
  const relativePath = stripExtension(relative(dirname(resolve(from)), resolve(to)));
  return relativePath !== '' ? toRelativeImport(relativePath) : null;
}

export function normalizeSeparators(path: string): string {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}
