/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ViewEncapsulation} from '../../metadata/view';

export interface JitCompilerOptions {
  defaultEncapsulation?: ViewEncapsulation;
  preserveWhitespaces?: boolean;
  /**
   * When enabled, safe navigation (`?.`) expressions in templates return `undefined` on
   * short-circuit, matching JavaScript/TypeScript optional chaining semantics.
   * When disabled (default), safe navigation returns `null` (Angular's historical behavior).
   */
  nativeOptionalChainingSemantics?: boolean;
}

let jitOptions: JitCompilerOptions | null = null;

export function setJitOptions(options: JitCompilerOptions): void {
  if (jitOptions !== null) {
    if (options.defaultEncapsulation !== jitOptions.defaultEncapsulation) {
      ngDevMode &&
        console.error(
          'Provided value for `defaultEncapsulation` can not be changed once it has been set.',
        );
      return;
    }
    if (options.preserveWhitespaces !== jitOptions.preserveWhitespaces) {
      ngDevMode &&
        console.error(
          'Provided value for `preserveWhitespaces` can not be changed once it has been set.',
        );
      return;
    }
    if (options.nativeOptionalChainingSemantics !== jitOptions.nativeOptionalChainingSemantics) {
      ngDevMode &&
        console.error(
          'Provided value for `nativeOptionalChainingSemantics` can not be changed once it has been set.',
        );
      return;
    }
  }
  jitOptions = options;
}

export function getJitOptions(): JitCompilerOptions | null {
  return jitOptions;
}

export function resetJitOptions(): void {
  jitOptions = null;
}
