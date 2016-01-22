'use strict';/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
var lang_1 = require('angular2/src/facade/lang');
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
var testInjector = test_injector_1.getTestInjector();
// Reset the test providers before each test.
jsmBeforeEach(function () { testInjector.reset(); });
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
exports.beforeEachProviders = beforeEachProviders;
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
        jsmFn(name, function (done) {
            var returnedTestValue;
            try {
                returnedTestValue = testInjector.execute(testFn);
            }
            catch (err) {
                done.fail(err);
                return;
            }
            if (testFn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(function () { done(); }, function (err) { done.fail(err); });
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
                done();
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
            var returnedTestValue;
            try {
                returnedTestValue = testInjector.execute(fn);
            }
            catch (err) {
                done.fail(err);
                return;
            }
            if (fn.isAsync) {
                if (_isPromiseLike(returnedTestValue)) {
                    returnedTestValue.then(function () { done(); }, function (err) { done.fail(err); });
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
                done();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RpbmcudHMiXSwibmFtZXMiOlsiYmVmb3JlRWFjaFByb3ZpZGVycyIsIl9pc1Byb21pc2VMaWtlIiwiX2l0IiwiYmVmb3JlRWFjaCIsIml0IiwieGl0IiwiaWl0IiwiZml0Il0sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSCxxQkFBcUIsMEJBQTBCLENBQUMsQ0FBQTtBQUloRCw4QkFNTyxpQkFBaUIsQ0FBQyxDQUFBO0FBRXpCLDhCQUFrQyxpQkFBaUIsQ0FBQztBQUE1Qyx3Q0FBTTtBQUFFLGtEQUFvQztBQUVwRCx5QkFBaUMsWUFBWSxDQUFDO0FBQXRDLG1DQUFzQztBQUU5QyxJQUFJLE9BQU8sR0FBZ0MsQ0FBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUcsYUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBRTdGOzs7Ozs7OztHQVFHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7OztHQVFHO0FBQ1EsZ0JBQVEsR0FBYSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBRWpEOztHQUVHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBRW5EOzs7Ozs7Ozs7R0FTRztBQUNRLGlCQUFTLEdBQWEsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUVuRDs7Ozs7Ozs7OztHQVVHO0FBQ1EsaUJBQVMsR0FBYSxPQUFPLENBQUMsU0FBUyxDQUFDO0FBa0JuRCxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7QUFDdkIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztBQUN6QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBRXpCLElBQUksWUFBWSxHQUFpQiwrQkFBZSxFQUFFLENBQUM7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Q0FBQTtBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxhQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBO0FBRUQ7O0dBRUc7QUFDSCxhQUFvQixJQUFZLEVBQUUsRUFBdUMsRUFDckQsT0FBc0I7SUFBdEJDLHVCQUFzQkEsR0FBdEJBLGNBQXNCQTtJQUN4Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDeENBLENBQUNBO0FBSGUsV0FBRyxNQUdsQixDQUFBO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsYUFBb0IsSUFBWSxFQUFFLEVBQXVDLEVBQ3JELE9BQXNCO0lBQXRCQyx1QkFBc0JBLEdBQXRCQSxjQUFzQkE7SUFDeENBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLEVBQUVBLEVBQUVBLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3hDQSxDQUFDQTtBQUhlLFdBQUcsTUFHbEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUHVibGljIFRlc3QgTGlicmFyeSBmb3IgdW5pdCB0ZXN0aW5nIEFuZ3VsYXIyIEFwcGxpY2F0aW9ucy4gVXNlcyB0aGVcbiAqIEphc21pbmUgZnJhbWV3b3JrLlxuICovXG5pbXBvcnQge2dsb2JhbH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge2JpbmR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBGdW5jdGlvbldpdGhQYXJhbVRva2VucyxcbiAgaW5qZWN0LFxuICBpbmplY3RBc3luYyxcbiAgVGVzdEluamVjdG9yLFxuICBnZXRUZXN0SW5qZWN0b3Jcbn0gZnJvbSAnLi90ZXN0X2luamVjdG9yJztcblxuZXhwb3J0IHtpbmplY3QsIGluamVjdEFzeW5jfSBmcm9tICcuL3Rlc3RfaW5qZWN0b3InO1xuXG5leHBvcnQge2V4cGVjdCwgTmdNYXRjaGVyc30gZnJvbSAnLi9tYXRjaGVycyc7XG5cbnZhciBfZ2xvYmFsOiBqYXNtaW5lLkdsb2JhbFBvbGx1dGVyID0gPGFueT4odHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3cpO1xuXG4vKipcbiAqIFJ1biBhIGZ1bmN0aW9uICh3aXRoIGFuIG9wdGlvbmFsIGFzeW5jaHJvbm91cyBjYWxsYmFjaykgYWZ0ZXIgZWFjaCB0ZXN0IGNhc2UuXG4gKlxuICogU2VlIGh0dHA6Ly9qYXNtaW5lLmdpdGh1Yi5pby8gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiAjIyBFeGFtcGxlOlxuICpcbiAqIHtAZXhhbXBsZSB0ZXN0aW5nL3RzL3Rlc3RpbmcudHMgcmVnaW9uPSdhZnRlckVhY2gnfVxuICovXG5leHBvcnQgdmFyIGFmdGVyRWFjaDogRnVuY3Rpb24gPSBfZ2xvYmFsLmFmdGVyRWFjaDtcblxuLyoqXG4gKiBHcm91cCB0ZXN0IGNhc2VzIHRvZ2V0aGVyIHVuZGVyIGEgY29tbW9uIGRlc2NyaXB0aW9uIHByZWZpeC5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2Rlc2NyaWJlSXQnfVxuICovXG5leHBvcnQgdmFyIGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwuZGVzY3JpYmU7XG5cbi8qKlxuICogU2VlIHtAbGluayBmZGVzY3JpYmV9LlxuICovXG5leHBvcnQgdmFyIGRkZXNjcmliZTogRnVuY3Rpb24gPSBfZ2xvYmFsLmZkZXNjcmliZTtcblxuLyoqXG4gKiBMaWtlIHtAbGluayBkZXNjcmliZX0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIG9ubHkgcnVuXG4gKiB0aGUgdGVzdCBjYXNlcyBpbiB0aGlzIGdyb3VwLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZmRlc2NyaWJlJ31cbiAqL1xuZXhwb3J0IHZhciBmZGVzY3JpYmU6IEZ1bmN0aW9uID0gX2dsb2JhbC5mZGVzY3JpYmU7XG5cbi8qKlxuICogTGlrZSB7QGxpbmsgZGVzY3JpYmV9LCBidXQgaW5zdHJ1Y3RzIHRoZSB0ZXN0IHJ1bm5lciB0byBleGNsdWRlXG4gKiB0aGlzIGdyb3VwIG9mIHRlc3QgY2FzZXMgZnJvbSBleGVjdXRpb24uIFRoaXMgaXMgdXNlZnVsIGZvclxuICogZGVidWdnaW5nLCBvciBmb3IgZXhjbHVkaW5nIGJyb2tlbiB0ZXN0cyB1bnRpbCB0aGV5IGNhbiBiZSBmaXhlZC5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J3hkZXNjcmliZSd9XG4gKi9cbmV4cG9ydCB2YXIgeGRlc2NyaWJlOiBGdW5jdGlvbiA9IF9nbG9iYWwueGRlc2NyaWJlO1xuXG4vKipcbiAqIFNpZ25hdHVyZSBmb3IgYSBzeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIChubyBhcmd1bWVudHMpLlxuICovXG5leHBvcnQgdHlwZSBTeW5jVGVzdEZuID0gKCkgPT4gdm9pZDtcblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGFuIGFzeW5jaHJvbm91cyB0ZXN0IGZ1bmN0aW9uIHdoaWNoIHRha2VzIGFcbiAqIGBkb25lYCBjYWxsYmFjay5cbiAqL1xuZXhwb3J0IHR5cGUgQXN5bmNUZXN0Rm4gPSAoZG9uZTogKCkgPT4gdm9pZCkgPT4gdm9pZDtcblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGFueSBzaW1wbGUgdGVzdGluZyBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgQW55VGVzdEZuID0gU3luY1Rlc3RGbiB8IEFzeW5jVGVzdEZuO1xuXG52YXIganNtQmVmb3JlRWFjaCA9IF9nbG9iYWwuYmVmb3JlRWFjaDtcbnZhciBqc21JdCA9IF9nbG9iYWwuaXQ7XG52YXIganNtSUl0ID0gX2dsb2JhbC5maXQ7XG52YXIganNtWEl0ID0gX2dsb2JhbC54aXQ7XG5cbnZhciB0ZXN0SW5qZWN0b3I6IFRlc3RJbmplY3RvciA9IGdldFRlc3RJbmplY3RvcigpO1xuXG4vLyBSZXNldCB0aGUgdGVzdCBwcm92aWRlcnMgYmVmb3JlIGVhY2ggdGVzdC5cbmpzbUJlZm9yZUVhY2goKCkgPT4geyB0ZXN0SW5qZWN0b3IucmVzZXQoKTsgfSk7XG5cbi8qKlxuICogQWxsb3dzIG92ZXJyaWRpbmcgZGVmYXVsdCBwcm92aWRlcnMgb2YgdGhlIHRlc3QgaW5qZWN0b3IsXG4gKiB3aGljaCBhcmUgZGVmaW5lZCBpbiB0ZXN0X2luamVjdG9yLmpzLlxuICpcbiAqIFRoZSBnaXZlbiBmdW5jdGlvbiBtdXN0IHJldHVybiBhIGxpc3Qgb2YgREkgcHJvdmlkZXJzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2JlZm9yZUVhY2hQcm92aWRlcnMnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaFByb3ZpZGVycyhmbik6IHZvaWQge1xuICBqc21CZWZvcmVFYWNoKCgpID0+IHtcbiAgICB2YXIgcHJvdmlkZXJzID0gZm4oKTtcbiAgICBpZiAoIXByb3ZpZGVycykgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICB0ZXN0SW5qZWN0b3IuYWRkUHJvdmlkZXJzKHByb3ZpZGVycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdiZWZvcmVFYWNoUHJvdmlkZXJzIHdhcyBjYWxsZWQgYWZ0ZXIgdGhlIGluamVjdG9yIGhhZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnYmVlbiB1c2VkIGluIGEgYmVmb3JlRWFjaCBvciBpdCBibG9jay4gVGhpcyBpbnZhbGlkYXRlcyB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ3Rlc3QgaW5qZWN0b3InKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfaXNQcm9taXNlTGlrZShpbnB1dCk6IGJvb2xlYW4ge1xuICByZXR1cm4gaW5wdXQgJiYgISEoaW5wdXQudGhlbik7XG59XG5cbmZ1bmN0aW9uIF9pdChqc21GbjogRnVuY3Rpb24sIG5hbWU6IHN0cmluZywgdGVzdEZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICB0ZXN0VGltZU91dDogbnVtYmVyKTogdm9pZCB7XG4gIHZhciB0aW1lT3V0ID0gdGVzdFRpbWVPdXQ7XG5cbiAgaWYgKHRlc3RGbiBpbnN0YW5jZW9mIEZ1bmN0aW9uV2l0aFBhcmFtVG9rZW5zKSB7XG4gICAganNtRm4obmFtZSwgKGRvbmUpID0+IHtcbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybmVkVGVzdFZhbHVlID0gdGVzdEluamVjdG9yLmV4ZWN1dGUodGVzdEZuKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBkb25lLmZhaWwoZXJyKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodGVzdEZuLmlzQXN5bmMpIHtcbiAgICAgICAgaWYgKF9pc1Byb21pc2VMaWtlKHJldHVybmVkVGVzdFZhbHVlKSkge1xuICAgICAgICAgICg8UHJvbWlzZTxhbnk+PnJldHVybmVkVGVzdFZhbHVlKS50aGVuKCgpID0+IHsgZG9uZSgpOyB9LCAoZXJyKSA9PiB7IGRvbmUuZmFpbChlcnIpOyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3RBc3luYyB3YXMgZXhwZWN0ZWQgdG8gcmV0dXJuIGEgcHJvbWlzZSwgYnV0IHRoZSAnICtcbiAgICAgICAgICAgICAgICAgICAgJyByZXR1cm5lZCB2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghKHJldHVybmVkVGVzdFZhbHVlID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgZG9uZS5mYWlsKCdFcnJvcjogaW5qZWN0IHJldHVybmVkIGEgdmFsdWUuIERpZCB5b3UgbWVhbiB0byB1c2UgaW5qZWN0QXN5bmM/IFJldHVybmVkICcgK1xuICAgICAgICAgICAgICAgICAgICAndmFsdWUgd2FzOiAnICsgcmV0dXJuZWRUZXN0VmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH1cbiAgICB9LCB0aW1lT3V0KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIGRvZXNuJ3QgdXNlIGluamVjdCgpLiBpZSBgaXQoJ3Rlc3QnLCAoZG9uZSkgPT4geyAuLi4gfSkpO2BcbiAgICBqc21GbihuYW1lLCB0ZXN0Rm4sIHRpbWVPdXQpO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgSmFzbWluZSBiZWZvcmVFYWNoIGZ1bmN0aW9uLlxuICpcbiAqIGJlZm9yZUVhY2ggbWF5IGJlIHVzZWQgd2l0aCB0aGUgYGluamVjdGAgZnVuY3Rpb24gdG8gZmV0Y2ggZGVwZW5kZW5jaWVzLlxuICogVGhlIHRlc3Qgd2lsbCBhdXRvbWF0aWNhbGx5IHdhaXQgZm9yIGFueSBhc3luY2hyb25vdXMgY2FsbHMgaW5zaWRlIHRoZVxuICogaW5qZWN0ZWQgdGVzdCBmdW5jdGlvbiB0byBjb21wbGV0ZS5cbiAqXG4gKiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2JlZm9yZUVhY2gnfVxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaChmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4pOiB2b2lkIHtcbiAgaWYgKGZuIGluc3RhbmNlb2YgRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMpIHtcbiAgICAvLyBUaGUgdGVzdCBjYXNlIHVzZXMgaW5qZWN0KCkuIGllIGBiZWZvcmVFYWNoKGluamVjdChbQ2xhc3NBXSwgKGEpID0+IHsgLi4uXG4gICAgLy8gfSkpO2BcbiAgICBqc21CZWZvcmVFYWNoKChkb25lKSA9PiB7XG5cbiAgICAgIHZhciByZXR1cm5lZFRlc3RWYWx1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybmVkVGVzdFZhbHVlID0gdGVzdEluamVjdG9yLmV4ZWN1dGUoZm4pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGRvbmUuZmFpbChlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoZm4uaXNBc3luYykge1xuICAgICAgICBpZiAoX2lzUHJvbWlzZUxpa2UocmV0dXJuZWRUZXN0VmFsdWUpKSB7XG4gICAgICAgICAgKDxQcm9taXNlPGFueT4+cmV0dXJuZWRUZXN0VmFsdWUpLnRoZW4oKCkgPT4geyBkb25lKCk7IH0sIChlcnIpID0+IHsgZG9uZS5mYWlsKGVycik7IH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvbmUuZmFpbCgnRXJyb3I6IGluamVjdEFzeW5jIHdhcyBleHBlY3RlZCB0byByZXR1cm4gYSBwcm9taXNlLCBidXQgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAnIHJldHVybmVkIHZhbHVlIHdhczogJyArIHJldHVybmVkVGVzdFZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCEocmV0dXJuZWRUZXN0VmFsdWUgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICBkb25lLmZhaWwoJ0Vycm9yOiBpbmplY3QgcmV0dXJuZWQgYSB2YWx1ZS4gRGlkIHlvdSBtZWFuIHRvIHVzZSBpbmplY3RBc3luYz8gUmV0dXJuZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZSB3YXM6ICcgKyByZXR1cm5lZFRlc3RWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZSB0ZXN0IGNhc2UgZG9lc24ndCB1c2UgaW5qZWN0KCkuIGllIGBiZWZvcmVFYWNoKChkb25lKSA9PiB7IC4uLiB9KSk7YFxuICAgIGlmICgoPGFueT5mbikubGVuZ3RoID09PSAwKSB7XG4gICAgICBqc21CZWZvcmVFYWNoKCgpID0+IHsgKDxTeW5jVGVzdEZuPmZuKSgpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAganNtQmVmb3JlRWFjaCgoZG9uZSkgPT4geyAoPEFzeW5jVGVzdEZuPmZuKShkb25lKTsgfSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGVmaW5lIGEgc2luZ2xlIHRlc3QgY2FzZSB3aXRoIHRoZSBnaXZlbiB0ZXN0IG5hbWUgYW5kIGV4ZWN1dGlvbiBmdW5jdGlvbi5cbiAqXG4gKiBUaGUgdGVzdCBmdW5jdGlvbiBjYW4gYmUgZWl0aGVyIGEgc3luY2hyb25vdXMgZnVuY3Rpb24sIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvblxuICogdGhhdCB0YWtlcyBhIGNvbXBsZXRpb24gY2FsbGJhY2ssIG9yIGFuIGluamVjdGVkIGZ1bmN0aW9uIGNyZWF0ZWQgdmlhIHtAbGluayBpbmplY3R9XG4gKiBvciB7QGxpbmsgaW5qZWN0QXN5bmN9LiBUaGUgdGVzdCB3aWxsIGF1dG9tYXRpY2FsbHkgd2FpdCBmb3IgYW55IGFzeW5jaHJvbm91cyBjYWxsc1xuICogaW5zaWRlIHRoZSBpbmplY3RlZCB0ZXN0IGZ1bmN0aW9uIHRvIGNvbXBsZXRlLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgaXQgZnVuY3Rpb24uIFNlZSBodHRwOi8vamFzbWluZS5naXRodWIuaW8vIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogIyMgRXhhbXBsZTpcbiAqXG4gKiB7QGV4YW1wbGUgdGVzdGluZy90cy90ZXN0aW5nLnRzIHJlZ2lvbj0nZGVzY3JpYmVJdCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpdChuYW1lOiBzdHJpbmcsIGZuOiBGdW5jdGlvbldpdGhQYXJhbVRva2VucyB8IEFueVRlc3RGbixcbiAgICAgICAgICAgICAgICAgICB0aW1lT3V0OiBudW1iZXIgPSBudWxsKTogdm9pZCB7XG4gIHJldHVybiBfaXQoanNtSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuLyoqXG4gKiBMaWtlIHtAbGluayBpdH0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIGV4Y2x1ZGUgdGhpcyB0ZXN0XG4gKiBlbnRpcmVseS4gVXNlZnVsIGZvciBkZWJ1Z2dpbmcgb3IgZm9yIGV4Y2x1ZGluZyBicm9rZW4gdGVzdHMgdW50aWxcbiAqIHRoZXkgY2FuIGJlIGZpeGVkLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgeGl0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J3hpdCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4aXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21YSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuLyoqXG4gKiBTZWUge0BsaW5rIGZpdH0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cblxuLyoqXG4gKiBMaWtlIHtAbGluayBpdH0sIGJ1dCBpbnN0cnVjdHMgdGhlIHRlc3QgcnVubmVyIHRvIG9ubHkgcnVuIHRoaXMgdGVzdC5cbiAqIFVzZWZ1bCBmb3IgZGVidWdnaW5nLlxuICpcbiAqIFdyYXBwZXIgYXJvdW5kIEphc21pbmUgZml0IGZ1bmN0aW9uLiBTZWUgaHR0cDovL2phc21pbmUuZ2l0aHViLmlvLyBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqICMjIEV4YW1wbGU6XG4gKlxuICoge0BleGFtcGxlIHRlc3RpbmcvdHMvdGVzdGluZy50cyByZWdpb249J2ZpdCd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXQobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb25XaXRoUGFyYW1Ub2tlbnMgfCBBbnlUZXN0Rm4sXG4gICAgICAgICAgICAgICAgICAgIHRpbWVPdXQ6IG51bWJlciA9IG51bGwpOiB2b2lkIHtcbiAgcmV0dXJuIF9pdChqc21JSXQsIG5hbWUsIGZuLCB0aW1lT3V0KTtcbn1cbiJdfQ==