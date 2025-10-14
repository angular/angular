/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />
export function mark() {
  return process.hrtime();
}
export function timeSinceInMicros(mark) {
  const delta = process.hrtime(mark);
  return delta[0] * 1000000 + Math.floor(delta[1] / 1000);
}
//# sourceMappingURL=clock.js.map
