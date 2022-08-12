/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Exists to aid internal migration off of the deprecated relativeLinkResolution option.
 */
export function assignRelativeLinkResolution(
    router: {relativeLinkResolution: 'legacy'|'corrected'}): void {}
