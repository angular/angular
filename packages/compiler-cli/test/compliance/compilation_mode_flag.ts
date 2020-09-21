/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let compilationMode: 'full'|'partial' = 'full';

export function getCompilationMode(): 'full'|'partial' {
  return compilationMode;
}

/**
 * Called from a Bazel bootstrap script if running the partial target.
 */
export function setCompilationMode(mode: 'full'|'partial'): void {
  compilationMode = mode;
}
