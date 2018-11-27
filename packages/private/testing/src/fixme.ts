/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bazelDefineCompileValue} from './bazel_define_compile_value';

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
  return 'aot' !== (bazelDefineCompileValue as string);
}