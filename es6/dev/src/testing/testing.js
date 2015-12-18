import { global } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { FunctionWithParamTokens, getTestInjector } from './test_injector';
export { inject, injectAsync } from './test_injector';
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
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function runInTestZone(fnToExecute, finishCallback, failCallback) {
    var pendingMicrotasks = 0;
    var pendingTimeouts = [];
    var ngTestZone = global.zone
        .fork({
        onError: function (e) { failCallback(e); },
        '$run': function (parentRun) {
            return function () {
                try {
                    return parentRun.apply(this, arguments);
                }
                finally {
                    if (pendingMicrotasks == 0 && pendingTimeouts.length == 0) {
                        finishCallback();
                    }
                }
            };
        },
        '$scheduleMicrotask': function (parentScheduleMicrotask) {
            return function (fn) {
                pendingMicrotasks++;
                var microtask = function () {
                    try {
                        fn();
                    }
                    finally {
                        pendingMicrotasks--;
                    }
                };
                parentScheduleMicrotask.call(this, microtask);
            };
        },
        '$setTimeout': function (parentSetTimeout) {
            return function (fn, delay, ...args) {
                var id;
                var cb = function () {
                    fn();
                    ListWrapper.remove(pendingTimeouts, id);
                };
                id = parentSetTimeout(cb, delay, args);
                pendingTimeouts.push(id);
                return id;
            };
        },
        '$clearTimeout': function (parentClearTimeout) {
            return function (id) {
                parentClearTimeout(id);
                ListWrapper.remove(pendingTimeouts, id);
            };
        },
    });
    return ngTestZone.run(fnToExecute);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof FunctionWithParamTokens) {
        jsmFn(name, (done) => {
            var finishCallback = () => {
                // Wait one more event loop to make sure we catch unreturned promises and
                // promise rejections.
                setTimeout(done, 0);
            };
            var returnedTestValue = runInTestZone(() => testInjector.execute(testFn), finishCallback, done.fail);
            if (testFn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(null, (err) => { done.fail(err); });
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returnedTestValue);
                }
            }
            else {
                if (!(returnedTestValue === undefined)) {
                    done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                        'value was: ' + returnedTestValue);
                }
            }
        }, timeOut);
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        jsmFn(name, testFn, timeOut);
    }
}
/**
 * Wrapper around Jasmine beforeEach function.
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='beforeEach'}
 */
