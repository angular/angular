import { global } from 'angular2/src/facade/lang';
import { createTestInjector, FunctionWithParamTokens } from './test_injector';
export { inject, injectAsync } from './test_injector';
export { expect } from './matchers';
var _global = (typeof window === 'undefined' ? global : window);
export var afterEach = _global.afterEach;
export var describe = _global.describe;
export var ddescribe = _global.fdescribe;
export var fdescribe = _global.fdescribe;
export var xdescribe = _global.xdescribe;
var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;
var testProviders;
var injector;
// Reset the test providers before each test.
jsmBeforeEach(() => {
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
export function beforeEachProviders(fn) {
    jsmBeforeEach(() => {
        var providers = fn();
        if (!providers)
            return;
        testProviders = [...testProviders, ...providers];
        if (injector !== null) {
            throw new Error('beforeEachProviders was called after the injector had ' +
                'been used in a beforeEach or it block. This invalidates the ' +
                'test injector');
        }
    });
}
function _isPromiseLike(input) {
    return input && !!(input.then);
}
function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `it('test', inject([ClassA], (a) => { ...
        // }));`
        if (testFn.isAsync) {
            jsmFn(name, (done) => {
                if (!injector) {
                    injector = createTestInjector(testProviders);
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
            jsmFn(name, () => {
                if (!injector) {
                    injector = createTestInjector(testProviders);
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
export function beforeEach(fn) {
    if (fn instanceof FunctionWithParamTokens) {
        // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
        // }));`
        if (fn.isAsync) {
            jsmBeforeEach((done) => {
                if (!injector) {
                    injector = createTestInjector(testProviders);
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
            jsmBeforeEach(() => {
                if (!injector) {
                    injector = createTestInjector(testProviders);
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
            jsmBeforeEach(() => { fn(); });
        }
        else {
            jsmBeforeEach((done) => { fn(done); });
        }
    }
}
export function it(name, fn, timeOut = null) {
    return _it(jsmIt, name, fn, timeOut);
}
export function xit(name, fn, timeOut = null) {
    return _it(jsmXIt, name, fn, timeOut);
}
export function iit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
export function fit(name, fn, timeOut = null) {
    return _it(jsmIIt, name, fn, timeOut);
}
//# sourceMappingURL=testing.js.map