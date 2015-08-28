/// <reference path="../../typings/jasmine/jasmine.d.ts"/>

import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {global, isFunction} from 'angular2/src/core/facade/lang';
import {NgZoneZone} from 'angular2/src/core/zone/ng_zone';

import {bind} from 'angular2/di';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';

import {createTestInjector, FunctionWithParamTokens, inject} from './test_injector';

export {inject} from './test_injector';

export var proxy: ClassDecorator = (t) => t;

var _global: jasmine.GlobalPolluter = <any>(typeof window === 'undefined' ? global : window);

export var afterEach = _global.afterEach;

type SyncTestFn = () => void;
type AsyncTestFn = (done: () => void) => void;
type AnyTestFn = SyncTestFn | AsyncTestFn;

export interface NgMatchers extends jasmine.Matchers {
  toBe(expected: any): boolean;
  toEqual(expected: any): boolean;
  toBePromise(): boolean;
  toBeAnInstanceOf(expected: any): boolean;
  toHaveText(expected: any): boolean;
  toHaveCssClass(expected: any): boolean;
  toImplement(expected: any): boolean;
  toContainError(expected: any): boolean;
  toThrowErrorWith(expectedMessage: any): boolean;
  not: NgMatchers;
}

export var expect: (actual: any) => NgMatchers = <any>_global.expect;

export class AsyncTestCompleter {
  constructor(private _done: Function) {}

  done(): void { this._done(); }
}

var jsmBeforeEach = _global.beforeEach;
var jsmDescribe = _global.describe;
var jsmDDescribe = _global.fdescribe;
var jsmXDescribe = _global.xdescribe;
var jsmIt = _global.it;
var jsmIIt = _global.fit;
var jsmXIt = _global.xit;

var runnerStack = [];
var inIt = false;

var testBindings;

/**
 * Mechanism to run `beforeEach()` functions of Angular tests.
 *
 * Note: Jasmine own `beforeEach` is used by this library to handle DI bindings.
 */
class BeforeEachRunner {
  private _fns: Array<FunctionWithParamTokens | SyncTestFn> = [];

  constructor(private _parent: BeforeEachRunner) {}

  beforeEach(fn: FunctionWithParamTokens | SyncTestFn): void { this._fns.push(fn); }

  run(injector): void {
    if (this._parent) this._parent.run(injector);
    this._fns.forEach((fn) => {
      return isFunction(fn) ? (<SyncTestFn>fn)() : (<FunctionWithParamTokens>fn).execute(injector);
    });
  }
}

// Reset the test bindings before each test
jsmBeforeEach(() => { testBindings = []; });

function _describe(jsmFn, ...args) {
  var parentRunner = runnerStack.length === 0 ? null : runnerStack[runnerStack.length - 1];
  var runner = new BeforeEachRunner(parentRunner);
  runnerStack.push(runner);
  var suite = jsmFn(...args);
  runnerStack.pop();
  return suite;
}

export function describe(...args) {
  return _describe(jsmDescribe, ...args);
}

export function ddescribe(...args) {
  return _describe(jsmDDescribe, ...args);
}

export function xdescribe(...args) {
  return _describe(jsmXDescribe, ...args);
}

export function beforeEach(fn: FunctionWithParamTokens | SyncTestFn) {
  if (runnerStack.length > 0) {
    // Inside a describe block, beforeEach() uses a BeforeEachRunner
    runnerStack[runnerStack.length - 1].beforeEach(fn);
  } else {
    // Top level beforeEach() are delegated to jasmine
    jsmBeforeEach(<SyncTestFn>fn);
  }
}

/**
 * Allows overriding default bindings defined in test_injector.js.
 *
 * The given function must return a list of DI bindings.
 *
 * Example:
 *
 *   beforeEachBindings(() => [
 *     bind(Compiler).toClass(MockCompiler),
 *     bind(SomeToken).toValue(myValue),
 *   ]);
 */
export function beforeEachBindings(fn) {
  jsmBeforeEach(() => {
    var bindings = fn();
    if (!bindings) return;
    testBindings = [...testBindings, ...bindings];
  });
}

