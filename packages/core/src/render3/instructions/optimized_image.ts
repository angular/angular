/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Dedicated instruction for the Image directive
 *
 * @codeGenApi
 */
export function ɵɵoptimizedImage(
  path: string,
  width?: string | null,
  height?: string | null,
): string[] {
  // null mean the width/height is a property binding, and should not be returned in this array;

  return ['ngSrc', path, ...(width ? ['width', width] : []), ...(height ? ['height', height] : [])];
}
