/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {setInjectorProfilerContext} from '../render3/debug/injector_profiler';
import {getInjectImplementation, setInjectImplementation} from './inject_switch';
import {getCurrentInjector, setCurrentInjector, RetrievingInjector} from './injector_compatibility';
import {assertNotDestroyed, R3Injector} from './r3_injector';
/**
 * Runs the given function in the [context](guide/di/dependency-injection-context) of the given
 * `Injector`.
 *
 * Within the function's stack frame, [`inject`](api/core/inject) can be used to inject dependencies
 * from the given `Injector`. Note that `inject` is only usable synchronously, and cannot be used in
 * any asynchronous callbacks or after any `await` points.
 *
 * @param injector the injector which will satisfy calls to [`inject`](api/core/inject) while `fn`
 *     is executing
 * @param fn the closure to be run in the context of `injector`
 * @returns the return value of the function, if any
 * @publicApi
 */
export function runInInjectionContext(injector, fn) {
  let internalInjector;
  if (injector instanceof R3Injector) {
    assertNotDestroyed(injector);
    internalInjector = injector;
  } else {
    internalInjector = new RetrievingInjector(injector);
  }
  let prevInjectorProfilerContext;
  if (ngDevMode) {
    prevInjectorProfilerContext = setInjectorProfilerContext({injector, token: null});
  }
  const prevInjector = setCurrentInjector(internalInjector);
  const previousInjectImplementation = setInjectImplementation(undefined);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
    ngDevMode && setInjectorProfilerContext(prevInjectorProfilerContext);
    setInjectImplementation(previousInjectImplementation);
  }
}
/**
 * Whether the current stack frame is inside an injection context.
 */
export function isInInjectionContext() {
  return getInjectImplementation() !== undefined || getCurrentInjector() != null;
}
/**
 * Asserts that the current stack frame is within an [injection
 * context](guide/di/dependency-injection-context) and has access to `inject`.
 *
 * @param debugFn a reference to the function making the assertion (used for the error message).
 *
 * @publicApi
 */
export function assertInInjectionContext(debugFn) {
  // Taking a `Function` instead of a string name here prevents the unminified name of the function
  // from being retained in the bundle regardless of minification.
  if (!isInInjectionContext()) {
    throw new RuntimeError(
      -203 /* RuntimeErrorCode.MISSING_INJECTION_CONTEXT */,
      ngDevMode &&
        debugFn.name +
          '() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`',
    );
  }
}
//# sourceMappingURL=contextual.js.map
