/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bazelDefineCompileValue} from './bazel_define_compile_value';


/**
 * A function to conditionally include a test or a block of tests only when tests run against Ivy.
 *
 * The modification of the behavior must be well justified, not affect common usage patterns, and
 * documented as a breaking change.
 *
 * ```
 * ivyEnabled && describe(...);
 * ```
 *
 * or
 *
 * ```
 * ivyEnabled && it(...);
 * ```
 */
export const ivyEnabled = 'aot' === (bazelDefineCompileValue as string);


/**
 * A function to conditionally skip the execution of tests that are yet to be fixed
 * when running against Ivy.
 *
 * ```
 * fixmeIvy('some reason') && describe(...);
 * ```
 *
 * or
 *
 * ```
 * fixmeIvy('some reason') && it(...);
 * ```
 */
export function fixmeIvy(reason: string): boolean {
  return !ivyEnabled;
}


/**
 * A function to conditionally skip the execution of tests that are not relevant when
 * running against Ivy.
 *
 * Any tests disabled using this switch should not be user-facing breaking changes.
 *
 * ```
 * obsoleteInIvy('some reason') && describe(...);
 * ```
 *
 * or
 *
 * ```
 * obsoleteInIvy('some reason') && it(...);
 * ```
 */
export const obsoleteInIvy = fixmeIvy;


/**
 * A function to conditionally skip the execution of tests that have intentionally
 * been broken when running against Ivy.
 *
 * The modification of the behavior must be well justified, not affect common usage patterns, and
 * documented as a breaking change.
 *
 * ```
 * modifiedInIvy('some reason') && describe(...);
 * ```
 *
 * or
 *
 * ```
 * modifiedInIvy('some reason') && it(...);
 * ```
 */
export const modifiedInIvy = fixmeIvy;
