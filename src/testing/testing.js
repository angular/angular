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
exports.afterEach = _global.afterEach;
exports.describe = _global.describe;
exports.ddescribe = _global.fdescribe;
exports.fdescribe = _global.fdescribe;
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
 * defined in test_injector.js.
 *
 * The given function must return a list of DI providers.
 *
 * Example:
 *
 *   beforeEachProviders(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
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
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `it('test', inject([ClassA], (a) => { ...
        // }));`
        if (testFn.isAsync) {
            jsmFn(name, function (done) {
                if (!injector) {
                    injector = test_injector_1.createTestInjector(testProviders);
                }
                var returned = testFn.execute(injector);
                if (_isPromiseLike(returned)) {
                    returned.then(done, done.fail);
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returned);
                }
            }, timeOut);
        }
        else {
            jsmFn(name, function () {
                if (!injector) {
                    injector = test_injector_1.createTestInjector(testProviders);
                }
                var returned = testFn.execute(injector);
                if (_isPromiseLike(returned)) {
                    throw new Error('inject returned a promise. Did you mean to use injectAsync?');
                }
                ;
            });
        }
    }
    else {
        // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`
        jsmFn(name, testFn, timeOut);
    }
}
function beforeEach(fn) {
    if (fn instanceof test_injector_1.FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        if (fn.isAsync) {
            jsmBeforeEach(function (done) {
                if (!injector) {
                    injector = test_injector_1.createTestInjector(testProviders);
                }
                var returned = fn.execute(injector);
                if (_isPromiseLike(returned)) {
                    returned.then(done, done.fail);
                }
                else {
                    done.fail('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: ' + returned);
                }
            });
        }
        else {
            jsmBeforeEach(function () {
                if (!injector) {
                    injector = test_injector_1.createTestInjector(testProviders);
                }
                var returned = fn.execute(injector);
                if (_isPromiseLike(returned)) {
                    throw new Error('inject returned a promise. Did you mean to use injectAsync?');
                }
                ;
            });
        }
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
function it(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIt, name, fn, timeOut);
}
exports.it = it;
function xit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmXIt, name, fn, timeOut);
}
exports.xit = xit;
function iit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.iit = iit;
function fit(name, fn, timeOut) {
    if (timeOut === void 0) { timeOut = null; }
    return _it(jsmIIt, name, fn, timeOut);
}
exports.fit = fit;
//# sourceMappingURL=testing.js.map