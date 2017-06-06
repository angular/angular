import { global, isPromise } from 'angular2/src/facade/lang';
import { getTestInjector } from './test_injector';
export { inject, async, injectAsync } from './test_injector';
export { expect } from './matchers';
var _global = (typeof window === 'undefined' ? global : window);
/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
export var afterEach = _global.afterEach;
/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export var describe = _global.describe;
/**
 * See {@link fdescribe}.
 */
export var ddescribe = _global.fdescribe;
/**
 * Like {@link describe}, but instructs the test runner to only run
 * the test cases in this group. This is useful for debugging.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fdescribe'}
 */
export var fdescribe = _global.fdescribe;
/**
 * Like {@link describe}, but instructs the test runner to exclude
 * this group of test cases from execution. This is useful for
 * debugging, or for excluding broken tests until they can be fixed.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xdescribe'}
 */
export var xdescribe = _global.xdescribe;
var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var testInjector = getTestInjector();
// Reset the test providers before each test.
jsmBeforeEach(() => { testInjector.reset(); });
/**
 * Allows overriding default providers of the test injector,
 * which are defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEachProviders'}
 */
export function beforeEachProviders(fn) {
    jsmBeforeEach(() => {
        var providers = fn();
        if (!providers)
            return;
        try {
            testInjector.addProviders(providers);
        }
        catch (e) {
            throw new Error('beforeEachProviders was called after the injector had ' +
                'been used in a beforeEach or it block. This invalidates the ' +
                'test injector');
        }
    });
}
function _wrapTestFn(fn) {
    // Wraps a test or beforeEach function to handle synchronous and asynchronous execution.
    return (done) => {
        if (fn.length === 0) {
            let retVal = fn();
            if (isPromise(retVal)) {
                // Asynchronous test function - wait for completion.
                retVal.then(done, done.fail);
            }
            else {
                // Synchronous test function - complete immediately.
                done();
            }
        }
        else {
            // Asynchronous test function that takes "done" as parameter.
            fn(done);
        }
    };
}
function _it(jsmFn, name, testFn, testTimeOut) {
    jsmFn(name, _wrapTestFn(testFn), testTimeOut);
}
/**
 * Wrapper around Jasmine beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEach'}
 */
export function beforeEach(fn) {
    jsmBeforeEach(_wrapTestFn(fn));
}
/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, the result of {@link async},
 * or an injected function created via {@link inject}.
 *
 * Wrapper around Jasmine it function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export function it(name, fn, timeOut = null) {
    return _it(jsmIt, name, fn, timeOut);
}
/**
 * Like {@link it}, but instructs the test runner to exclude this test
 * entirely. Useful for debugging or for excluding broken tests until
 * they can be fixed.
 *
 * Wrapper around Jasmine xit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='xit'}
 */
export function xit(name, fn, timeOut = null) {
    return _it(jsmXIt, name, fn, timeOut);
}
/**
 * See {@link fit}.
 */
export function iit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
/**
 * Like {@link it}, but instructs the test runner to only run this test.
 * Useful for debugging.
 *
 * Wrapper around Jasmine fit function. See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='fit'}
 */
