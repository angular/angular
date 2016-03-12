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

var _global = <any>(typeof window === 'undefined' ? global : window);

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

class AsyncTestZoneSpec implements ZoneSpec {
  _finishCallback: Function;
  _failCallback: Function;
  _pendingMicroTasks: boolean = false;
  _pendingMacroTasks: boolean = false;
  _pendingEventTasks: boolean = false;

  constructor(finishCallback: Function, failCallback: Function, namePrefix: string) {
    this._finishCallback = finishCallback;
    this._failCallback = failCallback;
    this.name = 'asyncTestZone for ' + namePrefix;
  }

  _finishCallbackIfDone() {
    if (!(this._pendingMicroTasks || this._pendingMacroTasks || this._pendingEventTasks)) {
      this._finishCallback();
    }
  }

  // ZoneSpec implementation below.

  name: string = 'asyncTestZone';

  onInvoke(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
           delegate: Function, applyThis: any, applyArgs: any[], source: string): any {
    try {
      return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
    } finally {
      this._finishCallbackIfDone();
    }
  }

  onInvokeTask(delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any,
               applyArgs: any): any {
    try {
      return delegate.invokeTask(target, task, applyThis, applyArgs);
    } finally {
      this._finishCallbackIfDone();
    }
  };

  onHandleError(parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone,
                error: any): boolean {
    // Let the parent try to handle it.
    var result = parentZoneDelegate.handleError(targetZone, error);
    if (result) {
      console.log(error.message);
      console.log(error.stack);
      this._failCallback(error.message ? error.message : 'unknown error');
    }
    return false;
  }

  onScheduleTask(delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task): Task {
    if (task.type == 'macroTask' && task.source == 'setInterval') {
      this._failCallback('Cannot use setInterval from within an async zone test.');
      // TODO(juliemr): any other cleanup we want to handle here?
      return;
    }

    return delegate.scheduleTask(targetZone, task);
  }

  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) {
    delegate.hasTask(target, hasTaskState);

    if (hasTaskState.change == 'microTask') {
      this._pendingMicroTasks = hasTaskState.microTask;
      this._finishCallbackIfDone();
    } else if (hasTaskState.change == 'macroTask') {
      this._pendingMicroTasks = hasTaskState.macroTask;
      this._finishCallbackIfDone();
    } else if (hasTaskState.change == 'eventTask') {
      this._finishCallbackIfDone();
    }
  }
}

function runInTestZone(fnToExecute, finishCallback: Function, failCallback: Function, testName = ""): any {
  var testZoneSpec = new AsyncTestZoneSpec(finishCallback, failCallback, testName);

  var testZone = global.Zone.current.fork(testZoneSpec);
  return testZone.run(fnToExecute);  // runGuarded?
}

function _it(jsmFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn,
             testTimeOut: number): void {
  var timeOut = testTimeOut;

  if (testFn instanceof FunctionWithParamTokens) {
    jsmFn(name, (done) => {
      if (testFn.isAsync) {
        runInTestZone(() => testInjector.execute(testFn), done, done.fail, name);

      } else {
        testInjector.execute(testFn);
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
      if (fn.isAsync) {
        runInTestZone(() => testInjector.execute(fn), done, done.fail);
      } else {
        testInjector.execute(fn);
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
