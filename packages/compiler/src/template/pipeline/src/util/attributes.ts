/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const ARIA_PREFIX = 'aria-';

/**
 * Returns whether `name` is an ARIA attribute name.
 *
 * This is a heuristic based on whether name begins with and is longer than `aria-`.
 */
export function isAriaAttribute(name: string): boolean {
  return name.startsWith(ARIA_PREFIX) && name.length > ARIA_PREFIX.length;
}