export function fit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BSU8sRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BRW5ELEVBQTJDLGVBQWUsRUFBQyxNQUFNLGlCQUFpQjtBQUV6RixTQUFRLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxRQUFPLGlCQUFpQixDQUFDO0FBRTNELFNBQVEsTUFBTSxRQUFtQixZQUFZLENBQUM7QUFFOUMsSUFBSSxPQUFPLEdBQVEsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBRXJFOzs7Ozs7OztHQVFHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7OztHQVFHO0FBQ0gsT0FBTyxJQUFJLFFBQVEsR0FBYSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBRWpEOztHQUVHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7Ozs7R0FTRztBQUNILE9BQU8sSUFBSSxTQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsT0FBTyxJQUFJLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5ELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDdkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUN2QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ3pCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFFekIsSUFBSSxZQUFZLEdBQWlCLGVBQWUsRUFBRSxDQUFDO0FBRW5ELDZDQUE2QztBQUM3QyxhQUFhLENBQUMsUUFBUSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUUvQzs7Ozs7Ozs7O0dBU0c7QUFDSCxvQ0FBb0MsRUFBRTtJQUNwQyxhQUFhLENBQUM7UUFDWixJQUFJLFNBQVMsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUNyQixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUN2QixJQUFJLENBQUM7WUFDSCxZQUFZLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUU7UUFBQSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0Q7Z0JBQ3hELDhEQUE4RDtnQkFDOUQsZUFBZSxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELHFCQUFxQixFQUFZO0lBQy9CLHdGQUF3RjtJQUN4RixNQUFNLENBQUMsQ0FBQyxJQUFTO1FBQ2YsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ2xCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLG9EQUFvRDtnQkFDckMsTUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixvREFBb0Q7Z0JBQ3BELElBQUksRUFBRSxDQUFDO1lBQ1QsQ0FBQztRQUNILENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLDZEQUE2RDtZQUM3RCxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDWCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELGFBQWEsS0FBZSxFQUFFLElBQVksRUFBRSxNQUFnQixFQUFFLFdBQW1CO0lBQy9FLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsMkJBQTJCLEVBQVk7SUFDckMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILG1CQUFtQixJQUFZLEVBQUUsRUFBWSxFQUFFLE9BQU8sR0FBVyxJQUFJO0lBQ25FLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxvQkFBb0IsSUFBWSxFQUFFLEVBQVksRUFBRSxPQUFPLEdBQVcsSUFBSTtJQUNwRSxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFFRDs7R0FFRztBQUNILG9CQUFvQixJQUFZLEVBQUUsRUFBWSxFQUFFLE9BQU8sR0FBVyxJQUFJO0lBQ3BFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILG9CQUFvQixJQUFZLEVBQUUsRUFBWSxFQUFFLE9BQU8sR0FBVyxJQUFJO0lBQ3BFLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHVibGljIFRlc3QgTGlicmFyeSBmb3IgdW5pdCB0ZXN0aW5nIEFuZ3VsYXIyIEFwcGxpY2F0aW9ucy4gVXNlcyB0aGVcbiAqIEphc21pbmUgZnJhbWV3b3JrLlxuICovXG5pbXBvcnQge2dsb2JhbCwgaXNQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge2luamVjdCwgYXN5bmMsIGluamVjdEFzeW5jLCBUZXN0SW5qZWN0b3IsIGdldFRlc3RJbmplY3Rvcn0gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtpbmplY3QsIGFzeW5jLCBpbmplY3RBc3luY30gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtleHBlY3QsIE5nTWF0Y2hlcnN9IGZyb20gJy4vbWF0Y2hlcnMnO1xuXG52YXIgX2dsb2JhbCA9IDxhbnk+KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KTtcblxuLyoqXG4gKiBSdW4gYSBmdW5jdGlvbiAod2l0aCBhbiBvcHRpb25hbCBhc3luY2hyb25vdXMgY2FsbGJhY2spIGFmdGVyIGVhY2ggdGVzdCBjYXNlLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYWZ0ZXJFYWNoJ31cbiAqL1xuZXhwb3J0IHZhciBhZnRlckVhY2g6IEZ1bmN0aW9uID0gX2dsb2JhbC5hZnRlckVhY2g7XG5cbi8qKlxuICogR3JvdXAgdGVzdCBjYXNlcyB0b2dldGhlciB1bmRlciBhIGNvbW1vbiBkZXNjcmlwdGlvbiBwcmVmaXguXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdkZXNjcmliZUl0J31cbiAqL1xuZXhwb3J0IHZhciBkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmRlc2NyaWJlO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgZmRlc2NyaWJlfS5cbiAqL1xuZXhwb3J0IHZhciBkZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5mZGVzY3JpYmU7XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgZGVzY3JpYmV9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBvbmx5IHJ1blxuICogdGhlIHRlc3QgY2FzZXMgaW4gdGhpcyBncm91cC4gVGhpcyBpcyB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2ZkZXNjcmliZSd9XG4gKi9cbmV4cG9ydCB2YXIgZmRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIExpa2Uge0BsaW5rIGRlc2NyaWJlfSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gZXhjbHVkZVxuICogdGhpcyBncm91cCBvZiB0ZXN0IGNhc2VzIGZyb20gZXhlY3V0aW9uLiBUaGlzIGlzIHVzZWZ1bCBmb3JcbiAqIGRlYnVnZ2luZywgb3IgZm9yIGV4Y2x1ZGluZyBicm9rZW4gdGVzdHMgdW50aWwgdGhleSBjYW4gYmUgZml4ZWQuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSd4ZGVzY3JpYmUnfVxuICovXG5leHBvcnQgdmFyIHhkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLnhkZXNjcmliZTtcblxudmFyIGpzbUJlZm9yZUVhY2ggPSBfZ2xvYmFsLmJlZm9yZUVhY2g7XG52YXIganNtSXQgPSBfZ2xvYmFsLml0O1xudmFyIGpzbUlJdCA9IF9nbG9iYWwuZml0O1xudmFyIGpzbVhJdCA9IF9nbG9iYWwueGl0O1xuXG52YXIgdGVzdEluamVjdG9yOiBUZXN0SW5qZWN0b3IgPSBnZXRUZXN0SW5qZWN0b3IoKTtcblxuLy8gUmVzZXQgdGhlIHRlc3QgcHJvdmlkZXJzIGJlZm9yZSBlYWNoIHRlc3QuXG5qc21CZWZvcmVFYWNoKCgpID0+IHsgdGVzdEluamVjdG9yLnJlc2V0KCk7IH0pO1xuXG4vKipcbiAqIEFsbG93cyBvdmVycmlkaW5nIGRlZmF1bHQgcHJvdmlkZXJzIG9mIHRoZSB0ZXN0IGluamVjdG9yLFxuICogd2hpY2ggYXJlIGRlZmluZWQgaW4gdGVzdF9pbmplY3Rvci5qcy5cbiAqXG4gKiBUaGUgZ2l2ZW4gZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBsaXN0IG9mIERJIHByb3ZpZGVycy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdiZWZvcmVFYWNoUHJvdmlkZXJzJ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hQcm92aWRlcnMoZm4pOiB2b2lkIHtcbiAganNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdmFyIHByb3ZpZGVycyA9IGZuKCk7XG4gICAgaWYgKCFwcm92aWRlcnMpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgdGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYmVmb3JlRWFjaFByb3ZpZGVycyB3YXMgY2FsbGVkIGFmdGVyIHRoZSBpbmplY3RvciBoYWQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2JlZW4gdXNlZCBpbiBhIGJlZm9yZUVhY2ggb3IgaXQgYmxvY2suIFRoaXMgaW52YWxpZGF0ZXMgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICd0ZXN0IGluamVjdG9yJyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gX3dyYXBUZXN0Rm4oZm46IEZ1bmN0aW9uKSB7XG4gIC8vIFdyYXBzIGEgdGVzdCBvciBiZWZvcmVFYWNoIGZ1bmN0aW9uIHRvIGhhbmRsZSBzeW5jaHJvbm91cyBhbmQgYXN5bmNocm9ub3VzIGV4ZWN1dGlvbi5cbiAgcmV0dXJuIChkb25lOiBhbnkpID0+IHtcbiAgICBpZiAoZm4ubGVuZ3RoID09PSAwKSB7XG4gICAgICBsZXQgcmV0VmFsID0gZm4oKTtcbiAgICAgIGlmIChpc1Byb21pc2UocmV0VmFsKSkge1xuICAgICAgICAvLyBBc3luY2hyb25vdXMgdGVzdCBmdW5jdGlvbiAtIHdhaXQgZm9yIGNvbXBsZXRpb24uXG4gICAgICAgICg8UHJvbWlzZTxhbnk+PnJldFZhbCkudGhlbihkb25lLCBkb25lLmZhaWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU3luY2hyb25vdXMgdGVzdCBmdW5jdGlvbiAtIGNvbXBsZXRlIGltbWVkaWF0ZWx5LlxuICAgICAgICBkb25lKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEFzeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIHRoYXQgdGFrZXMgXCJkb25lXCIgYXMgcGFyYW1ldGVyLlxuICAgICAgZm4oZG9uZSk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBfaXQoanNtRm46IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcsIHRlc3RGbjogRnVuY3Rpb24sIHRlc3RUaW1lT3V0OiBudW1iZXIpOiB2b2lkIHtcbiAganNtRm4obmFtZSwgX3dyYXBUZXN0Rm4odGVzdEZuKSwgdGVzdFRpbWVPdXQpO1xufVxuXG4vKipcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgYmVmb3JlRWFjaCBmdW5jdGlvbi5cbiAqXG4gKiBiZWZvcmVFYWNoIG1heSBiZSB1c2VkIHdpdGggdGhlIGBpbmplY3RgIGZ1bmN0aW9uIHRvIGZldGNoIGRlcGVuZGVuY2llcy5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2JlZm9yZUVhY2gnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaChmbjogRnVuY3Rpb24pOiB2b2lkIHtcbiAganNtQmVmb3JlRWFjaChfd3JhcFRlc3RGbihmbikpO1xufVxuXG4vKipcbiAqIERlZmluZSBhIHNpbmdsZSB0ZXN0IGNhc2Ugd2l0aCB0aGUgZ2l2ZW4gdGVzdCBuYW1lIGFuZCBleGVjdXRpb24gZnVuY3Rpb24uXG4gKlxuICogVGhlIHRlc3QgZnVuY3Rpb24gY2FuIGJlIGVpdGhlciBhIHN5bmNocm9ub3VzIGZ1bmN0aW9uLCB0aGUgcmVzdWx0IG9mIHtAbGluayBhc3luY30sXG4gKiBvciBhbiBpbmplY3RlZCBmdW5jdGlvbiBjcmVhdGVkIHZpYSB7QGxpbmsgaW5qZWN0fS5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGl0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2Rlc2NyaWJlSXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb24sIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIGl0fSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gZXhjbHVkZSB0aGlzIHRlc3RcbiAqIGVudGlyZWx5LiBVc2VmdWwgZm9yIGRlYnVnZ2luZyBvciBmb3IgZXhjbHVkaW5nIGJyb2tlbiB0ZXN0cyB1bnRpbFxuICogdGhleSBjYW4gYmUgZml4ZWQuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSB4aXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0neGl0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHhpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbiwgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbVhJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIFNlZSB7QGxpbmsgZml0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbiwgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuXG4vKipcbiAqIExpa2Uge0BsaW5rIGl0fSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gb25seSBydW4gdGhpcyB0ZXN0LlxuICogVXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBmaXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZml0J31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbiwgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUlJdCwgbmFtZSwgZm4sIHRpbWVPdXQpO1xufVxuIl19