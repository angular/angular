/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bazelDefineCompileValue} from './bazel_define_compile_value';

function isIvyMode(): boolean {
  return (bazelDefineCompileValue as string) === 'aot';
}

/**
 * A global method which is used to conditionally block the execution of tests.
 *
 * ```
 * fixmeIvy('some reason') && describe(...);
 * ```
 *
 * The above will prevent the execution of the test(s) in Ivy mode, until they can be fixed.
 */
export function fixmeIvy(reason: string): boolean {
  return !isIvyMode();
}

/**
 * A global method to indicate that a given (existing) test should not be executed in the Ivy mode
 * as the existing behaviour changed. This might indicate a bug fix available only in Ivy or an
 * unavoidable breaking change. Ideally an existing test marked with `obsoleteInIvy` should be
 * accompanied by a new test illustrating Ivy-specific behaviour. Such a new test should be marked
 * with `fixedInIvy`.
 *
 * During the post-Ivy-release cleanup effort, tests marked with `obsoleteInIvy` should be removed.
 *
 * ```
 * obsoleteInIvy('some reason') && describe(...);
 * ```
 *
 * The above will prevent the execution of the test(s) in Ivy mode and serve as an indicator of
 * behaviour change.
 */
export function obsoleteInIvy(reason: string): boolean {
  return !isIvyMode();
}

/**
 * A global method to indicate that a given test is only valid in the ivy mode. This is useful for
 * cases where ivy behaves differently as compared to the view engine but we still want to add a
 * test verifying new behaviour.
 *
 * During the post-Ivy-release cleanup effort, tests marked with `fixedInIvy` should loose this
 * marker.
 *
 * ```
 * fixedInIvy('some reason') && describe(...);
 * ```
 *
 * The above will run the test(s) in Ivy mode only.
 */
export function fixedInIvy(reason: string): boolean {
  return isIvyMode();
}