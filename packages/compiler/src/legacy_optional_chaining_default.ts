/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Whether legacy optional chaining is opt-in (false) or opt-out (true).
 *
 * This is extracted in order to be patched in G3.
 */
// g3-only export const LEGACY_OPTIONAL_CHAINING_DEFAULT = true;
export const LEGACY_OPTIONAL_CHAINING_DEFAULT = false; // 3p-only
