/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
import {global} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {bind} from 'angular2/core';

import {
  createTestInjectorWithRuntimeCompiler,
  FunctionWithParamTokens,
  inject,
  injectAsync
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

var testProviders;
var injector;

// Reset the test providers before each test.
jsmBeforeEach(() => {
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
export function beforeEachProviders(fn): void {
  jsmBeforeEach(() => {
    var providers = fn();
    if (!providers) return;
    testProviders = [...testProviders, ...providers];
    if (injector !== null) {
      throw new Error('beforeEachProviders was called after the injector had ' +
                      'been used in a beforeEach or it block. This invalidates the ' +
                      'test injector');
    }
  });
}

function _isPromiseLike(input): boolean {
  return input && !!(input.then);
}

function runInTestZone(fnToExecute, finishCallback, failCallback): any {
  var pendingMicrotasks = 0;
  var pendingTimeouts = [];

  var ngTestZone = (<Zone>global.zone)
                       .fork({
                         onError: function(e) { failCallback(e); },
                         '$run': function(parentRun) {
                           return function() {
                             try {
                               return parentRun.apply(this, arguments);
                             } finally {
                               if (pendingMicrotasks == 0 && pendingTimeouts.length == 0) {
                                 finishCallback();
                               }
                             }
                           };
                         },
                         '$scheduleMicrotask': function(parentScheduleMicrotask) {
                           return function(fn) {
                             pendingMicrotasks++;
                             var microtask = function() {
                               try {
                                 fn();
                               } finally {
                                 pendingMicrotasks--;
                               }
                             };
                             parentScheduleMicrotask.call(this, microtask);
                           };
                         },
                         '$setTimeout': function(parentSetTimeout) {
                           return function(fn: Function, delay: number, ...args) {
                             var id;
                             var cb = function() {
                               fn();
                               ListWrapper.remove(pendingTimeouts, id);
                             };
                             id = parentSetTimeout(cb, delay, args);
                             pendingTimeouts.push(id);
                             return id;
                           };
                         },
                         '$clearTimeout': function(parentClearTimeout) {
                           return function(id: number) {
                             parentClearTimeout(id);
                             ListWrapper.remove(pendingTimeouts, id);
                           };
                         },
                       });

  return ngTestZone.run(fnToExecute);
}

function _it(jsmFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn,
             testTimeOut: number): void {
  var timeOut = testTimeOut;

  if (testFn instanceof FunctionWithParamTokens) {
    jsmFn(name, (done) => {
      if (!injector) {
        injector = createTestInjectorWithRuntimeCompiler(testProviders);
      }

      var finishCallback = () => {
        // Wait one more event loop to make sure we catch unreturned promises and
        // promise rejections.
        setTimeout(done, 0);
      };
      var returnedTestValue =
          runInTestZone(() => testFn.execute(injector), finishCallback, done.fail);

      if (testFn.isAsync) {
        if (_isPromiseLike(returnedTestValue)) {
          (<Promise<any>>returnedTestValue).then(null, (err) => { done.fail(err); });
        } else {
          done.fail('Error: injectAsync was expected to return a promise, but the ' +
                    ' returned value was: ' + returnedTestValue);
        }
      } else {
        if (!(returnedTestValue === undefined)) {
          done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                    'value was: ' + returnedTestValue);
        }
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
      var finishCallback = () => {
        // Wait one more event loop to make sure we catch unreturned promises and
        // promise rejections.
        setTimeout(done, 0);
      };
      if (!injector) {
        injector = createTestInjectorWithRuntimeCompiler(testProviders);
      }

      var returnedTestValue = runInTestZone(() => fn.execute(injector), finishCallback, done.fail);
      if (fn.isAsync) {
        if (_isPromiseLike(returnedTestValue)) {
          (<Promise<any>>returnedTestValue).then(null, (err) => { done.fail(err); });
        } else {
          done.fail('Error: injectAsync was expected to return a promise, but the ' +
                    ' returned value was: ' + returnedTestValue);
        }
      } else {
        if (!(returnedTestValue === undefined)) {
          done.fail('Error: inject returned a value. Did you mean to use injectAsync? Returned ' +
                    'value was: ' + returnedTestValue);
        }
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
