/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** @docs-private */
export function getMatInputUnsupportedTypeError(type: string): Error {
  return Error(`Input type "${type}" isn't supported by matInput.`);
}
