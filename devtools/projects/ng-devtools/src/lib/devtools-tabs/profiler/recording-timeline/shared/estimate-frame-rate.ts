/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function estimateFrameRate(timeSpent: number): number {
  const multiplier = Math.max(Math.ceil(timeSpent / 16) - 1, 0);
  return Math.floor(60 / 2 ** multiplier);
}
