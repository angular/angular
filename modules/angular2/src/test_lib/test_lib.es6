import {DOM} from 'angular2/src/dom/dom_adapter';
import {StringMapWrapper} from 'angular2/src/facade/collection';

import {bind} from 'angular2/di';

import {createTestInjector, FunctionWithParamTokens, inject} from './test_injector';

export {inject} from './test_injector';

export {proxy} from 'rtts_assert/rtts_assert';

var _global = typeof window === 'undefined' ? global : window;

export var afterEach = _global.afterEach;
export var expect = _global.expect;

export var IS_DARTIUM = false;

export class AsyncTestCompleter {
  _done: Function;

  constructor(done: Function) {
    this._done = done;
  }

  done() {
    this._done();
  }
}

var jsmBeforeEach = _global.beforeEach;
var jsmDescribe = _global.describe;
var jsmDDescribe = _global.ddescribe;
var jsmXDescribe = _global.xdescribe;
var jsmIt = _global.it;
var jsmIIt = _global.iit;
var jsmXIt = _global.xit;

var runnerStack = [];
var inIt = false;

var testBindings;

class BeforeEachRunner {
  constructor(parent: BeforeEachRunner) {
    this._fns = [];
    this._parent = parent;
  }

  beforeEach(fn: FunctionWithParamTokens) {
    this._fns.push(fn);
  }

  run(injector) {
    if (this._parent) this._parent.run();
    this._fns.forEach((fn) => fn.execute(injector));
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

export function beforeEach(fn) {
  if (runnerStack.length > 0) {
    // Inside a describe block, beforeEach() uses a BeforeEachRunner
    var runner = runnerStack[runnerStack.length - 1];
    if (!(fn instanceof FunctionWithParamTokens)) {
      fn = inject([], fn);
    }
    runner.beforeEach(fn);
  } else {
    // Top level beforeEach() are delegated to jasmine
    jsmBeforeEach(fn);
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

function _it(jsmFn, name, fn) {
  var runner = runnerStack[runnerStack.length - 1];

  jsmFn(name, function(done) {
    var async = false;

    var completerBinding = bind(AsyncTestCompleter).toFactory(() => {
      // Mark the test as async when an AsyncTestCompleter is injected in an it()
      if (!inIt) throw new Error('AsyncTestCompleter can only be injected in an "it()"');
      async = true;
      return new AsyncTestCompleter(done);
    });

    var injector = createTestInjector([...testBindings, completerBinding]);

    runner.run(injector);

    if (!(fn instanceof FunctionWithParamTokens)) {
      fn = inject([], fn);
    }
    inIt = true;
    fn.execute(injector);
    inIt = false;

    if (!async) done();
  });
}

export function it(name, fn) {
  return _it(jsmIt, name, fn);
}

export function xit(name, fn) {
  return _it(jsmXIt, name, fn);
}

export function iit(name, fn) {
  return _it(jsmIIt, name, fn);
}

// To make testing consistent between dart and js
_global.print = function(msg) {
  if (_global.dump) {
    _global.dump(msg);
  } else {
    _global.console.log(msg);
  }
};

// Some Map polyfills don't polyfill Map.toString correctly, which
// gives us bad error messages in tests.
// The only way to do this in Jasmine is to monkey patch a method
// to the object :-(
_global.Map.prototype.jasmineToString = function() {
  var m = this;
  if (!m) {
    return ''+m;
  }
  var res = [];
  m.forEach( (v,k) => {
    res.push(`${k}:${v}`);
  });
  return `{ ${res.join(',')} }`;
}

_global.beforeEach(function() {
  jasmine.addMatchers({
    // Custom handler for Map as Jasmine does not support it yet
    toEqual: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          return {
            pass: util.equals(actual, expected, [compareMap])
          };
        }
      };

      function compareMap(actual, expected) {
        if (actual instanceof Map) {
          var pass = actual.size === expected.size;
          if (pass) {
            actual.forEach( (v,k) => {
              pass = pass && util.equals(v, expected.get(k));
            });
          }
          return pass;
        } else {
          return undefined;
        }
      }
    },

    toBePromise: function() {
      return {
        compare: function (actual, expectedClass) {
          var pass = typeof actual === 'object' && typeof actual.then === 'function';
          return {
            pass: pass,
            get message() {
              return 'Expected ' + actual + ' to be a promise';
            }
          };
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
            get message() {
              return 'Expected ' + actualText + ' to be equal to ' + expectedText;
            }
          };
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
              return 'Expected ' + actualObject + ' to have the following methods: ' + missedMethods.join(", ");
            }
          };
        }
      };
    }
  });
});

export class SpyObject {
  constructor(type = null) {
    if (type) {
      for (var prop in type.prototype) {
        var m = type.prototype[prop];
        if (typeof m === 'function') {
          this.spy(prop);
        }
      }
    }
  }
  spy(name){
    if (! this[name]) {
      this[name] = this._createGuinnessCompatibleSpy();
    }
    return this[name];
  }

  static stub(object = null, config = null, overrides = null) {
    if (!(object instanceof SpyObject)) {
      overrides = config;
      config = object;
      object = new SpyObject();
    }

    var m = StringMapWrapper.merge(config, overrides);
    StringMapWrapper.forEach(m, (value, key) => {
      object.spy(key).andReturn(value);
    });
    return object;
  }

  rttsAssert(value) {
    return true;
  }

  _createGuinnessCompatibleSpy(){
    var newSpy = jasmine.createSpy();
    newSpy.andCallFake = newSpy.and.callFake;
    newSpy.andReturn = newSpy.and.returnValue;
    // return null by default to satisfy our rtts asserts
    newSpy.and.returnValue(null);
    return newSpy;
  }
}

function elementText(n) {
  var hasNodes = (n) => {var children = DOM.childNodes(n); return children && children.length > 0;}

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
