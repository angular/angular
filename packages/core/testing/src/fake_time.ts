/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
const fakeTimeTestModule = _Zone && _Zone[_Zone.__symbol__('fakeTimeTest')];

const fakeTimeTestModuleNotLoadedErrorMessage =
    `zone-testing.js is needed for the fakeTime() test helper but could not be found.
        Please make sure that your environment includes zone.js/testing`;

/**
 * Clears out the shared fake-time zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
export function resetFakeTimeZone(): void {
  if (fakeTimeTestModule) {
    return fakeTimeTestModule.resetFakeTimeZone();
  }
  throw new Error(fakeTimeTestModuleNotLoadedErrorMessage);
}

/**
 * Wraps a function to be executed in the `fakeTime` zone:
 * - Microtasks are executed as normal when `await` points occur.
 * - Timers are faked; `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception is thrown.
 *
 * Can be used to wrap `inject()` calls.
 *
 * @param fn The function that you want to wrap in the `fakeTime` zone.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 *
 * @returns The function wrapped to be executed in the `fakeTime` zone.
 * Any arguments passed when calling this returned function will be passed through to the `fn`
 * function in the parameters when it is called.
 *
 * @publicApi
 */
export function fakeTime(fn: Function): (...args: any[]) => any {
  if (fakeTimeTestModule) {
    return fakeTimeTestModule.fakeTime(fn);
  }
  throw new Error(fakeTimeTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the `fakeTime` zone.
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
 * it ('test with nested setTimeout', fakeTime(() => {
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
 * it ('test with nested setTimeout', fakeTime(() => {
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
export async function tickClock(
    millis: number = 0, tickOptions: {processNewMacroTasksSynchronously: boolean} = {
      processNewMacroTasksSynchronously: true
    }): Promise<void> {
  if (fakeTimeTestModule) {
    return fakeTimeTestModule.tickClock(millis, tickOptions);
  }
  throw new Error(fakeTimeTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the `fakeTime` zone by
 * draining the macrotask queue until it is empty.
 *
 * @param maxTurns The maximum number of times the scheduler attempts to clear its queue before
 *     throwing an error.
 * @returns The simulated time elapsed, in milliseconds.
 *
 * @publicApi
 */
export function flush(maxTurns?: number): number {
  if (fakeTimeTestModule) {
    return fakeTimeTestModule.flush(maxTurns);
  }
  throw new Error(fakeTimeTestModuleNotLoadedErrorMessage);
}

/**
 * Discard all remaining periodic tasks.
 *
 * @publicApi
 */
export function discardFakeTimePeriodicTasks(): void {
  if (fakeTimeTestModule) {
    return fakeTimeTestModule.discardPeriodicTasks();
  }
  throw new Error(fakeTimeTestModuleNotLoadedErrorMessage);
}
