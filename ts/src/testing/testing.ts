/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
import {global} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {bind} from 'angular2/core';

import {
  FunctionWithParamTokens,
  inject,
  injectAsync,
  TestInjector,
  getTestInjector
} from './test_injector';

export {inject, injectAsync} from './test_injector';

export {expect, NgMatchers} from './matchers';

var _global: jasmine.GlobalPolluter = <any>(typeof window === 'undefined' ? global : window);

/**
 * Run a function (with an optional asynchronous callback) after each test case.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='afterEach'}
 */
export var afterEach: Function = _global.afterEach;

/**
 * Group test cases together under a common description prefix.
 *
 * See http://jasmine.github.io/ for more details.
 *
 * ## Example:
 *
 * {@example testing/ts/testing.ts region='describeIt'}
 */
export var describe: Function = _global.describe;

/**
 * See {@link fdescribe}.
 */
export var ddescribe: Function = _global.fdescribe;

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
export var fdescribe: Function = _global.fdescribe;

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
export var xdescribe: Function = _global.xdescribe;

/**
 * Signature for a synchronous test function (no arguments).
 */
export type SyncTestFn = () => void;

/**
 * Signature for an asynchronous test function which takes a
 * `done` callback.
 */
export type AsyncTestFn = (done: () => void) => void;

/**
 * Signature for any simple testing function.
 */
export type AnyTestFn = SyncTestFn | AsyncTestFn;

var jsmBeforeEach = _global.beforeEach;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;

var testInjector: TestInjector = getTestInjector();

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
export function beforeEachProviders(fn): void {
  jsmBeforeEach(() => {
    var providers = fn();
    if (!providers) return;
    try {
      testInjector.addProviders(providers);
    } catch (e) {
      throw new Error('beforeEachProviders was called after the injector had ' +
                      'been used in a beforeEach or it block. This invalidates the ' +
                      'test injector');
    }
  });
}

function _isPromiseLike(input): boolean {
  return input && !!(input.then);
}

function _it(jsmFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn,
             testTimeOut: number): void {
  var timeOut = testTimeOut;

  if (testFn instanceof FunctionWithParamTokens) {
    jsmFn(name, (done) => {
      var returnedTestValue;
      try {
        returnedTestValue = testInjector.execute(testFn);
      } catch (err) {
        done.fail(err);
        return;
      }

      if (testFn.isAsync) {
        if (_isPromiseLike(returnedTestValue)) {
          (<Promise<any>>returnedTestValue).then(() => { done(); }, (err) => { done.fail(err); });
        } else {
          done.fail('Error: injectAsync was expected to return a promise, but the ' +
                    ' returned value was: ' + returnedTestValue);
        }
      } else {
        if (!(returnedTestValue === undefined)) {
          done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                    'value was: ' + returnedTestValue);
        }
        done();
      }
    }, timeOut);
  } else {
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
export function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void {
  if (fn instanceof FunctionWithParamTokens) {
    // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
    // }));`
    jsmBeforeEach((done) => {

      var returnedTestValue;
      try {
        returnedTestValue = testInjector.execute(fn);
      } catch (err) {
        done.fail(err);
        return;
      }
      if (fn.isAsync) {
        if (_isPromiseLike(returnedTestValue)) {
          (<Promise<any>>returnedTestValue).then(() => { done(); }, (err) => { done.fail(err); });
        } else {
          done.fail('Error: injectAsync was expected to return a promise, but the ' +
                    ' returned value was: ' + returnedTestValue);
        }
      } else {
        if (!(returnedTestValue === undefined)) {
          done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                    'value was: ' + returnedTestValue);
        }
        done();
      }
    });
  } else {
    // The test case doesn't use inject(). ie `beforeEach((done) => { ... }));`
    if ((<any>fn).length === 0) {
      jsmBeforeEach(() => { (<SyncTestFn>fn)(); });
    } else {
      jsmBeforeEach((done) => { (<AsyncTestFn>fn)(done); });
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
export function it(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                   timeOut: number = null): void {
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
export function xit(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                    timeOut: number = null): void {
  return _it(jsmXIt, name, fn, timeOut);
}

/**
 * See {@link fit}.
 */
export function iit(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                    timeOut: number = null): void {
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
export function fit(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                    timeOut: number = null): void {
  return _it(jsmIIt, name, fn, timeOut);
}