export function beforeEach(fn) {
    if (fn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        jsmBeforeEach((done) => {
            var finishCallback = () => {
                // Wait one more event loop to make sure we catch unreturned promises and
                // promise rejections.
                setTimeout(done, 0);
            };
            var returnedTestValue = runInTestZone(() => testInjector.execute(fn), finishCallback, done.fail);
            if (fn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(null, (err) => { done.fail(err); });
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returnedTestValue);
                }
            }
            else {
                if (!(returnedTestValue === undefined)) {
                    done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                        'value was: ' + returnedTestValue);
                }
            }
        });
    }
    else {
        // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`
        if (fn.length === 0) {
            jsmBeforeEach(() => { fn(); });
        }
        else {
            jsmBeforeEach((done) => { fn(done); });
        }
    }
}
/**
 * Define a single test case with the given test name and execution function.
 *
 * The test function can be either a synchronous function, an asynchronous function
 * that takes a completion callback, or an injected function created via {@link inject}
 * or {@link injectAsync}. The test will automatically wait for any asynchronous calls
 * inside the injected test function to complete.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwicnVuSW5UZXN0Wm9uZSIsIl9pdCIsImJlZm9yZUVhY2giLCJpdCIsInhpdCIsImlpdCIsImZpdCJdLCJtYXBwaW5ncyI6Ik9BSU8sRUFBQyxNQUFNLEVBQUMsTUFBTSwwQkFBMEI7T0FDeEMsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FHbkQsRUFDTCx1QkFBdUIsRUFJdkIsZUFBZSxFQUNoQixNQUFNLGlCQUFpQjtBQUV4QixTQUFRLE1BQU0sRUFBRSxXQUFXLFFBQU8saUJBQWlCLENBQUM7QUFFcEQsU0FBUSxNQUFNLFFBQW1CLFlBQVksQ0FBQztBQUU5QyxJQUFJLE9BQU8sR0FBZ0MsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBRTdGOzs7Ozs7OztHQVFHO0FBQ0gsV0FBVyxTQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7R0FRRztBQUNILFdBQVcsUUFBUSxHQUFhLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFFakQ7O0dBRUc7QUFDSCxXQUFXLFNBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7Ozs7R0FTRztBQUNILFdBQVcsU0FBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFFbkQ7Ozs7Ozs7Ozs7R0FVRztBQUNILFdBQVcsU0FBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFrQm5ELElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDdkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUN2QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ3pCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFFekIsSUFBSSxZQUFZLEdBQWlCLGVBQWUsRUFBRSxDQUFDO0FBRW5ELDZDQUE2QztBQUM3QyxhQUFhLENBQUMsUUFBUSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUUvQzs7Ozs7Ozs7O0dBU0c7QUFDSCxvQ0FBb0MsRUFBRTtJQUNwQ0EsYUFBYUEsQ0FBQ0E7UUFDWkEsSUFBSUEsU0FBU0EsR0FBR0EsRUFBRUEsRUFBRUEsQ0FBQ0E7UUFDckJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ3ZCQSxJQUFJQSxDQUFDQTtZQUNIQSxZQUFZQSxDQUFDQSxZQUFZQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUN2Q0EsQ0FBRUE7UUFBQUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsTUFBTUEsSUFBSUEsS0FBS0EsQ0FBQ0Esd0RBQXdEQTtnQkFDeERBLDhEQUE4REE7Z0JBQzlEQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUNuQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0E7QUFFRCx3QkFBd0IsS0FBSztJQUMzQkMsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7QUFDakNBLENBQUNBO0FBRUQsdUJBQXVCLFdBQVcsRUFBRSxjQUFjLEVBQUUsWUFBWTtJQUM5REMsSUFBSUEsaUJBQWlCQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUMxQkEsSUFBSUEsZUFBZUEsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFFekJBLElBQUlBLFVBQVVBLEdBQVVBLE1BQU1BLENBQUNBLElBQUtBO1NBQ2RBLElBQUlBLENBQUNBO1FBQ0pBLE9BQU9BLEVBQUVBLFVBQVNBLENBQUNBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6Q0EsTUFBTUEsRUFBRUEsVUFBU0EsU0FBU0E7WUFDeEIsTUFBTSxDQUFDO2dCQUNMLElBQUksQ0FBQztvQkFDSCxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQzFDLENBQUM7d0JBQVMsQ0FBQztvQkFDVCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQztnQkFDSCxDQUFDO1lBQ0gsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNEQSxvQkFBb0JBLEVBQUVBLFVBQVNBLHVCQUF1QkE7WUFDcEQsTUFBTSxDQUFDLFVBQVMsRUFBRTtnQkFDaEIsaUJBQWlCLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxTQUFTLEdBQUc7b0JBQ2QsSUFBSSxDQUFDO3dCQUNILEVBQUUsRUFBRSxDQUFDO29CQUNQLENBQUM7NEJBQVMsQ0FBQzt3QkFDVCxpQkFBaUIsRUFBRSxDQUFDO29CQUN0QixDQUFDO2dCQUNILENBQUMsQ0FBQztnQkFDRix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQztRQUNKLENBQUM7UUFDREEsYUFBYUEsRUFBRUEsVUFBU0EsZ0JBQWdCQTtZQUN0QyxNQUFNLENBQUMsVUFBUyxFQUFZLEVBQUUsS0FBYSxFQUFFLEdBQUcsSUFBSTtnQkFDbEQsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLEdBQUc7b0JBQ1AsRUFBRSxFQUFFLENBQUM7b0JBQ0wsV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLENBQUMsQ0FBQztnQkFDRixFQUFFLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdkMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekIsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNaLENBQUMsQ0FBQztRQUNKLENBQUM7UUFDREEsZUFBZUEsRUFBRUEsVUFBU0Esa0JBQWtCQTtZQUMxQyxNQUFNLENBQUMsVUFBUyxFQUFVO2dCQUN4QixrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNGQSxDQUFDQSxDQUFDQTtJQUV4QkEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7QUFDckNBLENBQUNBO0FBRUQsYUFBYSxLQUFlLEVBQUUsSUFBWSxFQUFFLE1BQTJDLEVBQzFFLFdBQW1CO0lBQzlCQyxJQUFJQSxPQUFPQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUUxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsdUJBQXVCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5Q0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsSUFBSUE7WUFDZkEsSUFBSUEsY0FBY0EsR0FBR0E7Z0JBQ25CQSx5RUFBeUVBO2dCQUN6RUEsc0JBQXNCQTtnQkFDdEJBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxDQUFDQSxDQUFDQTtZQUNGQSxJQUFJQSxpQkFBaUJBLEdBQ2pCQSxhQUFhQSxDQUFDQSxNQUFNQSxZQUFZQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxjQUFjQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUVqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN2QkEsaUJBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxHQUFHQSxPQUFPQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0VBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDTkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsK0RBQStEQTt3QkFDL0RBLHVCQUF1QkEsR0FBR0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtnQkFDekRBLENBQUNBO1lBQ0hBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxpQkFBaUJBLEtBQUtBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUN2Q0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsNEVBQTRFQTt3QkFDNUVBLGFBQWFBLEdBQUdBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQy9DQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNOQSwyRUFBMkVBO1FBQzNFQSxLQUFLQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7QUFDSEEsQ0FBQ0E7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCwyQkFBMkIsRUFBdUM7SUFDaEVDLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLFlBQVlBLHVCQUF1QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLDRFQUE0RUE7UUFDNUVBLFFBQVFBO1FBQ1JBLGFBQWFBLENBQUNBLENBQUNBLElBQUlBO1lBQ2pCQSxJQUFJQSxjQUFjQSxHQUFHQTtnQkFDbkJBLHlFQUF5RUE7Z0JBQ3pFQSxzQkFBc0JBO2dCQUN0QkEsVUFBVUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLENBQUNBLENBQUNBO1lBRUZBLElBQUlBLGlCQUFpQkEsR0FDakJBLGFBQWFBLENBQUNBLE1BQU1BLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLGNBQWNBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQzdFQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdkJBLGlCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsT0FBT0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzdFQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLElBQUlBLENBQUNBLElBQUlBLENBQUNBLCtEQUErREE7d0JBQy9EQSx1QkFBdUJBLEdBQUdBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3pEQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdkNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLDRFQUE0RUE7d0JBQzVFQSxhQUFhQSxHQUFHQSxpQkFBaUJBLENBQUNBLENBQUNBO2dCQUMvQ0EsQ0FBQ0E7WUFDSEEsQ0FBQ0E7UUFDSEEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsMkVBQTJFQTtRQUMzRUEsRUFBRUEsQ0FBQ0EsQ0FBT0EsRUFBR0EsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLGFBQWFBLENBQUNBLFFBQXFCQSxFQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsYUFBYUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsT0FBcUJBLEVBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hEQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxtQkFBbUIsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQU8sR0FBVyxJQUFJO0lBQ3ZDQyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN2Q0EsQ0FBQ0E7QUFFRDs7Ozs7Ozs7OztHQVVHO0FBQ0gsb0JBQW9CLElBQVksRUFBRSxFQUF1QyxFQUNyRCxPQUFPLEdBQVcsSUFBSTtJQUN4Q0MsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBRUQ7O0dBRUc7QUFDSCxvQkFBb0IsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQU8sR0FBVyxJQUFJO0lBQ3hDQyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN4Q0EsQ0FBQ0E7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxvQkFBb0IsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQU8sR0FBVyxJQUFJO0lBQ3hDQyxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN4Q0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFB1YmxpYyBUZXN0IExpYnJhcnkgZm9yIHVuaXQgdGVzdGluZyBBbmd1bGFyMiBBcHBsaWNhdGlvbnMuIFVzZXMgdGhlXG4gKiBKYXNtaW5lIGZyYW1ld29yay5cbiAqL1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtiaW5kfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtcbiAgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMsXG4gIGluamVjdCxcbiAgaW5qZWN0QXN5bmMsXG4gIFRlc3RJbmplY3RvcixcbiAgZ2V0VGVzdEluamVjdG9yXG59IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7aW5qZWN0LCBpbmplY3RBc3luY30gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtleHBlY3QsIE5nTWF0Y2hlcnN9IGZyb20gJy4vbWF0Y2hlcnMnO1xuXG52YXIgX2dsb2JhbDogamFzbWluZS5HbG9iYWxQb2xsdXRlciA9IDxhbnk+KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KTtcblxuLyoqXG4gKiBSdW4gYSBmdW5jdGlvbiAod2l0aCBhbiBvcHRpb25hbCBhc3luY2hyb25vdXMgY2FsbGJhY2spIGFmdGVyIGVhY2ggdGVzdCBjYXNlLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYWZ0ZXJFYWNoJ31cbiAqL1xuZXhwb3J0IHZhciBhZnRlckVhY2g6IEZ1bmN0aW9uID0gX2dsb2JhbC5hZnRlckVhY2g7XG5cbi8qKlxuICogR3JvdXAgdGVzdCBjYXNlcyB0b2dldGhlciB1bmRlciBhIGNvbW1vbiBkZXNjcmlwdGlvbiBwcmVmaXguXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdkZXNjcmliZUl0J31cbiAqL1xuZXhwb3J0IHZhciBkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmRlc2NyaWJlO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgZmRlc2NyaWJlfS5cbiAqL1xuZXhwb3J0IHZhciBkZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5mZGVzY3JpYmU7XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgZGVzY3JpYmV9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBvbmx5IHJ1blxuICogdGhlIHRlc3QgY2FzZXMgaW4gdGhpcyBncm91cC4gVGhpcyBpcyB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2ZkZXNjcmliZSd9XG4gKi9cbmV4cG9ydCB2YXIgZmRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIExpa2Uge0BsaW5rIGRlc2NyaWJlfSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gZXhjbHVkZVxuICogdGhpcyBncm91cCBvZiB0ZXN0IGNhc2VzIGZyb20gZXhlY3V0aW9uLiBUaGlzIGlzIHVzZWZ1bCBmb3JcbiAqIGRlYnVnZ2luZywgb3IgZm9yIGV4Y2x1ZGluZyBicm9rZW4gdGVzdHMgdW50aWwgdGhleSBjYW4gYmUgZml4ZWQuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSd4ZGVzY3JpYmUnfVxuICovXG5leHBvcnQgdmFyIHhkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLnhkZXNjcmliZTtcblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGEgc3luY2hyb25vdXMgdGVzdCBmdW5jdGlvbiAobm8gYXJndW1lbnRzKS5cbiAqL1xuZXhwb3J0IHR5cGUgU3luY1Rlc3RGbiA9ICgpID0+IHZvaWQ7XG5cbi8qKlxuICogU2lnbmF0dXJlIGZvciBhbiBhc3luY2hyb25vdXMgdGVzdCBmdW5jdGlvbiB3aGljaCB0YWtlcyBhXG4gKiBgZG9uZWAgY2FsbGJhY2suXG4gKi9cbmV4cG9ydCB0eXBlIEFzeW5jVGVzdEZuID0gKGRvbmU6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG5cbi8qKlxuICogU2lnbmF0dXJlIGZvciBhbnkgc2ltcGxlIHRlc3RpbmcgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCB0eXBlIEFueVRlc3RGbiA9IFN5bmNUZXN0Rm4gfCBBc3luY1Rlc3RGbjtcblxudmFyIGpzbUJlZm9yZUVhY2ggPSBfZ2xvYmFsLmJlZm9yZUVhY2g7XG52YXIganNtSXQgPSBfZ2xvYmFsLml0O1xudmFyIGpzbUlJdCA9IF9nbG9iYWwuZml0O1xudmFyIGpzbVhJdCA9IF9nbG9iYWwueGl0O1xuXG52YXIgdGVzdEluamVjdG9yOiBUZXN0SW5qZWN0b3IgPSBnZXRUZXN0SW5qZWN0b3IoKTtcblxuLy8gUmVzZXQgdGhlIHRlc3QgcHJvdmlkZXJzIGJlZm9yZSBlYWNoIHRlc3QuXG5qc21CZWZvcmVFYWNoKCgpID0+IHsgdGVzdEluamVjdG9yLnJlc2V0KCk7IH0pO1xuXG4vKipcbiAqIEFsbG93cyBvdmVycmlkaW5nIGRlZmF1bHQgcHJvdmlkZXJzIG9mIHRoZSB0ZXN0IGluamVjdG9yLFxuICogd2hpY2ggYXJlIGRlZmluZWQgaW4gdGVzdF9pbmplY3Rvci5qcy5cbiAqXG4gKiBUaGUgZ2l2ZW4gZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBsaXN0IG9mIERJIHByb3ZpZGVycy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdiZWZvcmVFYWNoUHJvdmlkZXJzJ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hQcm92aWRlcnMoZm4pOiB2b2lkIHtcbiAganNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdmFyIHByb3ZpZGVycyA9IGZuKCk7XG4gICAgaWYgKCFwcm92aWRlcnMpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgdGVzdEluamVjdG9yLmFkZFByb3ZpZGVycyhwcm92aWRlcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYmVmb3JlRWFjaFByb3ZpZGVycyB3YXMgY2FsbGVkIGFmdGVyIHRoZSBpbmplY3RvciBoYWQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2JlZW4gdXNlZCBpbiBhIGJlZm9yZUVhY2ggb3IgaXQgYmxvY2suIFRoaXMgaW52YWxpZGF0ZXMgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICd0ZXN0IGluamVjdG9yJyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gX2lzUHJvbWlzZUxpa2UoaW5wdXQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlucHV0ICYmICEhKGlucHV0LnRoZW4pO1xufVxuXG5mdW5jdGlvbiBydW5JblRlc3Rab25lKGZuVG9FeGVjdXRlLCBmaW5pc2hDYWxsYmFjaywgZmFpbENhbGxiYWNrKTogYW55IHtcbiAgdmFyIHBlbmRpbmdNaWNyb3Rhc2tzID0gMDtcbiAgdmFyIHBlbmRpbmdUaW1lb3V0cyA9IFtdO1xuXG4gIHZhciBuZ1Rlc3Rab25lID0gKDxab25lPmdsb2JhbC56b25lKVxuICAgICAgICAgICAgICAgICAgICAgICAuZm9yayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24oZSkgeyBmYWlsQ2FsbGJhY2soZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyRydW4nOiBmdW5jdGlvbihwYXJlbnRSdW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50UnVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdNaWNyb3Rhc2tzID09IDAgJiYgcGVuZGluZ1RpbWVvdXRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICckc2NoZWR1bGVNaWNyb3Rhc2snOiBmdW5jdGlvbihwYXJlbnRTY2hlZHVsZU1pY3JvdGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdNaWNyb3Rhc2tzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaWNyb3Rhc2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ01pY3JvdGFza3MtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFNjaGVkdWxlTWljcm90YXNrLmNhbGwodGhpcywgbWljcm90YXNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnJHNldFRpbWVvdXQnOiBmdW5jdGlvbihwYXJlbnRTZXRUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCAuLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNiID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUocGVuZGluZ1RpbWVvdXRzLCBpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gcGFyZW50U2V0VGltZW91dChjYiwgZGVsYXksIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nVGltZW91dHMucHVzaChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnJGNsZWFyVGltZW91dCc6IGZ1bmN0aW9uKHBhcmVudENsZWFyVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGlkOiBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Q2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHBlbmRpbmdUaW1lb3V0cywgaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICByZXR1cm4gbmdUZXN0Wm9uZS5ydW4oZm5Ub0V4ZWN1dGUpO1xufVxuXG5mdW5jdGlvbiBfaXQoanNtRm46IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcsIHRlc3RGbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgdGVzdFRpbWVPdXQ6IG51bWJlcik6IHZvaWQge1xuICB2YXIgdGltZU91dCA9IHRlc3RUaW1lT3V0O1xuXG4gIGlmICh0ZXN0Rm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIGpzbUZuKG5hbWUsIChkb25lKSA9PiB7XG4gICAgICB2YXIgZmluaXNoQ2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIFdhaXQgb25lIG1vcmUgZXZlbnQgbG9vcCB0byBtYWtlIHN1cmUgd2UgY2F0Y2ggdW5yZXR1cm5lZCBwcm9taXNlcyBhbmRcbiAgICAgICAgLy8gcHJvbWlzZSByZWplY3Rpb25zLlxuICAgICAgICBzZXRUaW1lb3V0KGRvbmUsIDApO1xuICAgICAgfTtcbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZSA9XG4gICAgICAgICAgcnVuSW5UZXN0Wm9uZSgoKSA9PiB0ZXN0SW5qZWN0b3IuZXhlY3V0ZSh0ZXN0Rm4pLCBmaW5pc2hDYWxsYmFjaywgZG9uZS5mYWlsKTtcblxuICAgICAgaWYgKHRlc3RGbi5pc0FzeW5jKSB7XG4gICAgICAgIGlmIChfaXNQcm9taXNlTGlrZShyZXR1cm5lZFRlc3RWYWx1ZSkpIHtcbiAgICAgICAgICAoPFByb21pc2U8YW55Pj5yZXR1cm5lZFRlc3RWYWx1ZSkudGhlbihudWxsLCAoZXJyKSA9PiB7IGRvbmUuZmFpbChlcnIpOyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3RBc3luYyB3YXMgZXhwZWN0ZWQgdG8gcmV0dXJuIGEgcHJvbWlzZSwgYnV0IHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgJyByZXR1cm5lZCB2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghKHJldHVybmVkVGVzdFZhbHVlID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgZG9uZS5mYWlsKCdFcnJvcjogaW5qZWN0IHJldHVybmVkIGEgdmFsdWUuIERpZCB5b3UgbWVhbiB0byB1c2UgaW5qZWN0QXN5bmM/IFJldHVybmVkICcgK1xuICAgICAgICAgICAgICAgICAgICAndmFsdWUgd2FzOiAnICsgcmV0dXJuZWRUZXN0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdGltZU91dCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSBkb2Vzbid0IHVzZSBpbmplY3QoKS4gaWUgYGl0KCd0ZXN0JywgKGRvbmUpID0+IHsgLi4uIH0pKTtgXG4gICAganNtRm4obmFtZSwgdGVzdEZuLCB0aW1lT3V0KTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgYmVmb3JlRWFjaCBmdW5jdGlvbi5cbiAqXG4gKiBiZWZvcmVFYWNoIG1heSBiZSB1c2VkIHdpdGggdGhlIGBpbmplY3RgIGZ1bmN0aW9uIHRvIGZldGNoIGRlcGVuZGVuY2llcy5cbiAqIFRoZSB0ZXN0IHdpbGwgYXV0b21hdGljYWxseSB3YWl0IGZvciBhbnkgYXN5bmNocm9ub3VzIGNhbGxzIGluc2lkZSB0aGVcbiAqIGluamVjdGVkIHRlc3QgZnVuY3Rpb24gdG8gY29tcGxldGUuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdiZWZvcmVFYWNoJ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2goZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuKTogdm9pZCB7XG4gIGlmIChmbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSB1c2VzIGluamVjdCgpLiBpZSBgYmVmb3JlRWFjaChpbmplY3QoW0NsYXNzQV0sIChhKSA9PiB7IC4uLlxuICAgIC8vIH0pKTtgXG4gICAganNtQmVmb3JlRWFjaCgoZG9uZSkgPT4ge1xuICAgICAgdmFyIGZpbmlzaENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBXYWl0IG9uZSBtb3JlIGV2ZW50IGxvb3AgdG8gbWFrZSBzdXJlIHdlIGNhdGNoIHVucmV0dXJuZWQgcHJvbWlzZXMgYW5kXG4gICAgICAgIC8vIHByb21pc2UgcmVqZWN0aW9ucy5cbiAgICAgICAgc2V0VGltZW91dChkb25lLCAwKTtcbiAgICAgIH07XG5cbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZSA9XG4gICAgICAgICAgcnVuSW5UZXN0Wm9uZSgoKSA9PiB0ZXN0SW5qZWN0b3IuZXhlY3V0ZShmbiksIGZpbmlzaENhbGxiYWNrLCBkb25lLmZhaWwpO1xuICAgICAgaWYgKGZuLmlzQXN5bmMpIHtcbiAgICAgICAgaWYgKF9pc1Byb21pc2VMaWtlKHJldHVybmVkVGVzdFZhbHVlKSkge1xuICAgICAgICAgICg8UHJvbWlzZTxhbnk+PnJldHVybmVkVGVzdFZhbHVlKS50aGVuKG51bGwsIChlcnIpID0+IHsgZG9uZS5mYWlsKGVycik7IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdEFzeW5jIHdhcyBleHBlY3RlZCB0byByZXR1cm4gYSBwcm9taXNlLCBidXQgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAnIHJldHVybmVkIHZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEocmV0dXJuZWRUZXN0VmFsdWUgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3QgcmV0dXJuZWQgYSB2YWx1ZS4gRGlkIHlvdSBtZWFuIHRvIHVzZSBpbmplY3RBc3luYz8gUmV0dXJuZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgYmVmb3JlRWFjaCgoZG9uZSkgPT4geyAuLi4gfSkpO2BcbiAgICBpZiAoKDxhbnk+Zm4pLmxlbmd0aCA9PT0gMCkge1xuICAgICAganNtQmVmb3JlRWFjaCgoKSA9PiB7ICg8U3luY1Rlc3RGbj5mbikoKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGpzbUJlZm9yZUVhY2goKGRvbmUpID0+IHsgKDxBc3luY1Rlc3RGbj5mbikoZG9uZSk7IH0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERlZmluZSBhIHNpbmdsZSB0ZXN0IGNhc2Ugd2l0aCB0aGUgZ2l2ZW4gdGVzdCBuYW1lIGFuZCBleGVjdXRpb24gZnVuY3Rpb24uXG4gKlxuICogVGhlIHRlc3QgZnVuY3Rpb24gY2FuIGJlIGVpdGhlciBhIHN5bmNocm9ub3VzIGZ1bmN0aW9uLCBhbiBhc3luY2hyb25vdXMgZnVuY3Rpb25cbiAqIHRoYXQgdGFrZXMgYSBjb21wbGV0aW9uIGNhbGxiYWNrLCBvciBhbiBpbmplY3RlZCBmdW5jdGlvbiBjcmVhdGVkIHZpYSB7QGxpbmsgaW5qZWN0fVxuICogb3Ige0BsaW5rIGluamVjdEFzeW5jfS4gVGhlIHRlc3Qgd2lsbCBhdXRvbWF0aWNhbGx5IHdhaXQgZm9yIGFueSBhc3luY2hyb25vdXMgY2FsbHNcbiAqIGluc2lkZSB0aGUgaW5qZWN0ZWQgdGVzdCBmdW5jdGlvbiB0byBjb21wbGV0ZS5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGl0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2Rlc2NyaWJlSXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgaXR9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBleGNsdWRlIHRoaXMgdGVzdFxuICogZW50aXJlbHkuIFVzZWZ1bCBmb3IgZGVidWdnaW5nIG9yIGZvciBleGNsdWRpbmcgYnJva2VuIHRlc3RzIHVudGlsXG4gKiB0aGV5IGNhbiBiZSBmaXhlZC5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIHhpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSd4aXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24geGl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtWEl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBmaXR9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgaXR9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBvbmx5IHJ1biB0aGlzIHRlc3QuXG4gKiBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGZpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdmaXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG4iXX0=