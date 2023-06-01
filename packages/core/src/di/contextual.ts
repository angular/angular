/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import type {Injector} from './injector';
import {getCurrentInjector, setCurrentInjector} from './injector_compatibility';
import {getInjectImplementation, setInjectImplementation} from './inject_switch';
import {R3Injector} from './r3_injector';

/**
 * Runs the given function in the context of the given `Injector`.
 *
 * Within the function's stack frame, `inject` can be used to inject dependencies from the given
 * `Injector`. Note that `inject` is only usable synchronously, and cannot be used in any
 * asynchronous callbacks or after any `await` points.
 *
 * @param injector the injector which will satisfy calls to `inject` while `fn` is executing
 * @param fn the closure to be run in the context of `injector`
 * @returns the return value of the function, if any
 * @publicApi
 */
export function runInInjectionContext<ReturnT>(injector: Injector, fn: () => ReturnT): ReturnT {
  if (injector instanceof R3Injector) {
    injector.assertNotDestroyed();
  }

  const prevInjector = setCurrentInjector(injector);
  const previousInjectImplementation = setInjectImplementation(undefined);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
    setInjectImplementation(previousInjectImplementation);
  }
}

/**
 * Asserts that the current stack frame is within an injection context and has access to `inject`.
 *
 * @param debugFn a reference to the function making the assertion (used for the error message).
 *
 * @publicApi
 */
export function assertInInjectionContext(debugFn: Function): void {
  // Taking a `Function` instead of a string name here prevents the unminified name of the function
  // from being retained in the bundle regardless of minification.
  if (!getInjectImplementation() && !getCurrentInjector()) {
    throw new RuntimeError(
        RuntimeErrorCode.MISSING_INJECTION_CONTEXT,
        ngDevMode &&
            (debugFn.name +
             '() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`'));
  }
}
