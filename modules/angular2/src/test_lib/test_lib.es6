import {DOM} from 'angular2/src/dom/dom_adapter';

var _global = typeof window === 'undefined' ? global : window;

export {proxy} from 'rtts_assert/rtts_assert';
export var describe = _global.describe;
export var xdescribe = _global.xdescribe;
export var ddescribe = _global.ddescribe;
export var it = _global.it;
export var xit = _global.xit;
export var iit = _global.iit;
export var beforeEach = _global.beforeEach;
export var afterEach = _global.afterEach;
export var expect = _global.expect;
export var IS_DARTIUM = false;
export var IS_NODEJS = typeof window === 'undefined';

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
  spy(name){
    if (! this[name]) {
      this[name] = this._createGuinnessCompatibleSpy();
    }
    return this[name];
  }

  rttsAssert(value) {
    return true;
  }

  _createGuinnessCompatibleSpy(){
    var newSpy = jasmine.createSpy();
    newSpy.andCallFake = newSpy.and.callFake;
    return newSpy;
  }
}


function elementText(n) {
  var hasNodes = (n) => {var children = DOM.childNodes(n); return children && children.length > 0;}
  if (!IS_NODEJS) {
    if (n instanceof Comment)         return '';

    if (n instanceof Array)           return n.map((nn) => elementText(nn)).join("");
    if (n instanceof Element && DOM.tagName(n) == 'CONTENT')
      return elementText(Array.prototype.slice.apply(n.getDistributedNodes()));
    if (DOM.hasShadowRoot(n))             return elementText(DOM.childNodesAsList(n.shadowRoot));
    if (hasNodes(n))                  return elementText(DOM.childNodesAsList(n));

    return n.textContent;
  } else {
    if (n instanceof Array) {
      return n.map((nn) => elementText(nn)).join("");
    } else if (hasNodes(n)) {
      return elementText(DOM.childNodesAsList(n));
    } else {
      return DOM.getText(n);
    }
  }
}
