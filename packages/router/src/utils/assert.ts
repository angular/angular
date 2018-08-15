/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function assertDefined<T>(actual: T, msg: string) {
  if (actual == null) {
    throwError(msg);
  }
}

function throwError(msg: string): never {
  // tslint:disable-next-line
  debugger;  // Left intentionally for better debugger experience.
  throw new Error(`ASSERTION ERROR: ${msg}`);
}