function _it(jsmFn: Function, name: string, testFn: FunctionWithParamTokens | AnyTestFn,
             timeOut: number) {
  var runner = runnerStack[runnerStack.length - 1];

  if (testFn instanceof FunctionWithParamTokens) {
    // The test case uses inject(). ie `it('test', inject([AsyncTestCompleter], (async) => { ...
    // }));`

    if (testFn.hasToken(AsyncTestCompleter)) {
      jsmFn(name, (done) => {
        var completerBinding =
            bind(AsyncTestCompleter)
                .toFactory(() => {
                  // Mark the test as async when an AsyncTestCompleter is injected in an it()
                  if (!inIt)
                    throw new Error('AsyncTestCompleter can only be injected in an "it()"');
                  return new AsyncTestCompleter(done);
                });

        var injector = createTestInjector([...testBindings, completerBinding]);
        runner.run(injector);

        inIt = true;
        testFn.execute(injector);
        inIt = false;
      }, timeOut);
    } else {
      jsmFn(name, () => {
        var injector = createTestInjector(testBindings);
        runner.run(injector);
        testFn.execute(injector);
      }, timeOut);
    }

  } else {
    // The test case doesn't use inject(). ie `it('test', (done) => { ... }));`

    if ((<any>testFn).length === 0) {
      jsmFn(name, () => {
        var injector = createTestInjector(testBindings);
        runner.run(injector);
        (<SyncTestFn>testFn)();
      }, timeOut);
    } else {
      jsmFn(name, (done) => {
        var injector = createTestInjector(testBindings);
        runner.run(injector);
        (<AsyncTestFn>testFn)(done);
      }, timeOut);
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

// Some Map polyfills don't polyfill Map.toString correctly, which
// gives us bad error messages in tests.
// The only way to do this in Jasmine is to monkey patch a method
// to the object :-(
Map.prototype['jasmineToString'] = function() {
  var m = this;
  if (!m) {
    return '' + m;
  }
  var res = [];
  m.forEach((v, k) => { res.push(`${k}:${v}`); });
  return `{ ${res.join(',')} }`;
};

_global.beforeEach(function() {
  jasmine.addMatchers({
    // Custom handler for Map as Jasmine does not support it yet
    toEqual: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          return {pass: util.equals(actual, expected, [compareMap])};
        }
      };

      function compareMap(actual, expected) {
        if (actual instanceof Map) {
          var pass = actual.size === expected.size;
          if (pass) {
            actual.forEach((v, k) => { pass = pass && util.equals(v, expected.get(k)); });
          }
          return pass;
        } else {
          return undefined;
        }
      }
    },

    toBePromise: function() {
      return {
        compare: function(actual, expectedClass) {
          var pass = typeof actual === 'object' && typeof actual.then === 'function';
          return {pass: pass, get message() { return 'Expected ' + actual + ' to be a promise'; }};
        }
      };
    },

    toBeAnInstanceOf: function() {
      return {
        compare: function(actual, expectedClass) {
          var pass = typeof actual === 'object' && actual instanceof expectedClass;
          return {
            pass: pass,
            get message() {
              return 'Expected ' + actual + ' to be an instance of ' + expectedClass;
            }
          };
        }
      };
    },

    toHaveText: function() {
      return {
        compare: function(actual, expectedText) {
          var actualText = elementText(actual);
          return {
            pass: actualText == expectedText,
            get message() { return 'Expected ' + actualText + ' to be equal to ' + expectedText; }
          };
        }
      };
    },

    toHaveCssClass: function() {
      return {compare: buildError(false), negativeCompare: buildError(true)};

      function buildError(isNot) {
        return function(actual, className) {
          return {
            pass: DOM.hasClass(actual, className) == !isNot,
            get message() {
              return `Expected ${actual.outerHTML} ${isNot ? 'not ' : ''}to contain the CSS class "${className}"`;
            }
          };
        };
      }
    },

    toContainError: function() {
      return {
        compare: function(actual, expectedText) {
          var errorMessage = ExceptionHandler.exceptionToString(actual);
          return {
            pass: errorMessage.indexOf(expectedText) > -1,
            get message() { return 'Expected ' + errorMessage + ' to contain ' + expectedText; }
          };
        }
      };
    },

    toThrowErrorWith: function() {
      return {
        compare: function(actual, expectedText) {
          try {
            actual();
            return {
              pass: false,
              get message() { return "Was expected to throw, but did not throw"; }
            };
          } catch (e) {
            var errorMessage = ExceptionHandler.exceptionToString(e);
            return {
              pass: errorMessage.indexOf(expectedText) > -1,
              get message() { return 'Expected ' + errorMessage + ' to contain ' + expectedText; }
            };
          }
        }
      };
    },

    toImplement: function() {
      return {
        compare: function(actualObject, expectedInterface) {
          var objProps = Object.keys(actualObject.constructor.prototype);
          var intProps = Object.keys(expectedInterface.prototype);

          var missedMethods = [];
          intProps.forEach((k) => {
            if (!actualObject.constructor.prototype[k]) missedMethods.push(k);
          });

          return {
            pass: missedMethods.length == 0,
            get message() {
              return 'Expected ' + actualObject + ' to have the following methods: ' +
                     missedMethods.join(", ");
            }
          };
        }
      };
    }
  });
});

