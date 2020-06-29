/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Checks whether the specified value matches the given pattern. */
export function matchesPattern(value: string, pattern: RegExp|string): boolean {
  return typeof pattern === 'string' ? value === pattern : pattern.test(value);
}
