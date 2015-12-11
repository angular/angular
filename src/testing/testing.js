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
 * {@example testing/ts/testing.ts region='it'}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwicnVuSW5UZXN0Wm9uZSIsIl9pdCIsImJlZm9yZUVhY2giLCJpdCIsInhpdCIsImlpdCIsImZpdCJdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gscUJBQXFCLDBCQUEwQixDQUFDLENBQUE7QUFDaEQsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFHM0QsOEJBS08saUJBQWlCLENBQUMsQ0FBQTtBQUV6Qiw4QkFBa0MsaUJBQWlCLENBQUM7QUFBNUMsd0NBQU07QUFBRSxrREFBb0M7QUFFcEQseUJBQWlDLFlBQVksQ0FBQztBQUF0QyxtQ0FBc0M7QUFFOUMsSUFBSSxPQUFPLEdBQWdDLENBQUMsT0FBTyxNQUFNLEtBQUssV0FBVyxHQUFHLGFBQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztBQUU3Rjs7Ozs7Ozs7R0FRRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7R0FRRztBQUNRLGdCQUFRLEdBQWEsT0FBTyxDQUFDLFFBQVEsQ0FBQztBQUVqRDs7R0FFRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7O0dBU0c7QUFDUSxpQkFBUyxHQUFhLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFFbkQ7Ozs7Ozs7Ozs7R0FVRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQU1uRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdkIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN6QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FB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RUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBQdWJsaWMgVGVzdCBMaWJyYXJ5IGZvciB1bml0IHRlc3RpbmcgQW5ndWxhcjIgQXBwbGljYXRpb25zLiBVc2VzIHRoZVxuICogSmFzbWluZSBmcmFtZXdvcmsuXG4gKi9cbmltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7YmluZH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7XG4gIGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIsXG4gIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zLFxuICBpbmplY3QsXG4gIGluamVjdEFzeW5jXG59IGZyb20gJy4vdGVzdF9pbmplY3Rvcic7XG5cbmV4cG9ydCB7aW5qZWN0LCBpbmplY3RBc3luY30gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtleHBlY3QsIE5nTWF0Y2hlcnN9IGZyb20gJy4vbWF0Y2hlcnMnO1xuXG52YXIgX2dsb2JhbDogamFzbWluZS5HbG9iYWxQb2xsdXRlciA9IDxhbnk+KHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93KTtcblxuLyoqXG4gKiBSdW4gYSBmdW5jdGlvbiAod2l0aCBhbiBvcHRpb25hbCBhc3luY2hyb25vdXMgY2FsbGJhY2spIGFmdGVyIGVhY2ggdGVzdCBjYXNlLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nYWZ0ZXJFYWNoJ31cbiAqL1xuZXhwb3J0IHZhciBhZnRlckVhY2g6IEZ1bmN0aW9uID0gX2dsb2JhbC5hZnRlckVhY2g7XG5cbi8qKlxuICogR3JvdXAgdGVzdCBjYXNlcyB0b2dldGhlciB1bmRlciBhIGNvbW1vbiBkZXNjcmlwdGlvbiBwcmVmaXguXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdkZXNjcmliZUl0J31cbiAqL1xuZXhwb3J0IHZhciBkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmRlc2NyaWJlO1xuXG4vKipcbiAqIFNlZSB7QGxpbmsgZmRlc2NyaWJlfS5cbiAqL1xuZXhwb3J0IHZhciBkZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5mZGVzY3JpYmU7XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgZGVzY3JpYmV9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBvbmx5IHJ1blxuICogdGhlIHRlc3QgY2FzZXMgaW4gdGhpcyBncm91cC4gVGhpcyBpcyB1c2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2ZkZXNjcmliZSd9XG4gKi9cbmV4cG9ydCB2YXIgZmRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZmRlc2NyaWJlO1xuXG4vKipcbiAqIExpa2Uge0BsaW5rIGRlc2NyaWJlfSwgYnV0IGluc3RydWN0cyB0aGUgdGVzdCBydW5uZXIgdG8gZXhjbHVkZVxuICogdGhpcyBncm91cCBvZiB0ZXN0IGNhc2VzIGZyb20gZXhlY3V0aW9uLiBUaGlzIGlzIHVzZWZ1bCBmb3JcbiAqIGRlYnVnZ2luZywgb3IgZm9yIGV4Y2x1ZGluZyBicm9rZW4gdGVzdHMgdW50aWwgdGhleSBjYW4gYmUgZml4ZWQuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSd4ZGVzY3JpYmUnfVxuICovXG5leHBvcnQgdmFyIHhkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLnhkZXNjcmliZTtcblxuZXhwb3J0IHR5cGUgU3luY1Rlc3RGbiA9ICgpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBBc3luY1Rlc3RGbiA9IChkb25lOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgQW55VGVzdEZuID0gU3luY1Rlc3RGbiB8IEFzeW5jVGVzdEZuO1xuXG52YXIganNtQmVmb3JlRWFjaCA9IF9nbG9iYWwuYmVmb3JlRWFjaDtcbnZhciBqc21JdCA9IF9nbG9iYWwuaXQ7XG52YXIganNtSUl0ID0gX2dsb2JhbC5maXQ7XG52YXIganNtWEl0ID0gX2dsb2JhbC54aXQ7XG5cbnZhciB0ZXN0UHJvdmlkZXJzO1xudmFyIGluamVjdG9yO1xuXG4vLyBSZXNldCB0aGUgdGVzdCBwcm92aWRlcnMgYmVmb3JlIGVhY2ggdGVzdC5cbmpzbUJlZm9yZUVhY2goKCkgPT4ge1xuICB0ZXN0UHJvdmlkZXJzID0gW107XG4gIGluamVjdG9yID0gbnVsbDtcbn0pO1xuXG4vKipcbiAqIEFsbG93cyBvdmVycmlkaW5nIGRlZmF1bHQgcHJvdmlkZXJzIG9mIHRoZSB0ZXN0IGluamVjdG9yLFxuICogd2hpY2ggYXJlIGRlZmluZWQgaW4gdGVzdF9pbmplY3Rvci5qcy5cbiAqXG4gKiBUaGUgZ2l2ZW4gZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBsaXN0IG9mIERJIHByb3ZpZGVycy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdiZWZvcmVFYWNoUHJvdmlkZXJzJ31cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZUVhY2hQcm92aWRlcnMoZm4pOiB2b2lkIHtcbiAganNtQmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgdmFyIHByb3ZpZGVycyA9IGZuKCk7XG4gICAgaWYgKCFwcm92aWRlcnMpIHJldHVybjtcbiAgICB0ZXN0UHJvdmlkZXJzID0gWy4uLnRlc3RQcm92aWRlcnMsIC4uLnByb3ZpZGVyc107XG4gICAgaWYgKGluamVjdG9yICE9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlZm9yZUVhY2hQcm92aWRlcnMgd2FzIGNhbGxlZCBhZnRlciB0aGUgaW5qZWN0b3IgaGFkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdiZWVuIHVzZWQgaW4gYSBiZWZvcmVFYWNoIG9yIGl0IGJsb2NrLiBUaGlzIGludmFsaWRhdGVzIHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAndGVzdCBpbmplY3RvcicpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9pc1Byb21pc2VMaWtlKGlucHV0KTogYm9vbGVhbiB7XG4gIHJldHVybiBpbnB1dCAmJiAhIShpbnB1dC50aGVuKTtcbn1cblxuZnVuY3Rpb24gcnVuSW5UZXN0Wm9uZShmblRvRXhlY3V0ZSwgZmluaXNoQ2FsbGJhY2ssIGZhaWxDYWxsYmFjayk6IGFueSB7XG4gIHZhciBwZW5kaW5nTWljcm90YXNrcyA9IDA7XG4gIHZhciBwZW5kaW5nVGltZW91dHMgPSBbXTtcblxuICB2YXIgbmdUZXN0Wm9uZSA9ICg8Wm9uZT5nbG9iYWwuem9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgLmZvcmsoe1xuICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uKGUpIHsgZmFpbENhbGxiYWNrKGUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICckcnVuJzogZnVuY3Rpb24ocGFyZW50UnVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudFJ1bi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwZW5kaW5nTWljcm90YXNrcyA9PSAwICYmIHBlbmRpbmdUaW1lb3V0cy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluaXNoQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnJHNjaGVkdWxlTWljcm90YXNrJzogZnVuY3Rpb24ocGFyZW50U2NoZWR1bGVNaWNyb3Rhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihmbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nTWljcm90YXNrcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWljcm90YXNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdNaWNyb3Rhc2tzLS07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRTY2hlZHVsZU1pY3JvdGFzay5jYWxsKHRoaXMsIG1pY3JvdGFzayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyRzZXRUaW1lb3V0JzogZnVuY3Rpb24ocGFyZW50U2V0VGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgLi4uYXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTGlzdFdyYXBwZXIucmVtb3ZlKHBlbmRpbmdUaW1lb3V0cywgaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZCA9IHBhcmVudFNldFRpbWVvdXQoY2IsIGRlbGF5LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVuZGluZ1RpbWVvdXRzLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyRjbGVhclRpbWVvdXQnOiBmdW5jdGlvbihwYXJlbnRDbGVhclRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihpZDogbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudENsZWFyVGltZW91dChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIExpc3RXcmFwcGVyLnJlbW92ZShwZW5kaW5nVGltZW91dHMsIGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgcmV0dXJuIG5nVGVzdFpvbmUucnVuKGZuVG9FeGVjdXRlKTtcbn1cblxuZnVuY3Rpb24gX2l0KGpzbUZuOiBGdW5jdGlvbiwgbmFtZTogc3RyaW5nLCB0ZXN0Rm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgIHRlc3RUaW1lT3V0OiBudW1iZXIpOiB2b2lkIHtcbiAgdmFyIHRpbWVPdXQgPSB0ZXN0VGltZU91dDtcblxuICBpZiAodGVzdEZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICBqc21GbihuYW1lLCAoZG9uZSkgPT4ge1xuICAgICAgaWYgKCFpbmplY3Rvcikge1xuICAgICAgICBpbmplY3RvciA9IGNyZWF0ZVRlc3RJbmplY3RvcldpdGhSdW50aW1lQ29tcGlsZXIodGVzdFByb3ZpZGVycyk7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZSA9IHJ1bkluVGVzdFpvbmUoKCkgPT4gdGVzdEZuLmV4ZWN1dGUoaW5qZWN0b3IpLCBkb25lLCBkb25lLmZhaWwpO1xuICAgICAgaWYgKF9pc1Byb21pc2VMaWtlKHJldHVybmVkVGVzdFZhbHVlKSkge1xuICAgICAgICAoPFByb21pc2U8YW55Pj5yZXR1cm5lZFRlc3RWYWx1ZSkudGhlbihudWxsLCAoZXJyKSA9PiB7IGRvbmUuZmFpbChlcnIpOyB9KTtcbiAgICAgIH1cbiAgICB9LCB0aW1lT3V0KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCAoZG9uZSkgPT4geyAuLi4gfSkpO2BcbiAgICBqc21GbihuYW1lLCB0ZXN0Rm4sIHRpbWVPdXQpO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBiZWZvcmVFYWNoIGZ1bmN0aW9uLlxuICpcbiAqIGJlZm9yZUVhY2ggbWF5IGJlIHVzZWQgd2l0aCB0aGUgYGluamVjdGAgZnVuY3Rpb24gdG8gZmV0Y2ggZGVwZW5kZW5jaWVzLlxuICogVGhlIHRlc3Qgd2lsbCBhdXRvbWF0aWNhbGx5IHdhaXQgZm9yIGFueSBhc3luY2hyb25vdXMgY2FsbHMgaW5zaWRlIHRoZVxuICogaW5qZWN0ZWQgdGVzdCBmdW5jdGlvbiB0byBjb21wbGV0ZS5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2JlZm9yZUVhY2gnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaChmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4pOiB2b2lkIHtcbiAgaWYgKGZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIHVzZXMgaW5qZWN0KCkuIGllIGBiZWZvcmVFYWNoKGluamVjdChbQ2xhc3NBXSwgKGEpID0+IHsgLi4uXG4gICAgLy8gfSkpO2BcblxuICAgIGpzbUJlZm9yZUVhY2goKGRvbmUpID0+IHtcbiAgICAgIGlmICghaW5qZWN0b3IpIHtcbiAgICAgICAgaW5qZWN0b3IgPSBjcmVhdGVUZXN0SW5qZWN0b3JXaXRoUnVudGltZUNvbXBpbGVyKHRlc3RQcm92aWRlcnMpO1xuICAgICAgfVxuXG4gICAgICBydW5JblRlc3Rab25lKCgpID0+IGZuLmV4ZWN1dGUoaW5qZWN0b3IpLCBkb25lLCBkb25lLmZhaWwpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgZG9lc24ndCB1c2UgaW5qZWN0KCkuIGllIGBiZWZvcmVFYWNoKChkb25lKSA9PiB7IC4uLiB9KSk7YFxuICAgIGlmICgoPGFueT5mbikubGVuZ3RoID09PSAwKSB7XG4gICAgICBqc21CZWZvcmVFYWNoKCgpID0+IHsgKDxTeW5jVGVzdEZuPmZuKSgpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAganNtQmVmb3JlRWFjaCgoZG9uZSkgPT4geyAoPEFzeW5jVGVzdEZuPmZuKShkb25lKTsgfSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGVmaW5lIGEgc2luZ2xlIHRlc3QgY2FzZSB3aXRoIHRoZSBnaXZlbiB0ZXN0IG5hbWUgYW5kIGV4ZWN1dGlvbiBmdW5jdGlvbi5cbiAqXG4gKiBUaGUgdGVzdCBmdW5jdGlvbiBjYW4gYmUgZWl0aGVyIGEgc3luY2hyb25vdXMgZnVuY3Rpb24sIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvblxuICogdGhhdCB0YWtlcyBhIGNvbXBsZXRpb24gY2FsbGJhY2ssIG9yIGFuIGluamVjdGVkIGZ1bmN0aW9uIGNyZWF0ZWQgdmlhIHtAbGluayBpbmplY3R9XG4gKiBvciB7QGxpbmsgaW5qZWN0QXN5bmN9LiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxsc1xuICogaW5zaWRlIHRoZSBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgaXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0naXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgdGltZU91dDogbnVtYmVyID0gbnVsbCk6IHZvaWQge1xuICByZXR1cm4gX2l0KGpzbUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgaXR9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBleGNsdWRlIHRoaXMgdGVzdFxuICogZW50aXJlbHkuIFVzZWZ1bCBmb3IgZGVidWdnaW5nIG9yIGZvciBleGNsdWRpbmcgYnJva2VuIHRlc3RzIHVudGlsXG4gKiB0aGV5IGNhbiBiZSBmaXhlZC5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIHhpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSd4aXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24geGl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtWEl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogU2VlIHtAbGluayBmaXR9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaWl0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgaXR9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBvbmx5IHJ1biB0aGlzIHRlc3QuXG4gKiBVc2VmdWwgZm9yIGRlYnVnZ2luZy5cbiAqXG4gKiBXcmFwcGVyIGFyb3VuZCBKYXNtaW5lIGZpdCBmdW5jdGlvbi4gU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdmaXQnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0KG5hbWU6IHN0cmluZywgZm46IEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zIHwgQW55VGVzdEZuLFxuICAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSUl0LCBuYW1lLCBmbiwgdGltZU91dCk7XG59XG4iXX0=