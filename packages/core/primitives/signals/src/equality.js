/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The default equality function used for `signal` and `computed`, which uses referential equality.
 */
export function defaultEquals(a, b) {
  return Object.is(a, b);
}
//# sourceMappingURL=equality.js.map
