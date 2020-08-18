/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Throws an exception when a menu panel already has a menu stack.
 * @docs-private
 */
export function throwExistingMenuStackError() {
  throw Error(
    'CdkMenuPanel is already referenced by different CdkMenuTrigger. Ensure that a menu is' +
      ' opened by a single trigger only.'
  );
}