export interface GuinessCompatibleSpy extends jasmine.Spy {
  /** By chaining the spy with and.returnValue, all calls to the function will return a specific
   * value. */
  andReturn(val: any): void;
  /** By chaining the spy with and.callFake, all calls to the spy will delegate to the supplied
   * function. */
  andCallFake(fn: Function): GuinessCompatibleSpy;
  /** removes all recorded calls */
  reset();
}

export class SpyObject {
  constructor(type = null) {
    if (type) {
      for (var prop in type.prototype) {
        var m = null;
        try {
          m = type.prototype[prop];
        } catch (e) {
          // As we are creating spys for abstract classes,
          // these classes might have getters that throw when they are accessed.
          // As we are only auto creating spys for methods, this
          // should not matter.
        }
        if (typeof m === 'function') {
          this.spy(prop);
        }
      }
    }
  }
  // Noop so that SpyObject has the smae interface as in Dart
  noSuchMethod(args) {}

  spy(name) {
    if (!this[name]) {
      this[name] = this._createGuinnessCompatibleSpy(name);
    }
    return this[name];
  }

  prop(name, value) { this[name] = value; }

  static stub(object = null, config = null, overrides = null) {
    if (!(object instanceof SpyObject)) {
      overrides = config;
      config = object;
      object = new SpyObject();
    }

    var m = StringMapWrapper.merge(config, overrides);
    StringMapWrapper.forEach(m, (value, key) => { object.spy(key).andReturn(value); });
    return object;
  }

  rttsAssert(value) { return true; }

  _createGuinnessCompatibleSpy(name): GuinessCompatibleSpy {
    var newSpy: GuinessCompatibleSpy = <any>jasmine.createSpy(name);
    newSpy.andCallFake = <any>newSpy.and.callFake;
    newSpy.andReturn = <any>newSpy.and.returnValue;
    newSpy.reset = <any>newSpy.calls.reset;
    // return null by default to satisfy our rtts asserts
    newSpy.and.returnValue(null);
    return newSpy;
  }
}

function elementText(n) {
  var hasNodes = (n) => {
    var children = DOM.childNodes(n);
    return children && children.length > 0;
  };

  if (n instanceof Array) {
    return n.map((nn) => elementText(nn)).join("");
  }

  if (DOM.isCommentNode(n)) {
    return '';
  }

  if (DOM.isElementNode(n) && DOM.tagName(n) == 'CONTENT') {
    return elementText(Array.prototype.slice.apply(DOM.getDistributedNodes(n)));
  }

  if (DOM.hasShadowRoot(n)) {
    return elementText(DOM.childNodesAsList(DOM.getShadowRoot(n)));
  }

  if (hasNodes(n)) {
    return elementText(DOM.childNodesAsList(n));
  }

  return DOM.getText(n);
}

export function isInInnerZone(): boolean {
  return (<NgZoneZone>global.zone)._innerZone === true;
}
