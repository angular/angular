/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Verifies that there is exactly one factory definition for the provided type.
 */
export function verifyUniqueFactory(output: string, type: string): boolean {
  const matches = output.match(new RegExp(type + '\.ɵfac =', 'g'));
  if (matches === null) {
    return false;
  }
  return matches.length === 1;
}
