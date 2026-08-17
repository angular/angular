/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function calculateFrameRate(timeSpent: number): number {
  if (timeSpent <= 0) {
    return 60;
  }
  return Math.min(60, Math.round(1000 / timeSpent));
}
