/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _Zone: ZoneType|null = typeof Zone !== 'undefined' ? Zone : null;
const fakeAsyncTestModule =
    _Zone && typeof _Zone.getFakeAsyncTest === 'function' && _Zone.getFakeAsyncTest!();

const fakeAsyncTestModuleNotLoadedErrorMessage =
    `zone-testing.js is needed for the fakeAsync() test helper but could not be found.
        Please make sure that your environment includes zone.js/dist/zone-testing.js`;

/**
 * Clears out the shared fake async zone for a test.
 * To be called in a global `beforeEach`.
 *
 * @publicApi
 */
export function resetFakeAsyncZone(): void {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.resetFakeAsyncZone();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Wraps a function to be executed in the fakeAsync zone:
 * - microtasks are manually executed by calling `flushMicrotasks()`,
 * - timers are synchronous, `tick()` simulates the asynchronous passage of time.
 *
 * If there are any pending timers at the end of the function, an exception will be thrown.
 *
 * Can be used to wrap inject() calls.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @param fn
 * @returns The function wrapped to be executed in the fakeAsync zone
 *
 * @publicApi
 */
export function fakeAsync<F extends(...args: any[]) => any>(fn: F): (...args: Parameters<F>) =>
    ReturnType<F> {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.fakeAsync(fn);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone.
 *
 * The microtasks queue is drained at the very start of this function and after any timer callback
 * has been executed.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/testing/ts/fake_async.ts region='basic'}
 *
 * @param millis, the number of millisecond to advance the virtual timer
 * @param tickOptions, the options of tick with a flag called
 * processNewMacroTasksSynchronously, whether to invoke the new macroTasks, by default is
 * false, means the new macroTasks will be invoked
 *
 * For example,
 *
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
 *
 * in this case, we have a nested timeout (new macroTask), when we tick, both the
 * funcWithNestedTimeout and the nested timeout both will be invoked.
 *
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
 *
 * if we pass the tickOptions with processNewMacroTasksSynchronously to be false, the nested timeout
 * will not be invoked.
 *
 *
 * @publicApi
 */
export function tick(
    millis: number = 0, tickOptions: {processNewMacroTasksSynchronously: boolean} = {
      processNewMacroTasksSynchronously: true
    }): void {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.tick(millis, tickOptions);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the fakeAsync zone by
 * draining the macrotask queue until it is empty. The returned value is the milliseconds
 * of time that would have been elapsed.
 *
 * @param maxTurns If there are nested timers are scheduled, flush run additional round of
 * flush to consume the new scheduled nested timers, and will run at most maxTurns round of
 * flush.
 * @returns The simulated time elapsed, in millis.
 *
 * @publicApi
 */
export function flush(maxTurns?: number): number {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.flush(maxTurns);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Discard all remaining periodic tasks.
 *
 * For example,
 *
 * it('test with uncleared setInterval', fakeAsync(() => {
 *   let count = 0;
 *   let id = setInterval(() => {
 *     count ++;
 *   }, 100);
 *   tick(200);
 *   expect(count).toBe(2);
 *   // If not calling discardPeriodicTasks(), fakeAsync throws error
 *   // '1 periodic timer(s) still in the queue.', so we need to
 *   // call `clearInterval(id)` or `discardPeriodicTasks()` to
 *   // clear the setInterval task.
 *   discardPeriodicTasks();
 * }))
 *
 * @publicApi
 */
export function discardPeriodicTasks(): void {
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
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.flushMicrotasks();
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Set fake System time.
 *
 * In `fakeAsync()`, the `Date.now()` is patched, so it
 * always return a fixed number unless calling `tick()` to advance
 * the virtual timer. Sometimes the test may need to
 * programmatically set the system time, so this API allow to
 * set the fake system time.
 *
 * @param time, the number of millisecond of the date time.
 *
 * @publicApi
 */
export function setFakeSystemTime(time: number): void {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.setFakeSystemTime === 'function') {
    return fakeAsyncTestModule.setFakeSystemTime(time);
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}

/**
 * Get fake System time.
 *
 * In `fakeAsync()`, the `Date.now()` is patched, so it
 * always return a fixed number unless calling `tick()` to advance
 * the virtual timer. This API returns the current fake system time.
 * It will be the same with calling `Date.now()` in the `fakeAsync()`
 *
 * @publicApi
 */
export function getFakeSystemTime(): number {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.getFakeSystemTime === 'function') {
    return fakeAsyncTestModule.getFakeSystemTime();
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}

/**
 * Get real System time.
 *
 * In `fakeAsync()`, the `Date.now()` is patched, so it
 * always return a fixed number unless calling `tick()` to advance
 * the virtual timer. This API returns the current underlying real system time.
 *
 * @publicApi
 */
export function getRealSystemTime(): number {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.getRealSystemTime === 'function') {
    return fakeAsyncTestModule.getRealSystemTime();
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}

/**
 * Flush only the pending tasks.
 *
 * Flush only the pending tasks, if any new tasks are spawn,
 * the new tasks will not be consumed.
 *
 * For example,
 *
 * it('test nested timeout`, fakeAsync(() => {
 *   const logs = [];
 *   setTimeout(() => {
 *     logs.push(1);
 *     setTimeout(() => {
 *       logs.push(2);
 *     });
 *   });
 *   // flush(); will invoke the nested timeout as well, logs will be [1,2]
 *   // flushOnlyPendingTasks(); will only flush the current pending timeout, the logs will be [1]
 *  }));
 *
 * @publicApi
 */
export function flushOnlyPendingTasks(): void {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.flushOnlyPendingTasks === 'function') {
    return fakeAsyncTestModule.flushOnlyPendingTasks();
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}

/**
 * tick to the next task.
 *
 * @param steps tick `steps` amount of next timers, by default is `1`.
 *
 * For example,
 *
 * it('test nested timeout`, fakeAsync(() => {
 *   const logs = [];
 *   setTimeout(() => {
 *     logs.push(1);
 *   }, 100);
 *   setTimeout(() => {
 *     logs.push(11);
 *   }, 100);
 *   setTimeout(() => {
 *     logs.push(2);
 *   }, 200);
 *   setTimeout(() => {
 *     logs.push(3);
 *   }, 300);
 *
 *   tickToNext();
 *   expect(logs).toEqual([1,11]);
 *   tickToNext(2);
 *   expect(logs).toEqual([1, 11, 2, 3]);
 * }));
 *
 * @publicApi
 */
export function tickToNext(steps = 1): void {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.tickToNext === 'function') {
    return fakeAsyncTestModule.tickToNext(steps);
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}

/**
 * Remove all pending tasks.
 *
 * Remove all the pending timeouts, intervals, and microTasks.
 *
 * @publicApi
 */
export function discardAllTasks(): void {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.discardAllTasks === 'function') {
    return fakeAsyncTestModule.discardAllTasks();
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}

/**
 * Get the count of the pending tasks.
 *
 * Get the count of the pending timers, intervals and microTasks.
 *
 * @param taskType, the type of the task
 * - macroTask: get the count of the pending non periodic macroTasks.
 * - microTask: get the count of the pending microTasks.
 * - periodicTask: get the count of the pending periodic macroTasks.
 * - undefined: this is the default value, get the count of all the pending tasks.
 *
 * @publicApi
 */
export function getTaskCount(taskType?: 'macroTask'|'microTask'|'periodicTask'): number {
  if (fakeAsyncTestModule && typeof fakeAsyncTestModule.getTaskCount === 'function') {
    return fakeAsyncTestModule.getTaskCount(taskType);
  } else {
    throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
  }
}
