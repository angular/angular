/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fakeAsyncTestModuleNotLoadedErrorMessage =
    `zone-testing.js is needed for the fakeAsync() test helper but could not be found.
        Please make sure that your environment includes zone.js/testing`;

function getFakeAsyncTestModule() {
  const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
  return _Zone && _Zone[_Zone.__symbol__('fakeAsyncTest')];
}

/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 * There are several patterns of bundles loading
 * (`zone-testing` and `@angular/core/testing`) order here.

 * 1. loading `zone-testing` before `@angular/core/testing`.
 * This is the default pattern, and Angular CLI generated `test.ts` does
 * in this way, the `beforeEach` will be patched by `zone-testing`, and
 * `resetFakeAsyncZone` also use the logic from `zone-testing`.

 * 2. loading `zone-testing` after `@angular/core/testing`, and using older version
 * of `zone-testing`. the `beforeEach` will not be patched by `zone-testing` when
 * `@angular/core/testing` is loaded, so the logic in `before_each.ts` to set a
 * global `beforeEach` to reset ProxyZoneSpec will not work, so we need to throw
 * error to let the user load `zone-testing` first.
 *
 * 3. loading `zone-testing` after `@angular/core/testing`, and using newer version
 * of `zone-testing` (0.11.4+). In this case, the logic to reset ProxyZoneSpec delegate
 * is implemented in the `zone-testing` bundle. Everything should work fine.
 *
 * @publicApi
 */
export function resetFakeAsyncZone(): void {
  const fakeAsyncTestModule = getFakeAsyncTestModule();
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.resetFakeAsyncZone();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Wraps a function to be executed in the `fakeAsync` zone:
 * - Microtasks are manually executed by calling `flushMicrotasks()`.
 * - Timers are synchronous; `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception is thrown.
 *
 * Can be used to wrap `inject()` calls.
 *
 * @param fn The function that you want to wrap in the `fakeAysnc` zone.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 *
 * @returns The function wrapped to be executed in the `fakeAsync` zone.
 * Any arguments passed when calling this returned function will be passed through to the `fn`
 * function in the parameters when it is called.
 *
 * @publicApi
 */
export function fakeAsync(fn: Function): (...args: any[]) => any {
  const fakeAsyncTestModule = getFakeAsyncTestModule();
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.fakeAsync(fn);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the `fakeAsync` zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @param millis The number of milliseconds to advance the virtual timer.
 * @param tickOptions The options to pass to the `tick()` function.
 *
 * @usageNotes
 *
 * The `tick()` option is a flag called `processNewMacroTasksSynchronously`,
 * which determines whether or not to invoke new macroTasks.
 *
 * If you provide a `tickOptions` object, but do not specify a
 * `processNewMacroTasksSynchronously` property (`tick(100, {})`),
 * then `processNewMacroTasksSynchronously` defaults to true.
 *
 * If you omit the `tickOptions` parameter (`tick(100))`), then
 * `tickOptions` defaults to `{processNewMacroTasksSynchronously: true}`.
 *
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * The following example includes a nested timeout (new macroTask), and
 * the `tickOptions` parameter is allowed to default. In this case,
 * `processNewMacroTasksSynchronously` defaults to true, and the nested
 * function is executed on each tick.
 *
 * ```
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick();
 *   expect(nestedTimeoutInvoked).toBe(true);
 * }));
 * ```
 *
 * In the following case, `processNewMacroTasksSynchronously` is explicitly
 * set to false, so the nested timeout function is not invoked.
 *
 * ```
 * it ('test with nested setTimeout', fakeAsync(() => {
 *   let nestedTimeoutInvoked = false;
 *   function funcWithNestedTimeout() {
 *     setTimeout(() => {
 *       nestedTimeoutInvoked = true;
 *     });
 *   };
 *   setTimeout(funcWithNestedTimeout);
 *   tick(0, {processNewMacroTasksSynchronously: false});
 *   expect(nestedTimeoutInvoked).toBe(false);
 * }));
 * ```
 *
 *
 * @publicApi
 */
export function tick(
    millis: number = 0, tickOptions: {processNewMacroTasksSynchronously: boolean} = {
      processNewMacroTasksSynchronously: true
    }): void {
  const fakeAsyncTestModule = getFakeAsyncTestModule();
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.tick(millis, tickOptions);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Flushes any pending microtasks and simulates the asynchronous passage of time for the timers in
 * the `fakeAsync` zone by
 * draining the macrotask queue until it is empty.
 *
 * @param maxTurns The maximum number of times the scheduler attempts to clear its queue before
 *     throwing an error.
 * @returns The simulated time elapsed, in milliseconds.
 *
 * @publicApi
 */
export function flush(maxTurns?: number): number {
  const fakeAsyncTestModule = getFakeAsyncTestModule();
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.flush(maxTurns);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
export function discardPeriodicTasks(): void {
  const fakeAsyncTestModule = getFakeAsyncTestModule();
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.discardPeriodicTasks();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Flush any pending microtasks.
 *
 * @publicApi
 */
export function flushMicrotasks(): void {
  const fakeAsyncTestModule = getFakeAsyncTestModule();
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.flushMicrotasks();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}
