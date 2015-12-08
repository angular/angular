/**
 * Public Test Library for unit testing Angular2 Applications. Uses the
 * Jasmine framework.
 */
import {global} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {bind} from 'angular2/src/core/di';

import {
  createTestInjectorWithRuntimeCompiler,
  FunctionWithParamTokens,
  inject
} from './test_injector';

export {inject} from './test_injector';

export {expect, NgMatchers} from './matchers';

var _global: jasmine.GlobalPolluter = <any>(typeof window === 'undefined' ? global : window);

/**
 * See http://jasmine.github.io/
 */
export var afterEach: Function = _global.afterEach;

/**
 * See http://jasmine.github.io/
 */
export var describe: Function = _global.describe;

/**
 * See http://jasmine.github.io/
 */
export var ddescribe: Function = _global.fdescribe;

/**
 * See http://jasmine.github.io/
 */
export var fdescribe: Function = _global.fdescribe;

/**
 * See http://jasmine.github.io/
 */
export var xdescribe: Function = _global.xdescribe;

export type SyncTestFn = () => void;
export type AsyncTestFn = (done: () => void) => void;
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
 * Example:
 *
 * ```
 *   beforeEachProviders(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 * ```
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

      var returnedTestValue = runInTestZone(() => testFn.execute(injector), done, done.fail);
      if (_isPromiseLike(returnedTestValue)) {
        (<Promise<any>>returnedTestValue).then(null, (err) => { done.fail(err); });
      }
    }, timeOut);
  } else {
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
export function beforeEach(fn: FunctionWithParamTokens | AnyTestFn): void {
  if (fn instanceof FunctionWithParamTokens) {
    // The test case uses inject(). ie `beforeEach(inject([ClassA], (a) => { ...
    // }));`

    jsmBeforeEach((done) => {
      if (!injector) {
        injector = createTestInjectorWithRuntimeCompiler(testProviders);
      }

      runInTestZone(() => fn.execute(injector), done, done.fail);
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
 * Wrapper around Jasmine it function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export function it(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                   timeOut: number = null): void {
  return _it(jsmIt, name, fn, timeOut);
}

/**
 * Wrapper around Jasmine xit (skipped it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export function xit(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                    timeOut: number = null): void {
  return _it(jsmXIt, name, fn, timeOut);
}

/**
 * Wrapper around Jasmine iit (focused it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export function iit(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                    timeOut: number = null): void {
  return _it(jsmIIt, name, fn, timeOut);
}

/**
 * Wrapper around Jasmine fit (focused it) function.
 * See http://jasmine.github.io/
 *
 * it may be used with the `inject` function to fetch dependencies.
 * The test will automatically wait for any asynchronous calls inside the
 * injected test function to complete.
 */
export function fit(name: string, fn: FunctionWithParamTokens | AnyTestFn,
                    timeOut: number = null): void {
  return _it(jsmIIt, name, fn, timeOut);
}
