/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * @fileoverview Compile-time constants passed to closure that can use it to eliminate branches in
 * production code.
 */

/**
 * Disable `ngDevMode` - we are creating a production build
 */
export const ngDevMode = false;

/**
 * Disable `ngJitMode` - this app is AOT compiled
 */
export const ngJitMode = false;

/**
 * Enable `ngI18nClosureMode` - use Closure compiler's i18n support via `goog.getMsg` instead of
 * `$localize`.
 */
export const ngI18nClosureMode = true;
