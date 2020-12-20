/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Whether ts-node has been installed and is available to ng-dev. */
export function isTsNodeAvailable(): boolean {
  try {
    require.resolve('ts-node');
    return true;
  } catch {
    return false;
  }
}
