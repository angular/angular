/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const _Zone: any = typeof Zone !== 'undefined' ? Zone : null;
const fakeAsyncTestModule = _Zone && _Zone[_Zone.__symbol__('fakeAsyncTest')];

const fakeAsyncTestModuleNotLoadedErrorMessage =
    `zone-testing.js is needed for the fakeAsync() test helper but could not be found.
        Please make sure that your environment includes zone.js/testing`;

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

interface FakeAsync {
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
  (fn: Function): (...args: any[]) => any;

  /**
   * Wrap the `fakeAsync()` function with the `beforeEach()/afterEach()` hooks.
   *
   * Given `AppComponent`:
   *
   * @Component({...})
   * export class AppComponent {
   *   timerId: number;
   *   ngOnInit() {
   *     this.timerId = setTimeout(() => {});
   *   }
   *
   *   ngOnDestroy() {
   *     clearTimeout(this.timerId);
   *   }
   * }
   *
   * We can write test cases with `fakeAsync()` in this way.
   *
   * describe('AppComponent test', () => {
   *   let fixture: ComponentFixture<AppComponent>;
   *   beforeEach(() => {
   *     ...
   *     fixture = TestBed.createComponent(AppComponent);
   *   });
   *
   *   it('test case1', fakeAsync(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *     fixture.destroy();
   *   }));
   *
   *   it('test case2', fakeAsync(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *     fixture.destroy();
   *   }));
   * });
   *
   * Here we need to call `fixture.destroy()` inside each test, since each `it()` is in its own
   * `fakeAsync()` scope and we can only clean up the async tasks (such as `setTimeout`,
   * `setInterval`) created in that `fakeAsync()`. With the hooks, we can write the case in this
   * way.
   *
   * describe('AppComponent test', () => {
   *   let fixture: ComponentFixture<AppComponent>;
   *   const fakeAsyncWithFixture = fakeAsync.wrap({
   *     beforeEach: () => fixture = TestBed.createComponent(AppComponent);
   *     afterEach: () => fixture.destroy();
   *   });
   *
   *   it('test case1', fakeAsyncWithFixture(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *   }));
   *
   *   it('test case2', fakeAsyncWithFixture(() => {
   *     fixture.detectChanges();
   *     // do some test with fixture
   *   }));
   * });
   *
   * Also the `wrap()` function support nesting.
   *
   * describe('AppComponent test', () => {
   *   let fixture: ComponentFixture<AppComponent>;
   *
   *   const fakeAsyncWithFixture = fakeAsync.wrap({
   *     beforeEach: () => {
   *       fixture = TestBed.createComponent(AppComponent);
   *       fixture.detectChanges();
   *     }
   *     afterEach: () => fixture.destroy();
   *   });
   *
   *   it('test case1', fakeAsyncWithFixture(() => {
   *     // do some test with fixture
   *   }));
   *
   *   it('test case2', fakeAsyncWithFixture(() => {
   *     // do some test with fixture
   *   }));
   *
   *   describe('AppComponent sub test: auth test', () => {
   *     const fakeAsyncNested = fakeAsyncWithFixture.wrap({
   *       beforeEach: () => fixture.componentInstance.login(),
   *       afterEach: () => fixture.componentInstance.logout();
   *     });
   *
   *     it('should show user info', () => {
   *       // do some test with fixture with authenticated user.
   *     });
   *   });
   * });
   *
   * @param hooks, the object with the `beforeEach()` and the `afterEach()` hook function.
   * @returns The fakeAsync function wrapped with the specified hooks.
   */
  wrap(hooks: {beforeEach?: () => void, afterEach?: () => void}): FakeAsync;
}

/**
 * The type definition of fakeAsync function.
 *
 */
export interface FakeAsync {
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
  (fn: Function): (...args: any[]) => any;

  /**
   * Wrap the `fakeAsync()` function with the `beforeEach()/afterEach()` hooks.
   *
   * TODO: add code samples
   *
   * @param hooks, the object with the `beforeEach()` and the `afterEach()` hook function.
   * @returns The fakeAsync function wrapped with the specified hooks.
   */
  wrap(hooks: {beforeEach?: () => void, afterEach?: () => void}): FakeAsync;
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
export const fakeAsync = function(fn: Function): (...args: any[]) => any {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.fakeAsync(fn);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
} as FakeAsync;

fakeAsync.wrap = function(hooks: {beforeEach?: () => void, afterEach?: () => void}): FakeAsync {
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.fakeAsync.wrap(hooks);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
};

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
  if (fakeAsyncTestModule) {
    return fakeAsyncTestModule.tick(millis, tickOptions);
  }
  throw new Error(fakeAsyncTestModuleNotLoadedErrorMessage);
}

/**
 * Simulates the asynchronous passage of time for the timers in the `fakeAsync` zone by
 * draining the macrotask queue until it is empty.
 *
 * @param maxTurns The maximum number of times the scheduler attempts to clear its queue before
 *     throwing an error.
 * @returns The simulated time elapsed, in milliseconds.
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
