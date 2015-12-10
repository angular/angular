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
 * See http://jasmine.github.io/
 */
exports.afterEach = _global.afterEach;
/**
 * See http://jasmine.github.io/
 */
exports.describe = _global.describe;
/**
 * See http://jasmine.github.io/
 */
exports.ddescribe = _global.fdescribe;
/**
 * See http://jasmine.github.io/
 */
exports.fdescribe = _global.fdescribe;
/**
 * See http://jasmine.github.io/
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
 * Example:
 *
 * ```
 *   beforeEachProviders(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 * ```
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
            var returnedTestValue = runInTestZone(function () { return testFn.execute(injector); }, done, done.fail);
            if (_isPromiseLike(returnedTestValue)) {
                returnedTestValue.then(null, function (err) { done.fail(err); });
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
 * See http://jasmine.github.io/
 *
 * beforeEach may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
function beforeEach(fn) {
    if (fn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        jsmBeforeEach(function (done) {
            if (!injector) {
                injector = test_injector_1.createTestInjectorWithRuntimeCompiler(testProviders);
            }
            runInTestZone(function () { return fn.execute(injector); }, done, done.fail);
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
 * Wrapper around Jasmine it function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
exports.it = it;
/**
 * Wrapper around Jasmine xit (skipped it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
exports.xit = xit;
/**
 * Wrapper around Jasmine iit (focused it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.iit = iit;
/**
 * Wrapper around Jasmine fit (focused it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
function fit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.fit = fit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwicnVuSW5UZXN0Wm9uZSIsIl9pdCIsImJlZm9yZUVhY2giLCJpdCIsInhpdCIsImlpdCIsImZpdCJdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFDaEQsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFHM0QsOEJBS08saUJBQWlCLENBQUMsQ0FBQTtBQUV6Qiw4QkFBa0MsaUJBQWlCLENBQUM7QUFBNUMsd0NBQU07QUFBRSxrREFBb0M7QUFFcEQseUJBQWlDLFlBQVksQ0FBQztBQUF0QyxtQ0FBc0M7QUFFOUMsSUFBSSxPQUFPLEdBQWdDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxHQUFHLGFBQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUU3Rjs7R0FFRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7R0FFRztBQUNRLGdCQUFRLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUVqRDs7R0FFRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7R0FFRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7R0FFRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQU1uRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdkIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN6QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBRXpCLElBQUksYUFBYSxDQUFDO0FBQ2xCLElBQUksUUFBUSxDQUFDO0FBRWIsNkNBQTZDO0FBQzdDLGFBQWEsQ0FBQztJQUNaLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDbkIsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNsQixDQUFDLENBQUMsQ0FBQztBQUVIOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsNkJBQW9DLEVBQUU7SUFDcENBLGFBQWFBLENBQUNBO1FBQ1pBLElBQUlBLFNBQVNBLEdBQUdBLEVBQUVBLEVBQUVBLENBQUNBO1FBQ3JCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUN2QkEsYUFBYUEsR0FBT0EsYUFBYUEsUUFBS0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDakRBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RCQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSx3REFBd0RBO2dCQUN4REEsOERBQThEQTtnQkFDOURBLGVBQWVBLENBQUNBLENBQUNBO1FBQ25DQSxDQUFDQTtJQUNIQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQTtBQVhlLDJCQUFtQixzQkFXbEMsQ0FBQTtBQUVELHdCQUF3QixLQUFLO0lBQzNCQyxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtBQUNqQ0EsQ0FBQ0E7QUFFRCx1QkFBdUIsV0FBVyxFQUFFLGNBQWMsRUFBRSxZQUFZO0lBQzlEQyxJQUFJQSxpQkFBaUJBLEdBQUdBLENBQUNBLENBQUNBO0lBQzFCQSxJQUFJQSxlQUFlQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUV6QkEsSUFBSUEsVUFBVUEsR0FBVUEsYUFBTUEsQ0FBQ0EsSUFBS0E7U0FDZEEsSUFBSUEsQ0FBQ0E7UUFDSkEsT0FBT0EsRUFBRUEsVUFBU0EsQ0FBQ0EsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDQSxNQUFNQSxFQUFFQSxVQUFTQSxTQUFTQTtZQUN4QixNQUFNLENBQUM7Z0JBQ0wsSUFBSSxDQUFDO29CQUNILE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDMUMsQ0FBQzt3QkFBUyxDQUFDO29CQUNULEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixJQUFJLENBQUMsSUFBSSxlQUFlLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFELGNBQWMsRUFBRSxDQUFDO29CQUNuQixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDLENBQUM7UUFDSixDQUFDO1FBQ0RBLG9CQUFvQkEsRUFBRUEsVUFBU0EsdUJBQXVCQTtZQUNwRCxNQUFNLENBQUMsVUFBUyxFQUFFO2dCQUNoQixpQkFBaUIsRUFBRSxDQUFDO2dCQUNwQixJQUFJLFNBQVMsR0FBRztvQkFDZCxJQUFJLENBQUM7d0JBQ0gsRUFBRSxFQUFFLENBQUM7b0JBQ1AsQ0FBQzs0QkFBUyxDQUFDO3dCQUNULGlCQUFpQixFQUFFLENBQUM7b0JBQ3RCLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDO2dCQUNGLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNEQSxhQUFhQSxFQUFFQSxVQUFTQSxnQkFBZ0JBO1lBQ3RDLE1BQU0sQ0FBQyxVQUFTLEVBQVksRUFBRSxLQUFhO2dCQUFFLGNBQU87cUJBQVAsV0FBTyxDQUFQLHNCQUFPLENBQVAsSUFBTztvQkFBUCw2QkFBTzs7Z0JBQ2xELElBQUksRUFBRSxDQUFDO2dCQUNQLElBQUksRUFBRSxHQUFHO29CQUNQLEVBQUUsRUFBRSxDQUFDO29CQUNMLHdCQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxDQUFDO2dCQUNGLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN2QyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ1osQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNEQSxlQUFlQSxFQUFFQSxVQUFTQSxrQkFBa0JBO1lBQzFDLE1BQU0sQ0FBQyxVQUFTLEVBQVU7Z0JBQ3hCLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN2Qix3QkFBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNGQSxDQUFDQSxDQUFDQTtJQUV4QkEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7QUFDckNBLENBQUNBO0FBRUQsYUFBYSxLQUFlLEVBQUUsSUFBWSxFQUFFLE1BQTJDLEVBQzFFLFdBQW1CO0lBQzlCQyxJQUFJQSxPQUFPQSxHQUFHQSxXQUFXQSxDQUFDQTtJQUUxQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsdUNBQXVCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5Q0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBQ0EsSUFBSUE7WUFDZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2RBLFFBQVFBLEdBQUdBLHFEQUFxQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7WUFDbEVBLENBQUNBO1lBRURBLElBQUlBLGlCQUFpQkEsR0FBR0EsYUFBYUEsQ0FBQ0EsY0FBTUEsT0FBQUEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBeEJBLENBQXdCQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUN2RkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdkJBLGlCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsVUFBQ0EsR0FBR0EsSUFBT0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0VBLENBQUNBO1FBQ0hBLENBQUNBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQ2RBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLDJFQUEyRUE7UUFDM0VBLEtBQUtBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0lBQy9CQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxvQkFBMkIsRUFBdUM7SUFDaEVDLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLFlBQVlBLHVDQUF1QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLDRFQUE0RUE7UUFDNUVBLFFBQVFBO1FBRVJBLGFBQWFBLENBQUNBLFVBQUNBLElBQUlBO1lBQ2pCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDZEEsUUFBUUEsR0FBR0EscURBQXFDQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtZQUNsRUEsQ0FBQ0E7WUFFREEsYUFBYUEsQ0FBQ0EsY0FBTUEsT0FBQUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBcEJBLENBQW9CQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUM3REEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDTkEsMkVBQTJFQTtRQUMzRUEsRUFBRUEsQ0FBQ0EsQ0FBT0EsRUFBR0EsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLGFBQWFBLENBQUNBLGNBQXFCQSxFQUFHQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsYUFBYUEsQ0FBQ0EsVUFBQ0EsSUFBSUEsSUFBcUJBLEVBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hEQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIQSxDQUFDQTtBQXBCZSxrQkFBVSxhQW9CekIsQ0FBQTtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxZQUFtQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN2Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDdkNBLENBQUNBO0FBSGUsVUFBRSxLQUdqQixDQUFBO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILGFBQW9CLElBQVksRUFBRSxFQUF1QyxFQUNyRCxPQUFzQjtJQUF0QkMsdUJBQXNCQSxHQUF0QkEsY0FBc0JBO0lBQ3hDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUN4Q0EsQ0FBQ0E7QUFIZSxXQUFHLE1BR2xCLENBQUE7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsYUFBb0IsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQXNCO0lBQXRCQyx1QkFBc0JBLEdBQXRCQSxjQUFzQkE7SUFDeENBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3hDQSxDQUFDQTtBQUhlLFdBQUcsTUFHbEIsQ0FBQTtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxhQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBQdWJsaWMgVGVzdCBMaWJyYXJ5IGZvciB1bml0IHRlc3RpbmcgQW5ndWxhcjIgQXBwbGljYXRpb25zLiBVc2VzIHRoZVxuICogSmFzbWluZSBmcmFtZXdvcmsuXG4gKi9cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7YmluZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQge1xuICBjcmVhdGVUZXN0SW5qZWN0b3JXaXRoUnVudGltZUNvbXBpbGVyLFxuICBGdW5jdGlvbldpdGhQYXJhbVRva2VucyxcbiAgaW5qZWN0LFxuICBpbmplY3RBc3luY1xufSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2luamVjdCwgaW5qZWN0QXN5bmN9IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7ZXhwZWN0LCBOZ01hdGNoZXJzfSBmcm9tICcuL21hdGNoZXJzJztcblxudmFyIF9nbG9iYWw6IGphc21pbmUuR2xvYmFsUG9sbHV0ZXIgPSA8YW55Pih0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHdpbmRvdyk7XG5cbi8qKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqL1xuZXhwb3J0IHZhciBhZnRlckVhY2g6IEZ1bmN0aW9uID0gX2dsb2JhbC5hZnRlckVhY2g7XG5cbi8qKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqL1xuZXhwb3J0IHZhciBkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmRlc2NyaWJlO1xuXG4vKipcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vXG4gKi9cbmV4cG9ydCB2YXIgZGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vXG4gKi9cbmV4cG9ydCB2YXIgZmRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vXG4gKi9cbmV4cG9ydCB2YXIgeGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwueGRlc2NyaWJlO1xuXG5leHBvcnQgdHlwZSBTeW5jVGVzdEZuID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIEFzeW5jVGVzdEZuID0gKGRvbmU6ICgpID0+IHZvaWQpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBBbnlUZXN0Rm4gPSBTeW5jVGVzdEZuIHwgQXN5bmNUZXN0Rm47XG5cbnZhciBqc21CZWZvcmVFYWNoID0gX2dsb2JhbC5iZWZvcmVFYWNoO1xudmFyIGpzbUl0ID0gX2dsb2JhbC5pdDtcbnZhciBqc21JSXQgPSBfZ2xvYmFsLmZpdDtcbnZhciBqc21YSXQgPSBfZ2xvYmFsLnhpdDtcblxudmFyIHRlc3RQcm92aWRlcnM7XG52YXIgaW5qZWN0b3I7XG5cbi8vIFJlc2V0IHRoZSB0ZXN0IHByb3ZpZGVycyBiZWZvcmUgZWFjaCB0ZXN0LlxuanNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gIHRlc3RQcm92aWRlcnMgPSBbXTtcbiAgaW5qZWN0b3IgPSBudWxsO1xufSk7XG5cbi8qKlxuICogQWxsb3dzIG92ZXJyaWRpbmcgZGVmYXVsdCBwcm92aWRlcnMgb2YgdGhlIHRlc3QgaW5qZWN0b3IsXG4gKiB3aGljaCBhcmUgZGVmaW5lZCBpbiB0ZXN0X2luamVjdG9yLmpzLlxuICpcbiAqIFRoZSBnaXZlbiBmdW5jdGlvbiBtdXN0IHJldHVybiBhIGxpc3Qgb2YgREkgcHJvdmlkZXJzLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiAgIGJlZm9yZUVhY2hQcm92aWRlcnMoKCkgPT4gW1xuICogICAgIGJpbmQoQ29tcGlsZXIpLnRvQ2xhc3MoTW9ja0NvbXBpbGVyKSxcbiAqICAgICBiaW5kKFNvbWVUb2tlbikudG9WYWx1ZShteVZhbHVlKSxcbiAqICAgXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hQcm92aWRlcnMoZm4pOiB2b2lkIHtcbiAganNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdmFyIHByb3ZpZGVycyA9IGZuKCk7XG4gICAgaWYgKCFwcm92aWRlcnMpIHJldHVybjtcbiAgICB0ZXN0UHJvdmlkZXJzID0gWy4uLnRlc3RQcm92aWRlcnMsIC4uLnByb3ZpZGVyc107XG4gICAgaWYgKGluamVjdG9yICE9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlZm9yZUVhY2hQcm92aWRlcnMgd2FzIGNhbGxlZCBhZnRlciB0aGUgaW5qZWN0b3IgaGFkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdiZWVuIHVzZWQgaW4gYSBiZWZvcmVFYWNoIG9yIGl0IGJsb2NrLiBUaGlzIGludmFsaWRhdGVzIHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAndGVzdCBpbmplY3RvcicpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9pc1Byb21pc2VMaWtlKGlucHV0KTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnB1dCAmJiAhIShpbnB1dC50aGVuKTtcbn1cblxuZnVuY3Rpb24gcnVuSW5UZXN0Wm9uZShmblRvRXhlY3V0ZSwgZmluaXNoQ2FsbGJhY2ssIGZhaWxDYWxsYmFjayk6IGFueSB7XG4gIHZhciBwZW5kaW5nTWljcm90YXNrcyA9IDA7XG4gIHZhciBwZW5kaW5nVGltZW91dHMgPSBbXTtcblxuICB2YXIgbmdUZXN0Wm9uZSA9ICg8Wm9uZT5nbG9iYWwuem9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgLmZvcmsoe1xuICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uKGUpIHsgZmFpbENhbGxiYWNrKGUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICckcnVuJzogZnVuY3Rpb24ocGFyZW50UnVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudFJ1bi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwZW5kaW5nTWljcm90YXNrcyA9PSAwICYmIHBlbmRpbmdUaW1lb3V0cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluaXNoQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnJHNjaGVkdWxlTWljcm90YXNrJzogZnVuY3Rpb24ocGFyZW50U2NoZWR1bGVNaWNyb3Rhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihmbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nTWljcm90YXNrcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWljcm90YXNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdNaWNyb3Rhc2tzLS07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRTY2hlZHVsZU1pY3JvdGFzay5jYWxsKHRoaXMsIG1pY3JvdGFzayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyRzZXRUaW1lb3V0JzogZnVuY3Rpb24ocGFyZW50U2V0VGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgLi4uYXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHBlbmRpbmdUaW1lb3V0cywgaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHBhcmVudFNldFRpbWVvdXQoY2IsIGRlbGF5LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1RpbWVvdXRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyRjbGVhclRpbWVvdXQnOiBmdW5jdGlvbihwYXJlbnRDbGVhclRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihpZDogbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudENsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIExpc3RXcmFwcGVyLnJlbW92ZShwZW5kaW5nVGltZW91dHMsIGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgcmV0dXJuIG5nVGVzdFpvbmUucnVuKGZuVG9FeGVjdXRlKTtcbn1cblxuZnVuY3Rpb24gX2l0KGpzbUZuOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nLCB0ZXN0Rm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgIHRlc3RUaW1lT3V0OiBudW1iZXIpOiB2b2lkIHtcbiAgdmFyIHRpbWVPdXQgPSB0ZXN0VGltZU91dDtcblxuICBpZiAodGVzdEZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICBqc21GbihuYW1lLCAoZG9uZSkgPT4ge1xuICAgICAgaWYgKCFpbmplY3Rvcikge1xuICAgICAgICBpbmplY3RvciA9IGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIodGVzdFByb3ZpZGVycyk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZSA9IHJ1bkluVGVzdFpvbmUoKCkgPT4gdGVzdEZuLmV4ZWN1dGUoaW5qZWN0b3IpLCBkb25lLCBkb25lLmZhaWwpO1xuICAgICAgaWYgKF9pc1Byb21pc2VMaWtlKHJldHVybmVkVGVzdFZhbHVlKSkge1xuICAgICAgICAoPFByb21pc2U8YW55Pj5yZXR1cm5lZFRlc3RWYWx1ZSkudGhlbihudWxsLCAoZXJyKSA9PiB7IGRvbmUuZmFpbChlcnIpOyB9KTtcbiAgICAgIH1cbiAgICB9LCB0aW1lT3V0KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCAoZG9uZSkgPT4geyAuLi4gfSkpO2BcbiAgICBqc21GbihuYW1lLCB0ZXN0Rm4sIHRpbWVPdXQpO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBiZWZvcmVFYWNoIGZ1bmN0aW9uLlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqXG4gKiBiZWZvcmVFYWNoIG1heSBiZSB1c2VkIHdpdGggdGhlIGBpbmplY3RgIGZ1bmN0aW9uIHRvIGZldGNoIGRlcGVuZGVuY2llcy5cbiAqIFRoZSB0ZXN0IHdpbGwgYXV0b21hdGljYWxseSB3YWl0IGZvciBhbnkgYXN5bmNocm9ub3VzIGNhbGxzIGluc2lkZSB0aGVcbiAqIGluamVjdGVkIHRlc3QgZnVuY3Rpb24gdG8gY29tcGxldGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmVFYWNoKGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbik6IHZvaWQge1xuICBpZiAoZm4gaW5zdGFuY2VvZiBGdW5jdGlvbldpdGhQYXJhbVRva2Vucykge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgdXNlcyBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goaW5qZWN0KFtDbGFzc0FdLCAoYSkgPT4geyAuLi5cbiAgICAvLyB9KSk7YFxuXG4gICAganNtQmVmb3JlRWFjaCgoZG9uZSkgPT4ge1xuICAgICAgaWYgKCFpbmplY3Rvcikge1xuICAgICAgICBpbmplY3RvciA9IGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIodGVzdFByb3ZpZGVycyk7XG4gICAgICB9XG5cbiAgICAgIHJ1bkluVGVzdFpvbmUoKCkgPT4gZm4uZXhlY3V0ZShpbmplY3RvciksIGRvbmUsIGRvbmUuZmFpbCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gVGhlIHRlc3QgY2FzZSBkb2Vzbid0IHVzZSBpbmplY3QoKS4gaWUgYGJlZm9yZUVhY2goKGRvbmUpID0+IHsgLi4uIH0pKTtgXG4gICAgaWYgKCg8YW55PmZuKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGpzbUJlZm9yZUVhY2goKCkgPT4geyAoPFN5bmNUZXN0Rm4+Zm4pKCk7IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBqc21CZWZvcmVFYWNoKChkb25lKSA9PiB7ICg8QXN5bmNUZXN0Rm4+Zm4pKGRvbmUpOyB9KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGl0IGZ1bmN0aW9uLlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqXG4gKiBpdCBtYXkgYmUgdXNlZCB3aXRoIHRoZSBgaW5qZWN0YCBmdW5jdGlvbiB0byBmZXRjaCBkZXBlbmRlbmNpZXMuXG4gKiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxscyBpbnNpZGUgdGhlXG4gKiBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSB4aXQgKHNraXBwZWQgaXQpIGZ1bmN0aW9uLlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqXG4gKiBpdCBtYXkgYmUgdXNlZCB3aXRoIHRoZSBgaW5qZWN0YCBmdW5jdGlvbiB0byBmZXRjaCBkZXBlbmRlbmNpZXMuXG4gKiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxscyBpbnNpZGUgdGhlXG4gKiBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24geGl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtWEl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBpaXQgKGZvY3VzZWQgaXQpIGZ1bmN0aW9uLlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqXG4gKiBpdCBtYXkgYmUgdXNlZCB3aXRoIHRoZSBgaW5qZWN0YCBmdW5jdGlvbiB0byBmZXRjaCBkZXBlbmRlbmNpZXMuXG4gKiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxscyBpbnNpZGUgdGhlXG4gKiBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBmaXQgKGZvY3VzZWQgaXQpIGZ1bmN0aW9uLlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby9cbiAqXG4gKiBpdCBtYXkgYmUgdXNlZCB3aXRoIHRoZSBgaW5qZWN0YCBmdW5jdGlvbiB0byBmZXRjaCBkZXBlbmRlbmNpZXMuXG4gKiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxscyBpbnNpZGUgdGhlXG4gKiBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG4iXX0=