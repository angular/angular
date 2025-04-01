/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// This file uses 'process'
/// <reference types="node" />

export type HrTime = [number, number];

export function mark(): HrTime {
  return process.hrtime();
}

export function timeSinceInMicros(mark: HrTime): number {
  const delta = process.hrtime(mark);
  return delta[0] * 1000000 + Math.floor(delta[1] / 1000);
}
