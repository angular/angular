'use strict';/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var test_injector_1 = require('./test_injector');
var test_injector_2 = require('./test_injector');
exports.inject = test_injector_2.inject;
exports.injectAsync = test_injector_2.injectAsync;
var matchers_1 = require('./matchers');
exports.expect = matchers_1.expect;
var _global = (typeof window === 'undefined' ? lang_1.global : window);
/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
exports.afterEach = _global.afterEach;
/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
exports.describe = _global.describe;
/**
 * See {@link fdescribe}.
 */
exports.ddescribe = _global.fdescribe;
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
exports.fdescribe = _global.fdescribe;
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
exports.xdescribe = _global.xdescribe;
var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var testProviders;
var injector;
// Reset the test providers before each test.
jsmBeforeEach(function () {
    testProviders = [];
    injector = null;
});
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
function beforeEachProviders(fn) {
    jsmBeforeEach(function () {
        var providers = fn();
        if (!providers)
            return;
        testProviders = testProviders.concat(providers);
        if (injector !== null) {
            throw new Error('beforeEachProviders was called after the injector had ' +
                'been used in a beforeEach or it block. This invalidates the ' +
                'test injector');
        }
    });
}
exports.beforeEachProviders = beforeEachProviders;
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function runInTestZone(fnToExecute, finishCallback, failCallback) {
    var pendingMicrotasks = 0;
    var pendingTimeouts = [];
    var ngTestZone = lang_1.global.zone
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
            return function (fn, delay) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
                var id;
                var cb = function () {
                    fn();
                    collection_1.ListWrapper.remove(pendingTimeouts, id);
                };
                id = parentSetTimeout(cb, delay, args);
                pendingTimeouts.push(id);
                return id;
            };
        },
        '$clearTimeout': function (parentClearTimeout) {
            return function (id) {
                parentClearTimeout(id);
                collection_1.ListWrapper.remove(pendingTimeouts, id);
            };
        },
    });
    return ngTestZone.run(fnToExecute);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
        jsmFn(name, function (done) {
            if (!injector) {
                injector = test_injector_1.createTestInjectorWithRuntimeCompiler(testProviders);
            }
            var finishCallback = function () {
                // Wait one more event loop to make sure we catch unreturned promises and
                // promise rejections.
                setTimeout(done, 0);
            };
            var returnedTestValue = runInTestZone(function () { return testFn.execute(injector); }, finishCallback, done.fail);
            if (testFn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(null, function (err) { done.fail(err); });
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
function beforeEach(fn) {
    if (fn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        jsmBeforeEach(function (done) {
            var finishCallback = function () {
                // Wait one more event loop to make sure we catch unreturned promises and
                // promise rejections.
                setTimeout(done, 0);
            };
            if (!injector) {
                injector = test_injector_1.createTestInjectorWithRuntimeCompiler(testProviders);
            }
            var returnedTestValue = runInTestZone(function () { return fn.execute(injector); }, finishCallback, done.fail);
            if (fn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(null, function (err) { done.fail(err); });
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
            jsmBeforeEach(function () { fn(); });
        }
        else {
            jsmBeforeEach(function (done) { fn(done); });
        }
    }
}
exports.beforeEach = beforeEach;
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
function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
exports.it = it;
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
function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
exports.xit = xit;
/**
 * See {@link fit}.
 */
function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.iit = iit;
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
function fit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.fit = fit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwicnVuSW5UZXN0Wm9uZSIsIl9pdCIsImJlZm9yZUVhY2giLCJpdCIsInhpdCIsImlpdCIsImZpdCJdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFDaEQsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFHM0QsOEJBS08saUJBQWlCLENBQUMsQ0FBQTtBQUV6Qiw4QkFBa0MsaUJBQWlCLENBQUM7QUFBNUMsd0NBQU07QUFBRSxrREFBb0M7QUFFcEQseUJBQWlDLFlBQVksQ0FBQztBQUF0QyxtQ0FBc0M7QUFFOUMsSUFBSSxPQUFPLEdBQWdDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxHQUFHLGFBQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUU3Rjs7Ozs7Ozs7R0FRRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7R0FRRztBQUNRLGdCQUFRLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUVqRDs7R0FFRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7O0dBU0c7QUFDUSxpQkFBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFFbkQ7Ozs7Ozs7Ozs7R0FVRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQWtCbkQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUN2QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDO0FBQ3ZCLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDekIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdB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ckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBO0FBRUQ7O0dBRUc7QUFDSCxhQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsYUFBb0IsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQXNCO0lBQXRCQyx1QkFBc0JBLEdBQXRCQSxjQUFzQkE7SUFDeENBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3hDQSxDQUFDQTtBQUhlLFdBQUcsTUFHbEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHVibGljIFRlc3QgTGlicmFyeSBmb3IgdW5pdCB0ZXN0aW5nIEFuZ3VsYXIyIEFwcGxpY2F0aW9ucy4gVXNlcyB0aGVcbiAqIEphc21pbmUgZnJhbWV3b3JrLlxuICovXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2JpbmR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBjcmVhdGVUZXN0SW5qZWN0b3JXaXRoUnVudGltZUNvbXBpbGVyLFxuICBGdW5jdGlvbldpdGhQYXJhbVRva2VucyxcbiAgaW5qZWN0LFxuICBpbmplY3RBc3luY1xufSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2luamVjdCwgaW5qZWN0QXN5bmN9IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7ZXhwZWN0LCBOZ01hdGNoZXJzfSBmcm9tICcuL21hdGNoZXJzJztcblxudmFyIF9nbG9iYWw6IGphc21pbmUuR2xvYmFsUG9sbHV0ZXIgPSA8YW55Pih0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyk7XG5cbi8qKlxuICogUnVuIGEgZnVuY3Rpb24gKHdpdGggYW4gb3B0aW9uYWwgYXN5bmNocm9ub3VzIGNhbGxiYWNrKSBhZnRlciBlYWNoIHRlc3QgY2FzZS5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2FmdGVyRWFjaCd9XG4gKi9cbmV4cG9ydCB2YXIgYWZ0ZXJFYWNoOiBGdW5jdGlvbiA9IF9nbG9iYWwuYWZ0ZXJFYWNoO1xuXG4vKipcbiAqIEdyb3VwIHRlc3QgY2FzZXMgdG9nZXRoZXIgdW5kZXIgYSBjb21tb24gZGVzY3JpcHRpb24gcHJlZml4LlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZGVzY3JpYmVJdCd9XG4gKi9cbmV4cG9ydCB2YXIgZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5kZXNjcmliZTtcblxuLyoqXG4gKiBTZWUge0BsaW5rIGZkZXNjcmliZX0uXG4gKi9cbmV4cG9ydCB2YXIgZGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIExpa2Uge0BsaW5rIGRlc2NyaWJlfSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gb25seSBydW5cbiAqIHRoZSB0ZXN0IGNhc2VzIGluIHRoaXMgZ3JvdXAuIFRoaXMgaXMgdXNlZnVsIGZvciBkZWJ1Z2dpbmcuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdmZGVzY3JpYmUnfVxuICovXG5leHBvcnQgdmFyIGZkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmZkZXNjcmliZTtcblxuLyoqXG4gKiBMaWtlIHtAbGluayBkZXNjcmliZX0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIGV4Y2x1ZGVcbiAqIHRoaXMgZ3JvdXAgb2YgdGVzdCBjYXNlcyBmcm9tIGV4ZWN1dGlvbi4gVGhpcyBpcyB1c2VmdWwgZm9yXG4gKiBkZWJ1Z2dpbmcsIG9yIGZvciBleGNsdWRpbmcgYnJva2VuIHRlc3RzIHVudGlsIHRoZXkgY2FuIGJlIGZpeGVkLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0neGRlc2NyaWJlJ31cbiAqL1xuZXhwb3J0IHZhciB4ZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC54ZGVzY3JpYmU7XG5cbi8qKlxuICogU2lnbmF0dXJlIGZvciBhIHN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gKG5vIGFyZ3VtZW50cykuXG4gKi9cbmV4cG9ydCB0eXBlIFN5bmNUZXN0Rm4gPSAoKSA9PiB2b2lkO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYW4gYXN5bmNocm9ub3VzIHRlc3QgZnVuY3Rpb24gd2hpY2ggdGFrZXMgYVxuICogYGRvbmVgIGNhbGxiYWNrLlxuICovXG5leHBvcnQgdHlwZSBBc3luY1Rlc3RGbiA9IChkb25lOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYW55IHNpbXBsZSB0ZXN0aW5nIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgdHlwZSBBbnlUZXN0Rm4gPSBTeW5jVGVzdEZuIHwgQXN5bmNUZXN0Rm47XG5cbnZhciBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xudmFyIGpzbUl0ID0gX2dsb2JhbC5pdDtcbnZhciBqc21JSXQgPSBfZ2xvYmFsLmZpdDtcbnZhciBqc21YSXQgPSBfZ2xvYmFsLnhpdDtcblxudmFyIHRlc3RQcm92aWRlcnM7XG52YXIgaW5qZWN0b3I7XG5cbi8vIFJlc2V0IHRoZSB0ZXN0IHByb3ZpZGVycyBiZWZvcmUgZWFjaCB0ZXN0LlxuanNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gIHRlc3RQcm92aWRlcnMgPSBbXTtcbiAgaW5qZWN0b3IgPSBudWxsO1xufSk7XG5cbi8qKlxuICogQWxsb3dzIG92ZXJyaWRpbmcgZGVmYXVsdCBwcm92aWRlcnMgb2YgdGhlIHRlc3QgaW5qZWN0b3IsXG4gKiB3aGljaCBhcmUgZGVmaW5lZCBpbiB0ZXN0X2luamVjdG9yLmpzLlxuICpcbiAqIFRoZSBnaXZlbiBmdW5jdGlvbiBtdXN0IHJldHVybiBhIGxpc3Qgb2YgREkgcHJvdmlkZXJzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2JlZm9yZUVhY2hQcm92aWRlcnMnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaFByb3ZpZGVycyhmbik6IHZvaWQge1xuICBqc21CZWZvcmVFYWNoKCgpID0+IHtcbiAgICB2YXIgcHJvdmlkZXJzID0gZm4oKTtcbiAgICBpZiAoIXByb3ZpZGVycykgcmV0dXJuO1xuICAgIHRlc3RQcm92aWRlcnMgPSBbLi4udGVzdFByb3ZpZGVycywgLi4ucHJvdmlkZXJzXTtcbiAgICBpZiAoaW5qZWN0b3IgIT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYmVmb3JlRWFjaFByb3ZpZGVycyB3YXMgY2FsbGVkIGFmdGVyIHRoZSBpbmplY3RvciBoYWQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2JlZW4gdXNlZCBpbiBhIGJlZm9yZUVhY2ggb3IgaXQgYmxvY2suIFRoaXMgaW52YWxpZGF0ZXMgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICd0ZXN0IGluamVjdG9yJyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gX2lzUHJvbWlzZUxpa2UoaW5wdXQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlucHV0ICYmICEhKGlucHV0LnRoZW4pO1xufVxuXG5mdW5jdGlvbiBydW5JblRlc3Rab25lKGZuVG9FeGVjdXRlLCBmaW5pc2hDYWxsYmFjaywgZmFpbENhbGxiYWNrKTogYW55IHtcbiAgdmFyIHBlbmRpbmdNaWNyb3Rhc2tzID0gMDtcbiAgdmFyIHBlbmRpbmdUaW1lb3V0cyA9IFtdO1xuXG4gIHZhciBuZ1Rlc3Rab25lID0gKDxab25lPmdsb2JhbC56b25lKVxuICAgICAgICAgICAgICAgICAgICAgICAuZm9yayh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24oZSkgeyBmYWlsQ2FsbGJhY2soZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyRydW4nOiBmdW5jdGlvbihwYXJlbnRSdW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50UnVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdNaWNyb3Rhc2tzID09IDAgJiYgcGVuZGluZ1RpbWVvdXRzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICckc2NoZWR1bGVNaWNyb3Rhc2snOiBmdW5jdGlvbihwYXJlbnRTY2hlZHVsZU1pY3JvdGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdNaWNyb3Rhc2tzKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtaWNyb3Rhc2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ01pY3JvdGFza3MtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFNjaGVkdWxlTWljcm90YXNrLmNhbGwodGhpcywgbWljcm90YXNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnJHNldFRpbWVvdXQnOiBmdW5jdGlvbihwYXJlbnRTZXRUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCAuLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNiID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUocGVuZGluZ1RpbWVvdXRzLCBpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gcGFyZW50U2V0VGltZW91dChjYiwgZGVsYXksIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nVGltZW91dHMucHVzaChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnJGNsZWFyVGltZW91dCc6IGZ1bmN0aW9uKHBhcmVudENsZWFyVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGlkOiBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Q2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHBlbmRpbmdUaW1lb3V0cywgaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICByZXR1cm4gbmdUZXN0Wm9uZS5ydW4oZm5Ub0V4ZWN1dGUpO1xufVxuXG5mdW5jdGlvbiBfaXQoanNtRm46IEZ1bmN0aW9uLCBuYW1lOiBzdHJpbmcsIHRlc3RGbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgdGVzdFRpbWVPdXQ6IG51bWJlcik6IHZvaWQge1xuICB2YXIgdGltZU91dCA9IHRlc3RUaW1lT3V0O1xuXG4gIGlmICh0ZXN0Rm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIGpzbUZuKG5hbWUsIChkb25lKSA9PiB7XG4gICAgICBpZiAoIWluamVjdG9yKSB7XG4gICAgICAgIGluamVjdG9yID0gY3JlYXRlVGVzdEluamVjdG9yV2l0aFJ1bnRpbWVDb21waWxlcih0ZXN0UHJvdmlkZXJzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpbmlzaENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBXYWl0IG9uZSBtb3JlIGV2ZW50IGxvb3AgdG8gbWFrZSBzdXJlIHdlIGNhdGNoIHVucmV0dXJuZWQgcHJvbWlzZXMgYW5kXG4gICAgICAgIC8vIHByb21pc2UgcmVqZWN0aW9ucy5cbiAgICAgICAgc2V0VGltZW91dChkb25lLCAwKTtcbiAgICAgIH07XG4gICAgICB2YXIgcmV0dXJuZWRUZXN0VmFsdWUgPVxuICAgICAgICAgIHJ1bkluVGVzdFpvbmUoKCkgPT4gdGVzdEZuLmV4ZWN1dGUoaW5qZWN0b3IpLCBmaW5pc2hDYWxsYmFjaywgZG9uZS5mYWlsKTtcblxuICAgICAgaWYgKHRlc3RGbi5pc0FzeW5jKSB7XG4gICAgICAgIGlmIChfaXNQcm9taXNlTGlrZShyZXR1cm5lZFRlc3RWYWx1ZSkpIHtcbiAgICAgICAgICAoPFByb21pc2U8YW55Pj5yZXR1cm5lZFRlc3RWYWx1ZSkudGhlbihudWxsLCAoZXJyKSA9PiB7IGRvbmUuZmFpbChlcnIpOyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3RBc3luYyB3YXMgZXhwZWN0ZWQgdG8gcmV0dXJuIGEgcHJvbWlzZSwgYnV0IHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgJyByZXR1cm5lZCB2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghKHJldHVybmVkVGVzdFZhbHVlID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgZG9uZS5mYWlsKCdFcnJvcjogaW5qZWN0IHJldHVybmVkIGEgdmFsdWUuIERpZCB5b3UgbWVhbiB0byB1c2UgaW5qZWN0QXN5bmM/IFJldHVybmVkICcgK1xuICAgICAgICAgICAgICAgICAgICAndmFsdWUgd2FzOiAnICsgcmV0dXJuZWRUZXN0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwgdGltZU91dCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSBkb2Vzbid0IHVzZSBpbmplY3QoKS4gaWUgYGl0KCd0ZXN0JywgKGRvbmUpID0+IHsgLi4uIH0pKTtgXG4gICAganNtRm4obmFtZSwgdGVzdEZuLCB0aW1lT3V0KTtcbiAgfVxufVxuXG4vKipcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgYmVmb3JlRWFjaCBmdW5jdGlvbi5cbiAqXG4gKiBiZWZvcmVFYWNoIG1heSBiZSB1c2VkIHdpdGggdGhlIGBpbmplY3RgIGZ1bmN0aW9uIHRvIGZldGNoIGRlcGVuZGVuY2llcy5cbiAqIFRoZSB0ZXN0IHdpbGwgYXV0b21hdGljYWxseSB3YWl0IGZvciBhbnkgYXN5bmNocm9ub3VzIGNhbGxzIGluc2lkZSB0aGVcbiAqIGluamVjdGVkIHRlc3QgZnVuY3Rpb24gdG8gY29tcGxldGUuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdiZWZvcmVFYWNoJ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2goZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuKTogdm9pZCB7XG4gIGlmIChmbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSB1c2VzIGluamVjdCgpLiBpZSBgYmVmb3JlRWFjaChpbmplY3QoW0NsYXNzQV0sIChhKSA9PiB7IC4uLlxuICAgIC8vIH0pKTtgXG4gICAganNtQmVmb3JlRWFjaCgoZG9uZSkgPT4ge1xuICAgICAgdmFyIGZpbmlzaENhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAvLyBXYWl0IG9uZSBtb3JlIGV2ZW50IGxvb3AgdG8gbWFrZSBzdXJlIHdlIGNhdGNoIHVucmV0dXJuZWQgcHJvbWlzZXMgYW5kXG4gICAgICAgIC8vIHByb21pc2UgcmVqZWN0aW9ucy5cbiAgICAgICAgc2V0VGltZW91dChkb25lLCAwKTtcbiAgICAgIH07XG4gICAgICBpZiAoIWluamVjdG9yKSB7XG4gICAgICAgIGluamVjdG9yID0gY3JlYXRlVGVzdEluamVjdG9yV2l0aFJ1bnRpbWVDb21waWxlcih0ZXN0UHJvdmlkZXJzKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJldHVybmVkVGVzdFZhbHVlID0gcnVuSW5UZXN0Wm9uZSgoKSA9PiBmbi5leGVjdXRlKGluamVjdG9yKSwgZmluaXNoQ2FsbGJhY2ssIGRvbmUuZmFpbCk7XG4gICAgICBpZiAoZm4uaXNBc3luYykge1xuICAgICAgICBpZiAoX2lzUHJvbWlzZUxpa2UocmV0dXJuZWRUZXN0VmFsdWUpKSB7XG4gICAgICAgICAgKDxQcm9taXNlPGFueT4+cmV0dXJuZWRUZXN0VmFsdWUpLnRoZW4obnVsbCwgKGVycikgPT4geyBkb25lLmZhaWwoZXJyKTsgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9uZS5mYWlsKCdFcnJvcjogaW5qZWN0QXN5bmMgd2FzIGV4cGVjdGVkIHRvIHJldHVybiBhIHByb21pc2UsIGJ1dCB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICcgcmV0dXJuZWQgdmFsdWUgd2FzOiAnICsgcmV0dXJuZWRUZXN0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIShyZXR1cm5lZFRlc3RWYWx1ZSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdCByZXR1cm5lZCBhIHZhbHVlLiBEaWQgeW91IG1lYW4gdG8gdXNlIGluamVjdEFzeW5jPyBSZXR1cm5lZCAnICtcbiAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgZG9lc24ndCB1c2UgaW5qZWN0KCkuIGllIGBiZWZvcmVFYWNoKChkb25lKSA9PiB7IC4uLiB9KSk7YFxuICAgIGlmICgoPGFueT5mbikubGVuZ3RoID09PSAwKSB7XG4gICAgICBqc21CZWZvcmVFYWNoKCgpID0+IHsgKDxTeW5jVGVzdEZuPmZuKSgpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAganNtQmVmb3JlRWFjaCgoZG9uZSkgPT4geyAoPEFzeW5jVGVzdEZuPmZuKShkb25lKTsgfSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGVmaW5lIGEgc2luZ2xlIHRlc3QgY2FzZSB3aXRoIHRoZSBnaXZlbiB0ZXN0IG5hbWUgYW5kIGV4ZWN1dGlvbiBmdW5jdGlvbi5cbiAqXG4gKiBUaGUgdGVzdCBmdW5jdGlvbiBjYW4gYmUgZWl0aGVyIGEgc3luY2hyb25vdXMgZnVuY3Rpb24sIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvblxuICogdGhhdCB0YWtlcyBhIGNvbXBsZXRpb24gY2FsbGJhY2ssIG9yIGFuIGluamVjdGVkIGZ1bmN0aW9uIGNyZWF0ZWQgdmlhIHtAbGluayBpbmplY3R9XG4gKiBvciB7QGxpbmsgaW5qZWN0QXN5bmN9LiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxsc1xuICogaW5zaWRlIHRoZSBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgaXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZGVzY3JpYmVJdCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuLyoqXG4gKiBMaWtlIHtAbGluayBpdH0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIGV4Y2x1ZGUgdGhpcyB0ZXN0XG4gKiBlbnRpcmVseS4gVXNlZnVsIGZvciBkZWJ1Z2dpbmcgb3IgZm9yIGV4Y2x1ZGluZyBicm9rZW4gdGVzdHMgdW50aWxcbiAqIHRoZXkgY2FuIGJlIGZpeGVkLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgeGl0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J3hpdCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4aXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21YSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuLyoqXG4gKiBTZWUge0BsaW5rIGZpdH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuLyoqXG4gKiBMaWtlIHtAbGluayBpdH0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIG9ubHkgcnVuIHRoaXMgdGVzdC5cbiAqIFVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgZml0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2ZpdCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cbiJdfQ==