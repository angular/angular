export var describe = window.describe;
export var xdescribe = window.xdescribe;
export var ddescribe = window.ddescribe;
export var it = window.it;
export var xit = window.xit;
export var iit = window.iit;
export var beforeEach = window.beforeEach;
export var afterEach = window.afterEach;
export var expect = window.expect;
export var IS_DARTIUM = false;

// To make testing consistent between dart and js
window.print = function(msg) {
  if (window.dump) {
    window.dump(msg);
  } else {
    window.console.log(msg);
  }
};

window.beforeEach(function() {
  jasmine.addMatchers({
    // Custom handler for Map to give nice error messages in JavaScript
    toEqual: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          var pass;
          if (actual instanceof Map) {
            pass = actual.size === expected.size;
            if (pass) {
              actual.forEach( (v,k) => {
                pass = pass && util.equals(v, expected.get(k));
              });
            }
            return {
              pass: pass,
              get message() {
                return `Expected ${mapToString(actual)} ${(pass ? 'not' : '')} to equal to ${mapToString(expected)}`;
              }
            };
          } else {
            return {
              pass: util.equals(actual, expected)
            }
          }
        }
      };
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
    }
  });
});


function mapToString(m) {
  if (!m) {
    return ''+m;
  }
  var res = [];
  m.forEach( (v,k) => {
    res.push(`${k}:${v}`);
  });
  return `{ ${res.join(',')} }`;
}