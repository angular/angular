/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Used to patch behavior that needs to _temporarily_ be different between g3 and external.
 *
 * For example, make breaking changes ahead of the main branch targeting a major version.
 * Permanent differences between g3 and external should be configured by individual patches.
 */
export const isG3 = false;
