/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

//  TODO(alxhub): Unify this file with `util/src/path`.

const TS_DTS_JS_EXTENSION = /(?:\.d)?\.ts$|\.js$/;
const ABSOLUTE_PATH = /^([a-zA-Z]:\/|\/)/;

/**
 * Convert Windows-style separators to POSIX separators.
 */
export function normalizeSeparators(path: string): string {
  // TODO: normalize path only for OS that need it.
  return path.replace(/\\/g, '/');
}

/**
 * Remove a .ts, .d.ts, or .js extension from a file name.
 */
export function stripExtension(path: string): string {
  return path.replace(TS_DTS_JS_EXTENSION, '');
}

/**
 * Returns true if the normalized path is an absolute path.
 */
export function isAbsolutePath(path: string): boolean {
  // TODO: use regExp based on OS in the future
  return ABSOLUTE_PATH.test(path);
}
